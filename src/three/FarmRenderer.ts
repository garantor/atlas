/**
 * Farm Atlas — FarmRenderer
 * Museum-grade lighting rig, configurable Square / Circle 1-Ha farm pedestal,
 * PBR soil stratigraphy, and atmospheric studio environment.
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

  // Plot Pedestal Meshes
  private islandMesh: THREE.Mesh;
  private islandRim: THREE.Mesh;
  private boundaryHedge: THREE.Group;
  private shadowPlane: THREE.Mesh;

  private currentShape: 'square' | 'circle' = 'square';
  private currentSeason: Season = 'wet';
  private currentHour = 10;
  private currentTheme: 'light' | 'dark' = 'dark';
  private currentBiomeColor = 0x15803d;

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
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.radius = 2.8;
    scene.add(this.sunLight);

    // ─── 2. Sky & Ambient Fill (Soft Diffuse Bounce) ──────────────────────────
    this.fillLight = new THREE.HemisphereLight(
      0xbae6fd,  // soft sky blue
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

    // ─── 4. Pedestal Placeholder & Soft Shadow ───────────────────────────────
    const soilTex = getSoilTexture(0x15803d);
    const islandMat = getCleanPBR({
      map: soilTex.map,
      bumpMap: soilTex.bumpMap,
      bumpScale: 0.05,
      roughness: 0.8,
      clearcoat: 0.15,
      clearcoatRoughness: 0.2,
    });
    const rimMat = getCleanPBR({
      color: 0x451a03,
      roughness: 0.9,
      clearcoat: 0.05,
    });

    this.islandMesh = new THREE.Mesh(new THREE.BufferGeometry(), islandMat);
    this.islandMesh.receiveShadow = true;
    scene.add(this.islandMesh);

    this.islandRim = new THREE.Mesh(new THREE.BufferGeometry(), rimMat);
    this.islandRim.receiveShadow = true;
    scene.add(this.islandRim);

    this.boundaryHedge = new THREE.Group();
    scene.add(this.boundaryHedge);

    // Soft Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(24, 24);
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

    // Build default Square Farm
    this.setFarmShape('square');
    this.setTheme('dark');
    this.setTimeOfDay(10);
  }

  /**
   * Dynamically build a Square 1-Hectare Farm Pedestal or Circular Diorama
   */
  setFarmShape(shape: 'square' | 'circle') {
    this.currentShape = shape;

    // Dispose old geometries
    this.islandMesh.geometry.dispose();
    this.islandRim.geometry.dispose();
    while (this.boundaryHedge.children.length > 0) {
      this.boundaryHedge.remove(this.boundaryHedge.children[0]);
    }

    if (shape === 'square') {
      // 1. Topsoil 1-Ha Cadastral Square Block (13.5m x 13.5m)
      const topGeo = new THREE.BoxGeometry(13.5, 0.6, 13.5);
      topGeo.computeVertexNormals();
      this.islandMesh.geometry = topGeo;
      this.islandMesh.position.set(0, -0.3, 0);

      // 2. Stratified Subterranean Bedrock Base
      const rimGeo = new THREE.BoxGeometry(13.2, 1.2, 13.2);
      rimGeo.computeVertexNormals();
      this.islandRim.geometry = rimGeo;
      this.islandRim.position.set(0, -1.1, 0);

      // 3. Perimeter Alley Markers / Boundary Drainage Ridge
      const hedgeMat = getCleanPBR({ color: 0x14532d, roughness: 0.6, clearcoat: 0.2 });
      const edgeLen = 13.6;
      const hedgeThickness = 0.15;
      const hedgeH = 0.12;

      // 4 perimeter curbs
      const hedges = [
        { w: edgeLen, d: hedgeThickness, x: 0, z: 6.75 },
        { w: edgeLen, d: hedgeThickness, x: 0, z: -6.75 },
        { w: hedgeThickness, d: edgeLen, x: 6.75, z: 0 },
        { w: hedgeThickness, d: edgeLen, x: -6.75, z: 0 },
      ];

      hedges.forEach(h => {
        const hMesh = new THREE.Mesh(new THREE.BoxGeometry(h.w, hedgeH, h.d), hedgeMat);
        hMesh.position.set(h.x, 0.02, h.z);
        hMesh.receiveShadow = true;
        this.boundaryHedge.add(hMesh);
      });
    } else {
      // Circular Ecological Diorama
      const topGeo = new THREE.CylinderGeometry(8.2, 8.4, 0.6, 64);
      topGeo.computeVertexNormals();
      this.islandMesh.geometry = topGeo;
      this.islandMesh.position.set(0, -0.3, 0);

      const rimGeo = new THREE.CylinderGeometry(8.4, 7.6, 1.2, 64);
      rimGeo.computeVertexNormals();
      this.islandRim.geometry = rimGeo;
      this.islandRim.position.set(0, -1.1, 0);
    }
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

    this.currentBiomeColor = groundColors[farm.biome] || 0x15803d;
    (this.islandMesh.material as THREE.MeshPhysicalMaterial).color.setHex(
      isWet ? this.currentBiomeColor : this.lightenHex(this.currentBiomeColor, 0.3)
    );
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    if (season === 'wet') {
      this.fillLight.color.setHex(0xbae6fd);
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 3.0;
      (this.islandMesh.material as THREE.MeshPhysicalMaterial).color.setHex(this.currentBiomeColor);
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
