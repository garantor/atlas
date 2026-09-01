/**
 * Farm Atlas — Three.js Farm Scene Manager
 * Owns the render loop, GSAP camera transitions, resize handling,
 * and coordinates the renderer, builder, and hotspot manager.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { FarmRenderer } from './FarmRenderer';
import { FarmBuilder } from './FarmBuilder';
import { ParticleCycles } from './ParticleCycles';
import { HotspotManager } from './HotspotManager';
import type { FarmEcosystem, ViewState, Season } from '../data/types';

interface SceneCallbacks {
  onHotspotClick: (id: string) => void;
  onHotspotPositions: (positions: Map<string, { x: number; y: number; visible: boolean }>) => void;
}

export class FarmScene {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private farmRenderer: FarmRenderer;
  private farmBuilder: FarmBuilder;
  private particleCycles: ParticleCycles;
  private hotspotManager: HotspotManager;
  private callbacks: SceneCallbacks;
  private animationId: number | null = null;
  private dirty = true;
  private clock = new THREE.Clock();
  private currentFarmId: string | null = null;
  private currentViewState: ViewState = 'macro';

  constructor(canvas: HTMLCanvasElement, callbacks: SceneCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    // ─── Renderer ────────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ─── Scene ───────────────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x111f14, 0.018);

    // ─── Camera ──────────────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(8, 6, 10);

    // ─── Controls ────────────────────────────────────────────────────────────
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 40;
    this.controls.target.set(0, 1, 0);
    this.controls.addEventListener('change', () => { this.dirty = true; });

    // ─── Sub-systems ─────────────────────────────────────────────────────────
    this.farmRenderer = new FarmRenderer(this.scene, this.renderer);
    this.farmBuilder = new FarmBuilder(this.scene);
    this.particleCycles = new ParticleCycles(this.scene);
    this.hotspotManager = new HotspotManager(
      this.scene,
      this.camera,
      this.renderer,
      (id) => callbacks.onHotspotClick(id)
    );

    // Attach canvas click → hotspot raycasting
    canvas.addEventListener('click', (e) => this.hotspotManager.handleClick(e));

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.startLoop();
  }

  /** Load and render a specific farm ecosystem */
  loadFarm(farm: FarmEcosystem, theme: 'light' | 'dark') {
    if (this.currentFarmId === farm.id) return;
    this.currentFarmId = farm.id;

    // Clear previous farm geometry
    this.farmBuilder.clear();
    this.hotspotManager.clear();
    this.particleCycles.clear();

    // Build new farm geometry
    this.farmBuilder.build(farm);

    // Set up hotspot markers
    this.hotspotManager.loadHotspots(farm.hotspots);

    // Set up particle flows
    this.particleCycles.buildFlows(farm);

    // Update environment for this farm
    this.farmRenderer.setFarmEnvironment(farm, theme);

    // Animate camera to overview position
    this.flyToPreset('overview');

    this.dirty = true;
  }

  /** Switch view state with GSAP camera animation */
  setViewState(viewState: ViewState, theme: 'light' | 'dark') {
    if (this.currentViewState === viewState) return;
    this.currentViewState = viewState;

    this.farmBuilder.setViewState(viewState);
    this.particleCycles.setActive(viewState === 'cycles');

    switch (viewState) {
      case 'macro':
        this.flyToPreset('overview');
        break;
      case 'subterranean':
        this.flyToPreset('subterranean');
        break;
      case 'cycles':
        this.flyToPreset('cycles');
        break;
    }

    this.dirty = true;
  }

  /** Fly camera to a named preset */
  flyToPreset(preset: string) {
    const presets: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      'overview':     { pos: new THREE.Vector3(8, 6, 10),  target: new THREE.Vector3(0, 1, 0) },
      'subterranean': { pos: new THREE.Vector3(4, -2, 8),  target: new THREE.Vector3(0, -1, 0) },
      'cycles':       { pos: new THREE.Vector3(6, 5, 8),   target: new THREE.Vector3(0, 1.5, 0) },
      'top-down':     { pos: new THREE.Vector3(0, 14, 0.1), target: new THREE.Vector3(0, 0, 0) },
      'cocoa-closeup':{ pos: new THREE.Vector3(2, 2, 4),   target: new THREE.Vector3(0, 1.2, 0) },
      'ground-layer': { pos: new THREE.Vector3(3, 1, 5),   target: new THREE.Vector3(0, 0.2, 0) },
    };

    const p = presets[preset] || presets['overview'];

    gsap.to(this.camera.position, {
      x: p.pos.x, y: p.pos.y, z: p.pos.z,
      duration: 1.6,
      ease: 'power3.inOut',
      onUpdate: () => { this.dirty = true; },
    });

    gsap.to(this.controls.target, {
      x: p.target.x, y: p.target.y, z: p.target.z,
      duration: 1.6,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.controls.update();
        this.dirty = true;
      },
    });
  }

  /** Update season — triggers environment change */
  setSeason(season: Season) {
    this.farmRenderer.setSeason(season);
    this.dirty = true;
  }

  /** Update time of day — moves sun */
  setTimeOfDay(hour: number) {
    this.farmRenderer.setTimeOfDay(hour);
    this.dirty = true;
  }

  /** Update theme */
  setTheme(theme: 'light' | 'dark') {
    this.farmRenderer.setTheme(theme);
    const fogColor = theme === 'dark' ? 0x111f14 : 0xd8ecd4;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.018);
    this.dirty = true;
  }

  /** Toggle a scene layer on/off */
  setLayerVisible(layer: string, visible: boolean) {
    this.farmBuilder.setLayerVisible(layer, visible);
    this.dirty = true;
  }

  private startLoop() {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();

      this.controls.update();

      const particlesDirty = this.particleCycles.update(delta);
      if (particlesDirty) this.dirty = true;

      if (this.dirty) {
        this.renderer.render(this.scene, this.camera);
        // Project hotspot positions to screen space
        const positions = this.hotspotManager.projectAll();
        this.callbacks.onHotspotPositions(positions);
        this.dirty = false;
      }
    };
    loop();
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  dispose() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', () => this.resize());
    this.controls.dispose();
    this.farmBuilder.dispose();
    this.particleCycles.dispose();
    this.renderer.dispose();
  }
}
