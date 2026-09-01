/**
 * Farm Atlas — Particle Cycles
 * Animated flow particles: Water (blue), N2 (green), PAR (amber), Pest shield (violet), Manure (brown)
 */

import * as THREE from 'three';
import type { FarmEcosystem } from '../data/types';

interface ParticleFlow {
  points: THREE.Points;
  positions: Float32Array;
  velocities: Float32Array;
  count: number;
  color: THREE.Color;
}

export class ParticleCycles {
  private scene: THREE.Scene;
  private flows: ParticleFlow[] = [];
  private active = false;
  private time = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  buildFlows(farm: FarmEcosystem) {
    this.clear();

    // Water / Transpiration — blue pulses rising from roots to leaves
    this.createFlow({
      count: 180,
      color: new THREE.Color(0x4fc3f7),
      spawnBox: new THREE.Box3(new THREE.Vector3(-4, -0.5, -4), new THREE.Vector3(4, 3, 4)),
      velocityDir: new THREE.Vector3(0, 0.5, 0),
      velocityRand: 0.08,
      sizeMin: 0.04, sizeMax: 0.1,
    });

    // N2 Fixation — green horizontal pulses at root level
    if (farm.nitrogenDelta > 0) {
      this.createFlow({
        count: 100,
        color: new THREE.Color(0x69f0ae),
        spawnBox: new THREE.Box3(new THREE.Vector3(-3, -0.3, -3), new THREE.Vector3(3, 0.5, 3)),
        velocityDir: new THREE.Vector3(0.2, 0.1, 0),
        velocityRand: 0.12,
        sizeMin: 0.06, sizeMax: 0.14,
      });
    }

    // PAR (light) — amber downward rays from canopy
    this.createFlow({
      count: 150,
      color: new THREE.Color(0xffee58),
      spawnBox: new THREE.Box3(new THREE.Vector3(-4, 3, -4), new THREE.Vector3(4, 5, 4)),
      velocityDir: new THREE.Vector3(0, -0.3, 0),
      velocityRand: 0.05,
      sizeMin: 0.03, sizeMax: 0.08,
    });

    // Pest repulsion — violet emanating from edges
    if (farm.pestResistancePct > 50) {
      this.createFlow({
        count: 80,
        color: new THREE.Color(0xce93d8),
        spawnBox: new THREE.Box3(new THREE.Vector3(-5, 0.3, -5), new THREE.Vector3(5, 1.5, 5)),
        velocityDir: new THREE.Vector3(0, 0.05, 0),
        velocityRand: 0.18,
        sizeMin: 0.08, sizeMax: 0.18,
      });
    }

    // Manure cycling — brown/gold from ground, horizontal
    this.createFlow({
      count: 60,
      color: new THREE.Color(0xa1887f),
      spawnBox: new THREE.Box3(new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 0.3, 3)),
      velocityDir: new THREE.Vector3(0.1, 0.15, 0.1),
      velocityRand: 0.15,
      sizeMin: 0.05, sizeMax: 0.12,
    });
  }

  private createFlow(opts: {
    count: number;
    color: THREE.Color;
    spawnBox: THREE.Box3;
    velocityDir: THREE.Vector3;
    velocityRand: number;
    sizeMin: number;
    sizeMax: number;
  }) {
    const { count, color, spawnBox, velocityDir, velocityRand, sizeMin, sizeMax } = opts;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = spawnBox.min.x + Math.random() * (spawnBox.max.x - spawnBox.min.x);
      positions[i3 + 1] = spawnBox.min.y + Math.random() * (spawnBox.max.y - spawnBox.min.y);
      positions[i3 + 2] = spawnBox.min.z + Math.random() * (spawnBox.max.z - spawnBox.min.z);

      velocities[i3]     = velocityDir.x + (Math.random() - 0.5) * velocityRand;
      velocities[i3 + 1] = velocityDir.y + (Math.random() - 0.5) * velocityRand;
      velocities[i3 + 2] = velocityDir.z + (Math.random() - 0.5) * velocityRand;

      sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
      alphas[i] = Math.random(); // phase offset
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.1,
      transparent: true,
      opacity: 0.0,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    points.visible = false;
    this.scene.add(points);

    this.flows.push({ points, positions, velocities, count, color });
  }

  update(delta: number): boolean {
    if (!this.active || this.flows.length === 0) return false;
    this.time += delta;

    this.flows.forEach((flow, fi) => {
      const posAttr = flow.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const pos = flow.positions;
      const vel = flow.velocities;
      const mat = flow.points.material as THREE.PointsMaterial;

      // Pulse opacity
      mat.opacity = 0.5 + Math.sin(this.time * 1.5 + fi * 1.2) * 0.3;

      for (let i = 0; i < flow.count; i++) {
        const i3 = i * 3;
        pos[i3]     += vel[i3]     * delta;
        pos[i3 + 1] += vel[i3 + 1] * delta;
        pos[i3 + 2] += vel[i3 + 2] * delta;

        // Wrap particles when out of bounds
        if (pos[i3 + 1] > 6) pos[i3 + 1] = -1;
        if (pos[i3 + 1] < -2) pos[i3 + 1] = 5;
        if (Math.abs(pos[i3]) > 6) pos[i3] *= -0.95;
        if (Math.abs(pos[i3 + 2]) > 6) pos[i3 + 2] *= -0.95;
      }

      posAttr.array = pos;
      posAttr.needsUpdate = true;
    });

    return true;
  }

  setActive(active: boolean) {
    this.active = active;
    this.flows.forEach(flow => {
      flow.points.visible = active;
    });
  }

  clear() {
    this.flows.forEach(flow => {
      this.scene.remove(flow.points);
      flow.points.geometry.dispose();
      (flow.points.material as THREE.Material).dispose();
    });
    this.flows = [];
    this.time = 0;
    this.active = false;
  }

  dispose() {
    this.clear();
  }
}
