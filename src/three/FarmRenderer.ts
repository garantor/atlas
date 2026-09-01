/**
 * Farm Atlas — FarmRenderer
 * Lighting rig, floating diorama pedestal, sky atmosphere, season/time control
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

  // Stylized Diorama Pedestal Plot
  private islandMesh: THREE.Mesh;
  private islandRim: THREE.Mesh;
  private shadowPlane: THREE.Mesh;

  private currentSeason: Season = 'wet';
  private currentHour = 10;
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    // ─── Sun / Key Light with Soft Shadows ───────────────────────────────────
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    this.sunLight.position.set(12, 18, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 60;
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.radius = 2.5;
    scene.add(this.sunLight);

    // ─── Sky / Fill Bounce Light ─────────────────────────────────────────────
    this.fillLight = new THREE.HemisphereLight(
      0x38bdf8,  // sky blue
      0x166534,  // ground forest green
      0.9
    );
    scene.add(this.fillLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(this.ambientLight);

    // ─── Rim Light (Warm Golden / Emerald Accent) ────────────────────────────
    this.rimLight = new THREE.DirectionalLight(0xfef08a, 0.8);
    this.rimLight.position.set(-10, 12, -12);
    scene.add(this.rimLight);

    // ─── Stylized Floating Diorama Pedestal ───────────────────────────────────
    // Top organic grass surface
    const islandGeo = new THREE.CylinderGeometry(8.2, 8.4, 0.6, 64);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.islandMesh = new THREE.Mesh(islandGeo, islandMat);
    this.islandMesh.position.y = -0.3;
    this.islandMesh.receiveShadow = true;
    scene.add(this.islandMesh);

    // Stratified soil bedrock rim
    const rimGeo = new THREE.CylinderGeometry(8.4, 7.6, 1.2, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.islandRim = new THREE.Mesh(rimGeo, rimMat);
    this.islandRim.position.y = -1.1;
    this.islandRim.receiveShadow = true;
    scene.add(this.islandRim);

    // Soft Contact Shadow Plane underneath
    const shadowGeo = new THREE.PlaneGeometry(24, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.72;
    scene.add(this.shadowPlane);

    this.setTheme('dark');
    this.setTimeOfDay(10);
  }

  setFarmEnvironment(farm: FarmEcosystem, theme: 'light' | 'dark') {
    this.currentTheme = theme;
    const isWet = this.currentSeason === 'wet';

    const accentColor = new THREE.Color(farm.accentColor);
    this.rimLight.color.copy(accentColor).lerp(new THREE.Color(0xffffff), 0.5);

    // Ground color palette reflecting specific agro-ecological zone
    const groundColors: Record<string, number> = {
      'rainforest': 0x14532d,
      'derived-savanna': 0x3f6212,
      'guinea-savanna': 0x854d0e,
      'swamp-forest': 0x064e3b,
      'aquatic': 0x0369a1,
    };

    const gc = groundColors[farm.biome] || 0x15803d;
    (this.islandMesh.material as THREE.MeshStandardMaterial).color.setHex(
      isWet ? gc : this.lightenHex(gc, 0.3)
    );
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    if (season === 'wet') {
      this.fillLight.color.setHex(0x38bdf8);
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 2.8;
      (this.islandMesh.material as THREE.MeshStandardMaterial).color.setHex(0x15803d);
    } else {
      // Harmattan — warm golden dusty glow
      this.fillLight.color.setHex(0xfde047);
      this.sunLight.color.setHex(0xfef08a);
      this.sunLight.intensity = 3.2;
      (this.islandMesh.material as THREE.MeshStandardMaterial).color.setHex(0x78350f);
    }
  }

  setTimeOfDay(hour: number) {
    this.currentHour = hour;

    const t = (hour - 6) / 12;
    const angle = t * Math.PI;

    const x = Math.cos(angle - Math.PI / 2) * 20;
    const y = Math.sin(angle) * 20 + 3;
    const z = 10;

    this.sunLight.position.set(x, Math.max(y, 1), z);

    if (hour < 7 || hour > 18) {
      this.sunLight.color.setHex(0xf97316); // dawn/dusk deep orange
      this.sunLight.intensity = 0.8;
      this.ambientLight.intensity = 0.2;
    } else if (hour < 9 || hour > 16) {
      this.sunLight.color.setHex(0xfbbf24); // golden hour
      this.sunLight.intensity = 2.0;
      this.ambientLight.intensity = 0.3;
    } else {
      this.sunLight.color.setHex(0xfff7ed); // bright tropical sun
      this.sunLight.intensity = 2.8;
      this.ambientLight.intensity = 0.35;
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background = new THREE.Color(0x060c08);
      this.fillLight.color.setHex(0x064e3b);
      this.fillLight.groundColor.setHex(0x022c22);
      this.fillLight.intensity = 0.7;
      this.ambientLight.intensity = 0.25;
      this.renderer.toneMappingExposure = 1.15;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.6;
    } else {
      this.scene.background = new THREE.Color(0xf4eee2);
      this.fillLight.color.setHex(0x38bdf8);
      this.fillLight.groundColor.setHex(0x166534);
      this.fillLight.intensity = 0.95;
      this.ambientLight.intensity = 0.45;
      this.renderer.toneMappingExposure = 0.95;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.2;
    }
  }

  private lightenHex(hex: number, amount: number): number {
    const c = new THREE.Color(hex);
    c.lerp(new THREE.Color(0xffffff), amount);
    return c.getHex();
  }
}
