/**
 * Farm Atlas — GLTF & DRACO Model Loader
 * Enables seamless loading of photorealistic scanned .glb models
 * from Poly Haven, Quixel Megascans, and Sketchfab with memory caching.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class ModelLoaderService {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private cache: Map<string, THREE.Group> = new Map();

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Loads a GLB/GLTF model from URL with Draco decompression and clone caching
   */
  async loadModel(url: string, scale = 1.0): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      return cached.clone(true);
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.setScalar(scale);

          // Configure shadows & PBR material settings
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.shadowSide = THREE.DoubleSide;
              }
            }
          });

          this.cache.set(url, model);
          resolve(model.clone(true));
        },
        undefined,
        (error) => {
          console.warn(`[ModelLoader] Could not load ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  dispose() {
    this.dracoLoader.dispose();
    this.cache.clear();
  }
}

export const modelLoader = new ModelLoaderService();
