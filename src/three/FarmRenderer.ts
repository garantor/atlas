/**
 * Farm Atlas — FarmRenderer
 * Museum-grade lighting rig, pristine PBR diorama pedestal, and studio atmosphere.
 */

import * as THREE from 'three';
import type { FarmEcosystem, Season } from '../data/types';
import { getCleanPBR } from './CleanBotanicalModels';
import { getSoilTexture } from './TextureGenerator';

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

    // ─── 1. Studio Key Light (Soft Warm Sun with Clean Penumbra) ─────────────
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 3.0);
    this.sunLight.position.set(14, 20, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 15;
    this.sunLight.shadow.camera.bottom = -15;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.radius = 2.8;
    scene.add(this.sunLight);

    // ─── 2. Sky & Ambient Fill (Soft Diffuse Bounce) ──────────────────────────
    this.fillLight = new THREE.HemisphereLight(
      0xbae6fd,  // pristine soft sky blue
      0x14532d,  // rich forest ground bounce
      0.95
    );
    scene.add(this.fillLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(this.ambientLight);

    // ─── 3. Silhouette Rim Light (Clean Specular Contours) ───────────────────
    this.rimLight = new THREE.DirectionalLight(0xfef08a, 0.9);
    this.rimLight.position.set(-12, 14, -14);
    scene.add(this.rimLight);

    // ─── 4. Pristine PBR Diorama Pedestal with Organic Soil Texture ──────────
    const islandGeo = new THREE.CylinderGeometry(8.2, 8.4, 0.6, 64);
    islandGeo.computeVertexNormals();
    const soilTex = getSoilTexture(0x15803d);
    const islandMat = getCleanPBR({
      map: soilTex.map,
      bumpMap: soilTex.bumpMap,
      bumpScale: 0.05,
      roughness: 0.8,
      clearcoat: 0.15,
      clearcoatRoughness: 0.2,
    });
    this.islandMesh = new THREE.Mesh(islandGeo, islandMat);
    this.islandMesh.position.y = -0.3;
    this.islandMesh.receiveShadow = true;
    scene.add(this.islandMesh);

    // Soil Stratified Rim
    const rimGeo = new THREE.CylinderGeometry(8.4, 7.6, 1.2, 64);
    rimGeo.computeVertexNormals();
    const rimMat = getCleanPBR({
      color: 0x451a03,
      roughness: 0.9,
      clearcoat: 0.05,
    });
    this.islandRim = new THREE.Mesh(rimGeo, rimMat);
    this.islandRim.position.y = -1.1;
    this.islandRim.receiveShadow = true;
    scene.add(this.islandRim);

    // Soft Radial Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(22, 22);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
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

    const groundColors: Record<string, number> = {
      'rainforest': 0x14532d,
      'derived-savanna': 0x3f6212,
      'guinea-savanna': 0x854d0e,
      'swamp-forest': 0x064e3b,
      'aquatic': 0x0369a1,
    };

    const gc = groundColors[farm.biome] || 0x15803d;
    (this.islandMesh.material as THREE.MeshPhysicalMaterial).color.setHex(
      isWet ? gc : this.lightenHex(gc, 0.3)
    );
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    if (season === 'wet') {
      this.fillLight.color.setHex(0xbae6fd);
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 3.0;
      (this.islandMesh.material as THREE.MeshPhysicalMaterial).color.setHex(0x15803d);
    } else {
      this.fillLight.color.setHex(0xfde047);
      this.sunLight.color.setHex(0xfef08a);
      this.sunLight.intensity = 3.4;
      (this.islandMesh.material as THREE.MeshPhysicalMaterial).color.setHex(0x78350f);
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
      this.sunLight.color.setHex(0xf97316);
      this.sunLight.intensity = 0.9;
      this.ambientLight.intensity = 0.25;
    } else if (hour < 9 || hour > 16) {
      this.sunLight.color.setHex(0xfbbf24);
      this.sunLight.intensity = 2.2;
      this.ambientLight.intensity = 0.35;
    } else {
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 3.0;
      this.ambientLight.intensity = 0.4;
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background = new THREE.Color(0x060c08);
      this.fillLight.color.setHex(0x064e3b);
      this.fillLight.groundColor.setHex(0x022c22);
      this.fillLight.intensity = 0.75;
      this.ambientLight.intensity = 0.3;
      this.renderer.toneMappingExposure = 1.15;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.55;
    } else {
      this.scene.background = new THREE.Color(0xf6f2e8); // exact Seed Atlas warm paper ground
      this.fillLight.color.setHex(0xbae6fd);
      this.fillLight.groundColor.setHex(0x166534);
      this.fillLight.intensity = 1.0;
      this.ambientLight.intensity = 0.5;
      this.renderer.toneMappingExposure = 1.0;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.22;
    }
  }

  private lightenHex(hex: number, amount: number): number {
    const c = new THREE.Color(hex);
    c.lerp(new THREE.Color(0xffffff), amount);
    return c.getHex();
  }
}
