/**
 * Farm Atlas — GLSL Wind Vertex Shader
 * Injects GPU-accelerated harmonic wind waves into Three.js materials
 * so leaves, palm fronds, maize ribbons, and grasses rustle fluidly on the GPU.
 */

import * as THREE from 'three';

export function applyWindShader(material: THREE.Material, options: {
  speed?: number;
  strength?: number;
  frequency?: number;
} = {}): void {
  const {
    speed = 1.8,
    strength = 0.08,
    frequency = 1.2,
  } = options;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWindSpeed = { value: speed };
    shader.uniforms.uWindStrength = { value: strength };
    shader.uniforms.uWindFreq = { value: frequency };

    // Inject custom wind uniforms into vertex shader
    shader.vertexShader = `
      uniform float uTime;
      uniform float uWindSpeed;
      uniform float uWindStrength;
      uniform float uWindFreq;
    ` + shader.vertexShader;

    // Inject wind displacement before projection
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Calculate wind wave only for vertices above ground (y > 0.3)
      float heightFactor = clamp(transformed.y * 0.4, 0.0, 1.0);
      float windWave = sin(uTime * uWindSpeed + transformed.x * uWindFreq + transformed.z * uWindFreq * 0.7);
      float gustWave = sin(uTime * uWindSpeed * 0.4 + transformed.y * 2.0) * 0.5;
      
      transformed.x += (windWave + gustWave) * uWindStrength * heightFactor;
      transformed.z += (windWave * 0.7) * uWindStrength * heightFactor * 0.8;
      transformed.y += abs(windWave) * uWindStrength * heightFactor * 0.2;
      `
    );

    material.userData.shader = shader;
  };
}

/** Update the wind time uniform in render loop */
export function updateWindUniforms(scene: THREE.Scene, elapsedTime: number): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material) {
      const mat = obj.material;
      if (mat.userData && mat.userData.shader && mat.userData.shader.uniforms.uTime) {
        mat.userData.shader.uniforms.uTime.value = elapsedTime;
      }
    }
  });
}
