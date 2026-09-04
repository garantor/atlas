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
import { FirstPersonController, type WalkState } from './FirstPersonController';
import type { FarmEcosystem, ViewState, Season, FarmInfrastructure } from '../data/types';

interface SceneCallbacks {
  onHotspotClick: (id: string) => void;
  onHotspotPositions: (positions: Map<string, { x: number; y: number; visible: boolean }>) => void;
  onWalkStateChange?: (state: WalkState) => void;
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
  private firstPersonController: FirstPersonController;
  private isFirstPerson = false;
  private callbacks: SceneCallbacks;
  private animationId: number | null = null;
  private lastTime = performance.now();
  private elapsedTime = 0;
  private currentFarmId: string | null = null;
  private currentFarm: FarmEcosystem | null = null;
  private currentSandboxConfig: { cropIds: string[]; livestockIds: string[] } | null = null;
  private currentAcreage = 2.47;
  private currentInfra: FarmInfrastructure = {
    roads: true,
    farmhouse: true,
    cctv: true,
    waterTower: true,
    solarArray: true,
    perimeterFence: true,
    dryingPatio: true,
  };
  private currentViewState: ViewState = 'macro';
  private resizeObserver: ResizeObserver | null = null;

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
    this.scene.fog = new THREE.FogExp2(0x060c08, 0.012);

    // ─── Camera ──────────────────────────────────────────────────────────────
    const initW = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
    const initH = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      42,
      initW / (initH || 1),
      0.1,
      2000
    );
    this.camera.position.set(9, 7, 11);

    // ─── Orbit Controls ──────────────────────────────────────────────────────
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 350;
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
    this.firstPersonController = new FirstPersonController(
      this.camera,
      canvas,
      (state) => callbacks.onWalkStateChange?.(state)
    );

    canvas.addEventListener('click', (e) => this.hotspotManager.handleClick(e));

    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas);
      if (canvas.parentElement) {
        this.resizeObserver.observe(canvas.parentElement);
      }
    }

    this.startLoop();
  }

  /**
   * Enter First-Person Walking Mode at 1.65m farmer eye level
   */
  enterWalkMode(startPos?: THREE.Vector3) {
    this.isFirstPerson = true;
    this.controls.enabled = false;
    const pos = startPos || new THREE.Vector3(0, 1.65, 5.0);
    this.firstPersonController.enable(pos, new THREE.Vector3(0, 1.65, 0));
  }

  /**
   * Exit Walk Mode back to Cinematic Orbit Controls
   */
  exitWalkMode() {
    this.isFirstPerson = false;
    this.firstPersonController.disable();
    this.controls.enabled = true;
    this.flyToPreset(this.currentAcreage >= 30 ? 'estate' : 'overview');
  }

  toggleWalkMode() {
    if (this.isFirstPerson) {
      this.exitWalkMode();
    } else {
      this.enterWalkMode();
    }
    return this.isFirstPerson;
  }

  /** Load and render a specific farm ecosystem */
  loadFarm(
    farm: FarmEcosystem,
    theme: 'light' | 'dark',
    acreage = this.currentAcreage,
    infrastructure = this.currentInfra
  ) {
    this.currentFarmId = farm.id;
    this.currentFarm = farm;
    this.currentAcreage = acreage;
    this.currentInfra = infrastructure;

    this.farmBuilder.clear();
    this.hotspotManager.clear();
    this.particleCycles.clear();

    this.farmRenderer.setFarmAcreage(acreage);
    const dim = this.farmRenderer.getEstateDimension(acreage);
    this.controls.maxDistance = Math.max(350, dim * 6);

    this.farmBuilder.build(farm, acreage, infrastructure);
    this.hotspotManager.loadHotspots(farm.hotspots);
    this.particleCycles.buildFlows(farm);
    this.farmRenderer.setFarmEnvironment(farm, theme);

    if (acreage >= 100) {
      this.flyToPreset('landscape');
    } else if (acreage >= 10) {
      this.flyToPreset('estate');
    } else {
      this.flyToPreset('overview');
    }
  }

  /** Dynamically render custom sandbox configuration in 3D display */
  loadCustomConfiguration(
    cropIds: string[],
    livestockIds: string[],
    _theme: 'light' | 'dark',
    acreage = this.currentAcreage,
    infrastructure = this.currentInfra
  ) {
    this.currentFarmId = 'custom-sandbox';
    this.currentFarm = null;
    this.currentSandboxConfig = { cropIds, livestockIds };
    this.currentAcreage = acreage;
    this.currentInfra = infrastructure;

    this.farmBuilder.clear();
    this.hotspotManager.clear();
    this.particleCycles.clear();

    this.farmRenderer.setFarmAcreage(acreage);
    const dim = this.farmRenderer.getEstateDimension(acreage);
    this.controls.maxDistance = Math.max(350, dim * 6);

    this.farmBuilder.buildCustom(cropIds, livestockIds, acreage, infrastructure);

    if (acreage >= 100) {
      this.flyToPreset('landscape');
    } else if (acreage >= 10) {
      this.flyToPreset('estate');
    } else {
      this.flyToPreset('overview');
    }
  }

  setFarmAcreage(acres: number) {
    this.currentAcreage = acres;
    this.farmRenderer.setFarmAcreage(acres);
    const dim = this.farmRenderer.getEstateDimension(acres);
    this.controls.maxDistance = Math.max(350, dim * 6);

    if (this.currentFarm) {
      this.farmBuilder.build(this.currentFarm, acres, this.currentInfra);
    } else if (this.currentSandboxConfig) {
      this.farmBuilder.buildCustom(
        this.currentSandboxConfig.cropIds,
        this.currentSandboxConfig.livestockIds,
        acres,
        this.currentInfra
      );
    }

    if (acres >= 100) {
      this.flyToPreset('landscape');
    } else if (acres >= 10) {
      this.flyToPreset('estate');
    } else {
      this.flyToPreset('overview');
    }
  }

  setInfrastructure(infra: FarmInfrastructure) {
    this.currentInfra = infra;
    this.farmBuilder.updateInfrastructure(infra);
  }

  /** Switch view state with GSAP camera animation */
  setViewState(viewState: ViewState, _theme: 'light' | 'dark') {
    if (this.currentViewState === viewState) return;
    this.currentViewState = viewState;

    this.farmBuilder.setViewState(viewState);
    this.particleCycles.setActive(viewState === 'cycles');

    switch (viewState) {
      case 'macro':
        this.flyToPreset(this.currentAcreage >= 30 ? 'estate' : 'overview');
        break;
      case 'subterranean':
        this.flyToPreset('subterranean');
        break;
      case 'cycles':
        this.flyToPreset('cycles');
        break;
    }
  }

  /** Fly camera to a named preset, scaling distance to estate dimensions */
  flyToPreset(preset: string) {
    const dim = this.farmRenderer.getEstateDimension(this.currentAcreage);
    const scale = Math.max(1.0, dim / 13.5);

    const presets: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      'overview':     { pos: new THREE.Vector3(9 * scale, 7 * scale, 11 * scale),   target: new THREE.Vector3(0, 0.6 * Math.min(scale, 2.0), 0) },
      'estate':       { pos: new THREE.Vector3(15 * scale, 12 * scale, 17 * scale), target: new THREE.Vector3(0, 0.8 * Math.min(scale, 2.0), 0) },
      'landscape':    { pos: new THREE.Vector3(22 * scale, 18 * scale, 25 * scale), target: new THREE.Vector3(0, 1.0 * Math.min(scale, 2.0), 0) },
      'satellite':    { pos: new THREE.Vector3(0.1, 38 * scale, 0.1), target: new THREE.Vector3(0, 0, 0) },
      'subterranean': { pos: new THREE.Vector3(5 * scale, -1.8 * scale, 9 * scale), target: new THREE.Vector3(0, -0.9 * scale, 0) },
      'cycles':       { pos: new THREE.Vector3(7 * scale, 5.5 * scale, 9 * scale),  target: new THREE.Vector3(0, 1.2, 0) },
      'top-down':     { pos: new THREE.Vector3(0, 18 * scale, 0.1), target: new THREE.Vector3(0, 0, 0) },
      'cocoa-closeup':{ pos: new THREE.Vector3(2.5, 2.2, 4.5), target: new THREE.Vector3(0, 1.2, 0) },
      'ground-layer': { pos: new THREE.Vector3(4, 1.2, 5.5),   target: new THREE.Vector3(0, 0.3, 0) },
    };

    const p = presets[preset] || presets['overview'];

    gsap.to(this.camera.position, {
      x: p.pos.x, y: p.pos.y, z: p.pos.z,
      duration: 1.6,
      ease: 'power3.inOut',
    });

    gsap.to(this.controls.target, {
      x: p.target.x, y: p.target.y, z: p.target.z,
      duration: 1.6,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.controls.update();
      },
    });
  }

  setFarmShape(shape: 'square' | 'circle') {
    this.farmRenderer.setFarmShape(shape, this.currentAcreage);
  }

  setSeason(season: Season) {
    this.farmRenderer.setSeason(season);
    this.farmBuilder.setSeason(season);
  }

  setTimeOfDay(hour: number) {
    this.farmRenderer.setTimeOfDay(hour);
  }

  setTheme(theme: 'light' | 'dark') {
    this.farmRenderer.setTheme(theme);
    const fogColor = theme === 'dark' ? 0x060c08 : 0xf4eee2;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.012);
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

      if (this.isFirstPerson) {
        this.firstPersonController.update(delta, this.farmBuilder.getInteractiveObjects());
      } else {
        this.controls.update();
      }

      this.particleCycles.update(delta);
      this.boidsSimulation.update(delta);
      this.farmBuilder.updateGrass(this.elapsedTime, this.farmRenderer.getSunPosition());
      updateWindUniforms(this.scene, this.elapsedTime);

      // Keep atmospheric skydome centered on camera so it never clips or runs out
      if (this.farmRenderer.skyDome) {
        this.farmRenderer.skyDome.position.copy(this.camera.position);
      }

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

  public resize() {
    const parent = this.canvas.parentElement;
    const w = this.canvas.clientWidth || parent?.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || parent?.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', () => this.resize());
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.controls.dispose();
    this.farmBuilder.dispose();
    this.particleCycles.dispose();
    this.boidsSimulation.dispose();
    this.renderer.dispose();
  }
}
