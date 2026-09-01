/**
 * Farm Atlas — FarmRenderer
 * Museum-grade lighting rig, configurable Square / Circle 1-Ha farm pedestal,
 * high-detail PBR soil stratigraphy, atmospheric Rayleigh sky dome, and realistic solar trajectory.
 * Inspired by StackOverflow physically-based sunlight & environmental rigs.
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

  // Sky Atmosphere Dome
  private skyDome: THREE.Mesh | null = null;

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

    // ─── 1. Natural Solar Key Light (Physically Based Directional Sun) ───────
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    this.sunLight.position.set(14, 20, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.sunLight.shadow.bias = -0.00035;
    this.sunLight.shadow.normalBias = 0.02;
    this.sunLight.shadow.radius = 2.4;
    scene.add(this.sunLight);

    // ─── 2. Sky & Soil Ambient Fill (Soft Diffuse Bounce) ────────────────────
    this.fillLight = new THREE.HemisphereLight(
      0xbae6fd,  // Zenith: Atmospheric sky blue
      0x1e140d,  // Nadir: Rich humic soil bounce
      1.0
    );
    scene.add(this.fillLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(this.ambientLight);

    // ─── 3. Specular Rim Light (Clean Specular Contours on Leaves & Fauna) ───
    this.rimLight = new THREE.DirectionalLight(0xfef08a, 0.85);
    this.rimLight.position.set(-12, 14, -14);
    scene.add(this.rimLight);

    // ─── 4. Atmospheric Sky Dome ─────────────────────────────────────────────
    this.createAtmosphericSkyDome();

    // ─── 5. PBR Soil Pedestal & Contact Soft Shadow ──────────────────────────
    const soilTex = getSoilTexture(0x15803d, false);
    const islandMat = getCleanPBR({
      map: soilTex.map,
      bumpMap: soilTex.bumpMap,
      bumpScale: 0.06,
      roughnessMap: soilTex.roughnessMap,
      roughness: 0.75,
      clearcoat: 0.15,
      clearcoatRoughness: 0.25,
    });
    const rimMat = getCleanPBR({
      color: 0x3d2314,
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
   * Atmospheric Sky Dome Shader with realistic Rayleigh-like gradient & horizon haze
   */
  private createAtmosphericSkyDome() {
    const skyGeo = new THREE.SphereGeometry(95, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uZenithColor: { value: new THREE.Color(0x0f172a) },
        uHorizonColor: { value: new THREE.Color(0x1e293b) },
        uSunColor: { value: new THREE.Color(0xfef08a) },
        uSunPosition: { value: new THREE.Vector3(14, 20, 12).normalize() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunColor;
        uniform vec3 uSunPosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float elevation = max(dir.y, 0.0);
          
          // Smooth Rayleigh atmospheric gradient from horizon to zenith
          vec3 sky = mix(uHorizonColor, uZenithColor, pow(elevation, 0.6));

          // Soft solar flare glow around sun position
          float sunDot = max(dot(dir, uSunPosition), 0.0);
          float sunGlow = pow(sunDot, 64.0) * 0.8 + pow(sunDot, 8.0) * 0.2;
          sky += uSunColor * sunGlow;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
  }

  getSunPosition(): THREE.Vector3 {
    return this.sunLight.position;
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
    this.updateSoilMaterial(isWet);
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    const isWet = season === 'wet';
    this.updateSoilMaterial(isWet);

    if (isWet) {
      this.fillLight.color.setHex(0xbae6fd);
      this.fillLight.groundColor.setHex(0x1e140d);
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 3.2;
    } else {
      // Golden dry season sunlight with warm amber dust bounce
      this.fillLight.color.setHex(0xfde047);
      this.fillLight.groundColor.setHex(0x451a03);
      this.sunLight.color.setHex(0xfef08a);
      this.sunLight.intensity = 3.5;
    }
  }

  private updateSoilMaterial(isWet: boolean) {
    const soilTex = getSoilTexture(this.currentBiomeColor, !isWet);
    const mat = this.islandMesh.material as THREE.MeshPhysicalMaterial;
    mat.map = soilTex.map;
    mat.bumpMap = soilTex.bumpMap;
    mat.bumpScale = isWet ? 0.06 : 0.08;
    mat.roughnessMap = soilTex.roughnessMap;
    mat.roughness = isWet ? 0.7 : 0.95;
    mat.clearcoat = isWet ? 0.2 : 0.05;
    mat.needsUpdate = true;
  }

  setTimeOfDay(hour: number) {
    this.currentHour = hour;

    const t = (hour - 6) / 12;
    const angle = t * Math.PI;

    const x = Math.cos(angle - Math.PI / 2) * 20;
    const y = Math.sin(angle) * 20 + 3;
    const z = 10;

    this.sunLight.position.set(x, Math.max(y, 1), z);

    if (this.skyDome && this.skyDome.material instanceof THREE.ShaderMaterial) {
      this.skyDome.material.uniforms.uSunPosition.value.copy(this.sunLight.position).normalize();
    }

    // Solar spectrum temperature transitions across 24h
    if (hour < 7 || hour > 18) {
      // Dawn / Dusk (Golden red-orange horizon)
      this.sunLight.color.setHex(0xf97316);
      this.sunLight.intensity = 1.2;
      this.ambientLight.intensity = 0.25;
      if (this.skyDome && this.skyDome.material instanceof THREE.ShaderMaterial) {
        this.skyDome.material.uniforms.uZenithColor.value.setHex(0x1e1b4b);
        this.skyDome.material.uniforms.uHorizonColor.value.setHex(0x7c2d12);
        this.skyDome.material.uniforms.uSunColor.value.setHex(0xf97316);
      }
    } else if (hour < 9 || hour > 16) {
      // Morning / Golden Afternoon
      this.sunLight.color.setHex(0xfbbf24);
      this.sunLight.intensity = 2.6;
      this.ambientLight.intensity = 0.35;
      if (this.skyDome && this.skyDome.material instanceof THREE.ShaderMaterial) {
        this.skyDome.material.uniforms.uZenithColor.value.setHex(0x0284c7);
        this.skyDome.material.uniforms.uHorizonColor.value.setHex(0xfde68a);
        this.skyDome.material.uniforms.uSunColor.value.setHex(0xfbbf24);
      }
    } else {
      // Solar Noon (Crisp warm white zenith)
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 3.2;
      this.ambientLight.intensity = 0.45;
      if (this.skyDome && this.skyDome.material instanceof THREE.ShaderMaterial) {
        this.skyDome.material.uniforms.uZenithColor.value.setHex(0x0284c7);
        this.skyDome.material.uniforms.uHorizonColor.value.setHex(0xbae6fd);
        this.skyDome.material.uniforms.uSunColor.value.setHex(0xfff7ed);
      }
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background = null; // Let Sky Dome render smoothly behind
      this.fillLight.intensity = 0.85;
      this.ambientLight.intensity = 0.35;
      this.renderer.toneMappingExposure = 1.15;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.55;
    } else {
      this.scene.background = null;
      this.fillLight.intensity = 1.05;
      this.ambientLight.intensity = 0.5;
      this.renderer.toneMappingExposure = 1.05;
      (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = 0.22;
    }
  }
}
