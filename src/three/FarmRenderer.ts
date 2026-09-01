/**
 * Farm Atlas — FarmRenderer
 * Lighting rig, sky, environment, tone mapping, season/time control
 */

import * as THREE from 'three';
import type { FarmEcosystem, Season } from '../data/types';

export class FarmRenderer {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  // Lights
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private fillLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;

  // Sky plane
  private skyMesh: THREE.Mesh | null = null;

  // Ground plane
  private groundMesh: THREE.Mesh;

  private currentSeason: Season = 'wet';
  private currentHour = 10;
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    // ─── Sun / Key Light ─────────────────────────────────────────────────────
    this.sunLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
    this.sunLight.position.set(10, 18, 8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 80;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.bias = -0.001;
    this.sunLight.shadow.radius = 3;
    scene.add(this.sunLight);

    // ─── Ambient / Sky ────────────────────────────────────────────────────────
    this.fillLight = new THREE.HemisphereLight(
      0x87ceeb,  // sky blue
      0x4a7c59,  // ground green
      0.8
    );
    scene.add(this.fillLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(this.ambientLight);

    // ─── Rim Light ────────────────────────────────────────────────────────────
    this.rimLight = new THREE.DirectionalLight(0xfff3cc, 0.6);
    this.rimLight.position.set(-8, 8, -10);
    scene.add(this.rimLight);

    // ─── Ground Plane ─────────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3a6b3a,
      roughness: 0.95,
      metalness: 0,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    scene.add(this.groundMesh);

    this.setTheme('dark');
    this.setTimeOfDay(10);
  }

  setFarmEnvironment(farm: FarmEcosystem, theme: 'light' | 'dark') {
    this.currentTheme = theme;
    const isWet = this.currentSeason === 'wet';

    // Accent the scene based on the farm's palette
    const accentColor = new THREE.Color(farm.accentColor);
    this.rimLight.color.copy(accentColor).lerp(new THREE.Color(0xffffff), 0.6);

    // Ground colour reflects biome
    const groundColors: Record<string, number> = {
      'rainforest': 0x2d5a27,
      'derived-savanna': 0x5a6b3a,
      'guinea-savanna': 0x8b7355,
      'swamp-forest': 0x1a4030,
      'aquatic': 0x1a3a5c,
    };

    const gc = groundColors[farm.biome] || 0x3a6b3a;
    (this.groundMesh.material as THREE.MeshStandardMaterial).color.setHex(
      isWet ? gc : this.lightenHex(gc, 0.35)
    );
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    if (season === 'wet') {
      this.fillLight.color.setHex(0x6baed6);
      this.sunLight.intensity = 2.2;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.setHex(0x2d5a27);
    } else {
      // Harmattan — golden dusty
      this.fillLight.color.setHex(0xc8a870);
      this.sunLight.color.setHex(0xffddaa);
      this.sunLight.intensity = 2.8;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.setHex(0x8b7a5a);
    }
  }

  setTimeOfDay(hour: number) {
    this.currentHour = hour;

    // Sun arc: angle 0–180° for hours 6–18
    const t = (hour - 6) / 12;
    const angle = t * Math.PI;

    const x = Math.cos(angle - Math.PI / 2) * 18;
    const y = Math.sin(angle) * 18 + 2;
    const z = 8;

    this.sunLight.position.set(x, Math.max(y, 0.5), z);

    // Colour temperature
    if (hour < 7 || hour > 18) {
      this.sunLight.color.setHex(0xff6030); // dawn/dusk red
      this.sunLight.intensity = 0.5;
      this.ambientLight.intensity = 0.1;
    } else if (hour < 9 || hour > 17) {
      this.sunLight.color.setHex(0xffb040); // golden hour
      this.sunLight.intensity = 1.5;
    } else {
      this.sunLight.color.setHex(0xfff5e0); // midday
      this.sunLight.intensity = 2.5;
      this.ambientLight.intensity = 0.2;
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background = new THREE.Color(0x0a1208);
      this.fillLight.color.setHex(0x1a3320);
      this.fillLight.groundColor.setHex(0x0d1a10);
      this.fillLight.intensity = 0.5;
      this.ambientLight.intensity = 0.15;
      this.renderer.toneMappingExposure = 1.1;
    } else {
      this.scene.background = new THREE.Color(0xd8ecd4);
      this.fillLight.color.setHex(0x87ceeb);
      this.fillLight.groundColor.setHex(0x5a8f5a);
      this.fillLight.intensity = 0.8;
      this.ambientLight.intensity = 0.3;
      this.renderer.toneMappingExposure = 0.9;
    }
  }

  private lightenHex(hex: number, amount: number): number {
    const c = new THREE.Color(hex);
    c.lerp(new THREE.Color(0xffffff), amount);
    return c.getHex();
  }
}
