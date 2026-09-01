/**
 * Farm Atlas — InstancedGrass
 * High-performance GPU-instanced curved grass blade system inspired by spacejack/terra.
 * Features custom vertex shader for organic wind wave animation, blade curvature,
 * tip-to-base gradient coloration, seasonal dry/wet tinting, and spatial density masking.
 */

import * as THREE from 'three';
import type { Season } from '../data/types';

export class InstancedGrass {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private bladeGeometry: THREE.BufferGeometry;
  private instanceCount: number;
  private currentSeason: Season = 'wet';

  constructor(count = 12000, bounds = { minX: -6.5, maxX: 6.5, minZ: -6.5, maxZ: 6.5 }) {
    this.instanceCount = count;
    this.bladeGeometry = this.createBladeGeometry();
    this.material = this.createGrassMaterial();

    const instancedGeo = new THREE.InstancedBufferGeometry();
    instancedGeo.index = this.bladeGeometry.index;
    instancedGeo.attributes.position = this.bladeGeometry.attributes.position;
    instancedGeo.attributes.normal = this.bladeGeometry.attributes.normal;
    instancedGeo.attributes.uv = this.bladeGeometry.attributes.uv;

    // Instance attributes
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count * 3);
    const rotations = new Float32Array(count);
    const variations = new Float32Array(count * 3); // [hueVar, bendVar, phaseVar]

    let placed = 0;
    for (let i = 0; i < count; i++) {
      let x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      let z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

      // Keep within pedestal bounds
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 6.4) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 6.3;
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
      }

      offsets[i * 3 + 0] = x;
      offsets[i * 3 + 1] = 0.01; // Rest slightly on top of topsoil
      offsets[i * 3 + 2] = z;

      // Varied height and slender width
      const height = 0.28 + Math.random() * 0.35;
      const width = 0.65 + Math.random() * 0.5;
      scales[i * 3 + 0] = width;
      scales[i * 3 + 1] = height;
      scales[i * 3 + 2] = width;

      // Random yaw rotation
      rotations[i] = Math.random() * Math.PI * 2;

      // Natural variation per blade
      variations[i * 3 + 0] = (Math.random() - 0.5) * 0.2; // Color variation
      variations[i * 3 + 1] = 0.4 + Math.random() * 0.6;   // Wind responsiveness
      variations[i * 3 + 2] = Math.random() * Math.PI * 2; // Wind phase offset

      placed++;
    }

    instancedGeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    instancedGeo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 3));
    instancedGeo.setAttribute('aRotation', new THREE.InstancedBufferAttribute(rotations, 1));
    instancedGeo.setAttribute('aVariation', new THREE.InstancedBufferAttribute(variations, 3));

    this.mesh = new THREE.Mesh(instancedGeo, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = this.createGrassDepthMaterial();
  }

  /**
   * Generates a curved, tapered grass blade geometry (5 segments, 10 vertices)
   */
  private createBladeGeometry(): THREE.BufferGeometry {
    const geom = new THREE.BufferGeometry();

    // 5 vertical segments from base (y=0) to tip (y=1)
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const segments = 4;
    for (let i = 0; i <= segments; i++) {
      const v = i / segments;
      // Taper width toward the tip
      const halfWidth = (1.0 - v * 0.85) * 0.035;
      // Organic natural forward curve
      const zOffset = Math.pow(v, 2.0) * 0.08;

      // Left vertex
      positions.push(-halfWidth, v, zOffset);
      normals.push(0, 0.3, 0.95);
      uvs.push(0, v);

      // Right vertex
      positions.push(halfWidth, v, zOffset);
      normals.push(0, 0.3, 0.95);
      uvs.push(1, v);
    }

    // Connect quads
    for (let i = 0; i < segments; i++) {
      const vi = i * 2;
      indices.push(vi, vi + 1, vi + 2);
      indices.push(vi + 1, vi + 3, vi + 2);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }

  private createGrassMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindSpeed: { value: 1.6 },
        uWindStrength: { value: 0.18 },
        uBaseColor: { value: new THREE.Color(0x0f3d1e) },    // Deep fertile root green
        uTipColor: { value: new THREE.Color(0x4ade80) },     // Lush sunlit leaf green
        uDryBaseColor: { value: new THREE.Color(0x452309) }, // Rich dry savanna earth base
        uDryTipColor: { value: new THREE.Color(0xd97706) },  // Sun-bleached golden straw tip
        uSeasonMix: { value: 0.0 },                          // 0 = wet, 1 = dry
        uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.5).normalize() },
      },
      vertexShader: `
        attribute vec3 aOffset;
        attribute vec3 aScale;
        attribute float aRotation;
        attribute vec3 aVariation;

        uniform float uTime;
        uniform float uWindSpeed;
        uniform float uWindStrength;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vColorVariation;
        varying float vHeight;

        void main() {
          vUv = uv;
          vHeight = uv.y;
          vColorVariation = aVariation.x;

          // Scaled blade position
          vec3 pos = position * aScale;

          // Wind displacement based on height^2
          float heightFactor = pow(uv.y, 1.8);
          float bendPower = aVariation.y;
          float phase = aVariation.z + aOffset.x * 0.45 + aOffset.z * 0.45;

          float wind = sin(uTime * uWindSpeed + phase) * 0.6
                     + sin(uTime * uWindSpeed * 2.1 + phase * 1.5) * 0.3
                     + cos(uTime * uWindSpeed * 0.7 - phase) * 0.2;

          pos.x += wind * uWindStrength * bendPower * heightFactor;
          pos.z += (wind * 0.6) * uWindStrength * bendPower * heightFactor;
          pos.y -= abs(wind) * uWindStrength * 0.3 * heightFactor; // Pull down slightly when bent

          // Rotate blade around Y axis
          float cosR = cos(aRotation);
          float sinR = sin(aRotation);
          vec3 rotatedPos = vec3(
            pos.x * cosR - pos.z * sinR,
            pos.y,
            pos.x * sinR + pos.z * cosR
          );

          // World position
          vec3 worldPos = rotatedPos + aOffset;
          vWorldPosition = worldPos;

          // Normal rotation
          vec3 rotatedNormal = vec3(
            normal.x * cosR - normal.z * sinR,
            normal.y,
            normal.x * sinR + normal.z * cosR
          );
          vNormal = normalize((modelMatrix * vec4(rotatedNormal, 0.0)).xyz);

          gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uTipColor;
        uniform vec3 uDryBaseColor;
        uniform vec3 uDryTipColor;
        uniform float uSeasonMix;
        uniform vec3 uLightDirection;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vColorVariation;
        varying float vHeight;

        void main() {
          // Wet vs Dry palette
          vec3 wetBase = uBaseColor + vec3(vColorVariation * 0.1);
          vec3 wetTip  = uTipColor  + vec3(vColorVariation * 0.15);
          vec3 dryBase = uDryBaseColor + vec3(vColorVariation * 0.1);
          vec3 dryTip  = uDryTipColor  + vec3(vColorVariation * 0.15);

          vec3 baseCol = mix(wetBase, dryBase, uSeasonMix);
          vec3 tipCol  = mix(wetTip,  dryTip,  uSeasonMix);

          // Tip-to-base gradient
          vec3 diffuseColor = mix(baseCol, tipCol, pow(vHeight, 0.85));

          // Soft directional lighting with backlighting translucency
          float NdotL = dot(vNormal, uLightDirection);
          float light = max(NdotL * 0.5 + 0.5, 0.25);
          
          // Subsurface scattering translucency effect when looking against the light
          float subsurface = max(-NdotL, 0.0) * 0.35 * vHeight;

          // Ambient occlusion at bottom of blade cluster
          float ao = clamp(vHeight * 1.5 + 0.35, 0.0, 1.0);

          vec3 finalColor = (diffuseColor * light + diffuseColor * subsurface) * ao;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }

  private createGrassDepthMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindSpeed: { value: 1.6 },
        uWindStrength: { value: 0.18 },
      },
      vertexShader: `
        attribute vec3 aOffset;
        attribute vec3 aScale;
        attribute float aRotation;
        attribute vec3 aVariation;

        uniform float uTime;
        uniform float uWindSpeed;
        uniform float uWindStrength;

        void main() {
          vec3 pos = position * aScale;
          float heightFactor = pow(uv.y, 1.8);
          float bendPower = aVariation.y;
          float phase = aVariation.z + aOffset.x * 0.45 + aOffset.z * 0.45;

          float wind = sin(uTime * uWindSpeed + phase) * 0.6
                     + sin(uTime * uWindSpeed * 2.1 + phase * 1.5) * 0.3;

          pos.x += wind * uWindStrength * bendPower * heightFactor;
          pos.z += (wind * 0.6) * uWindStrength * bendPower * heightFactor;

          float cosR = cos(aRotation);
          float sinR = sin(aRotation);
          vec3 rotatedPos = vec3(
            pos.x * cosR - pos.z * sinR,
            pos.y,
            pos.x * sinR + pos.z * cosR
          );

          vec3 worldPos = rotatedPos + aOffset;
          gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1.0);
        }
      `,
    });
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  update(elapsedTime: number, sunPosition?: THREE.Vector3) {
    this.material.uniforms.uTime.value = elapsedTime;
    if (this.mesh.customDepthMaterial) {
      (this.mesh.customDepthMaterial as THREE.ShaderMaterial).uniforms.uTime.value = elapsedTime;
    }
    if (sunPosition) {
      this.material.uniforms.uLightDirection.value.copy(sunPosition).normalize();
    }
  }

  setSeason(season: Season) {
    this.currentSeason = season;
    this.material.uniforms.uSeasonMix.value = season === 'dry' ? 1.0 : 0.0;
  }

  setBiomePalette(biome: string) {
    if (biome === 'rainforest') {
      this.material.uniforms.uTipColor.value.setHex(0x22c55e);
      this.material.uniforms.uBaseColor.value.setHex(0x064e3b);
    } else if (biome === 'derived-savanna' || biome === 'guinea-savanna') {
      this.material.uniforms.uTipColor.value.setHex(0x84cc16);
      this.material.uniforms.uBaseColor.value.setHex(0x365314);
    } else if (biome === 'swamp-forest') {
      this.material.uniforms.uTipColor.value.setHex(0x10b981);
      this.material.uniforms.uBaseColor.value.setHex(0x022c22);
    } else {
      this.material.uniforms.uTipColor.value.setHex(0x4ade80);
      this.material.uniforms.uBaseColor.value.setHex(0x0f3d1e);
    }
  }

  dispose() {
    this.bladeGeometry.dispose();
    this.material.dispose();
    if (this.mesh.customDepthMaterial) {
      this.mesh.customDepthMaterial.dispose();
    }
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
  }
}
