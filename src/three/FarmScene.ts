/**
 * Farm Atlas — Three.js Farm Scene Manager
 * Render loop with procedural wind sway, GSAP camera animations,
 * dynamic shadows, and screen-space hotspot projections.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { FarmRenderer } from './FarmRenderer';
import { FarmBuilder } from './FarmBuilder';
import { ParticleCycles } from './ParticleCycles';
import { HotspotManager } from './HotspotManager';
import { BoidsSimulation } from './BoidsSimulation';
import { updateWindUniforms } from './WindShader';
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
  private boidsSimulation: BoidsSimulation;
  private callbacks: SceneCallbacks;
  private animationId: number | null = null;
  private lastTime = performance.now();
  private elapsedTime = 0;
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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ─── Scene & Atmosphere ──────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060c08, 0.015);

    // ─── Camera ──────────────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(
      42,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(9, 7, 11);

    // ─── Orbit Controls ──────────────────────────────────────────────────────
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 35;
    this.controls.target.set(0, 0.5, 0);

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
    this.boidsSimulation = new BoidsSimulation(this.scene, 16);

    canvas.addEventListener('click', (e) => this.hotspotManager.handleClick(e));

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.startLoop();
  }

  /** Load and render a specific farm ecosystem */
  loadFarm(farm: FarmEcosystem, theme: 'light' | 'dark') {
    this.currentFarmId = farm.id;

    this.farmBuilder.clear();
    this.hotspotManager.clear();
    this.particleCycles.clear();

    this.farmBuilder.build(farm);
    this.hotspotManager.loadHotspots(farm.hotspots);
    this.particleCycles.buildFlows(farm);
    this.farmRenderer.setFarmEnvironment(farm, theme);

    this.flyToPreset('overview');
  }

  /** Dynamically render custom sandbox configuration in 3D display */
  loadCustomConfiguration(cropIds: string[], livestockIds: string[], _theme: 'light' | 'dark') {
    this.currentFarmId = 'custom-sandbox';

    this.farmBuilder.clear();
    this.hotspotManager.clear();
    this.particleCycles.clear();

    this.farmBuilder.buildCustom(cropIds, livestockIds);
    this.flyToPreset('overview');
  }

  /** Switch view state with GSAP camera animation */
  setViewState(viewState: ViewState, _theme: 'light' | 'dark') {
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
  }

  /** Fly camera to a named preset */
  flyToPreset(preset: string) {
    const presets: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      'overview':     { pos: new THREE.Vector3(9, 7, 11),   target: new THREE.Vector3(0, 0.6, 0) },
      'subterranean': { pos: new THREE.Vector3(5, -1.8, 9), target: new THREE.Vector3(0, -0.9, 0) },
      'cycles':       { pos: new THREE.Vector3(7, 5.5, 9),  target: new THREE.Vector3(0, 1.2, 0) },
      'top-down':     { pos: new THREE.Vector3(0, 15, 0.1), target: new THREE.Vector3(0, 0, 0) },
      'cocoa-closeup':{ pos: new THREE.Vector3(2.5, 2.2, 4.5), target: new THREE.Vector3(0, 1.2, 0) },
      'ground-layer': { pos: new THREE.Vector3(4, 1.2, 5.5),   target: new THREE.Vector3(0, 0.3, 0) },
    };

    const p = presets[preset] || presets['overview'];

    gsap.to(this.camera.position, {
      x: p.pos.x, y: p.pos.y, z: p.pos.z,
      duration: 1.5,
      ease: 'power3.inOut',
    });

    gsap.to(this.controls.target, {
      x: p.target.x, y: p.target.y, z: p.target.z,
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.controls.update();
      },
    });
  }

  setFarmShape(shape: 'square' | 'circle') {
    this.farmRenderer.setFarmShape(shape);
  }

  setSeason(season: Season) {
    this.farmRenderer.setSeason(season);
  }

  setTimeOfDay(hour: number) {
    this.farmRenderer.setTimeOfDay(hour);
  }

  setTheme(theme: 'light' | 'dark') {
    this.farmRenderer.setTheme(theme);
    const fogColor = theme === 'dark' ? 0x060c08 : 0xf4eee2;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.015);
  }

  setLayerVisible(layer: string, visible: boolean) {
    this.farmBuilder.setLayerVisible(layer, visible);
  }

  private startLoop() {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      const now = performance.now();
      const delta = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.elapsedTime += delta;

      this.controls.update();
      this.particleCycles.update(delta);
      this.boidsSimulation.update(delta);
      updateWindUniforms(this.scene, this.elapsedTime);

      // Living wind sway on vegetation & fauna animation
      this.scene.traverse((obj) => {
        if (obj.userData.swayable) {
          const phase = (obj.userData.swayPhase || 0) + this.elapsedTime * 1.6;
          obj.rotation.z = Math.sin(phase) * 0.025;
          obj.rotation.x = Math.cos(phase * 0.8) * 0.018;
        }
        if (obj.userData.animType === 'chicken') {
          const animPhase = (obj.userData.animOffset || 0) + this.elapsedTime * 3.0;
          obj.rotation.x = Math.sin(animPhase) * 0.1;
        }
      });

      this.renderer.render(this.scene, this.camera);

      // Project hotspots to screen space
      const positions = this.hotspotManager.projectAll();
      this.callbacks.onHotspotPositions(positions);
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
  }

  dispose() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', () => this.resize());
    this.controls.dispose();
    this.farmBuilder.dispose();
    this.particleCycles.dispose();
    this.boidsSimulation.dispose();
    this.renderer.dispose();
  }
}
