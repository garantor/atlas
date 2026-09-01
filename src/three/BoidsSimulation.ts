/**
 * Farm Atlas — Boids Flocking Simulation
 * Craig Reynolds' classic steering algorithm (Separation, Alignment, Cohesion)
 * Simulates living bird flocks (Egrets, Guinea Fowl) and pollinator swarms circling the farm canopy.
 */

import * as THREE from 'three';

interface Boid {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mesh: THREE.Mesh;
  wingPhase: number;
}

export class BoidsSimulation {
  private group: THREE.Group;
  private boids: Boid[] = [];
  private maxSpeed = 3.5;
  private maxForce = 0.08;
  private boundaryRadius = 7.5;
  private minHeight = 2.5;
  private maxHeight = 7.5;

  constructor(scene: THREE.Scene, count = 18) {
    this.group = new THREE.Group();
    this.group.name = 'boids-flock';
    scene.add(this.group);

    this.initBoids(count);
  }

  private initBoids(count: number) {
    // Clean Bird / Pollinator geometry (Streamlined arrow fuselage with flapping wings)
    const bodyGeo = new THREE.ConeGeometry(0.06, 0.28, 6);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.computeVertexNormals();

    const birdMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // white cattle egret / golden pollinator
      roughness: 0.4,
      metalness: 0.1,
    });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(bodyGeo, birdMat);
      mesh.castShadow = true;

      // Add wings
      const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.1), birdMat);
      leftWing.position.set(-0.12, 0, 0);
      leftWing.name = 'leftWing';
      mesh.add(leftWing);

      const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.1), birdMat);
      rightWing.position.set(0.12, 0, 0);
      rightWing.name = 'rightWing';
      mesh.add(rightWing);

      const angle = (i / count) * Math.PI * 2;
      const r = 3.0 + Math.random() * 3.0;
      const pos = new THREE.Vector3(
        Math.cos(angle) * r,
        3.5 + Math.random() * 2.5,
        Math.sin(angle) * r
      );

      const vel = new THREE.Vector3(
        -Math.sin(angle) * (1.5 + Math.random()),
        (Math.random() - 0.5) * 0.5,
        Math.cos(angle) * (1.5 + Math.random())
      );

      this.group.add(mesh);
      this.boids.push({
        position: pos,
        velocity: vel,
        acceleration: new THREE.Vector3(),
        mesh,
        wingPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(delta: number) {
    const desiredSeparation = 1.2;
    const neighborDist = 3.0;

    for (let i = 0; i < this.boids.length; i++) {
      const boid = this.boids[i];
      let sepCount = 0;
      let aliCount = 0;
      let cohCount = 0;

      const sepSteer = new THREE.Vector3();
      const aliSteer = new THREE.Vector3();
      const cohTarget = new THREE.Vector3();

      for (let j = 0; j < this.boids.length; j++) {
        if (i === j) continue;
        const other = this.boids[j];
        const dist = boid.position.distanceTo(other.position);

        // 1. Separation
        if (dist > 0 && dist < desiredSeparation) {
          const diff = new THREE.Vector3().subVectors(boid.position, other.position).normalize().divideScalar(dist);
          sepSteer.add(diff);
          sepCount++;
        }

        // 2. Alignment & 3. Cohesion
        if (dist > 0 && dist < neighborDist) {
          aliSteer.add(other.velocity);
          aliCount++;
          cohTarget.add(other.position);
          cohCount++;
        }
      }

      // Apply Separation
      if (sepCount > 0) {
        sepSteer.divideScalar(sepCount).normalize().multiplyScalar(this.maxSpeed).sub(boid.velocity).clampLength(0, this.maxForce * 1.8);
        boid.acceleration.add(sepSteer);
      }

      // Apply Alignment
      if (aliCount > 0) {
        aliSteer.divideScalar(aliCount).normalize().multiplyScalar(this.maxSpeed).sub(boid.velocity).clampLength(0, this.maxForce);
        boid.acceleration.add(aliSteer);
      }

      // Apply Cohesion (Steer toward center of flock)
      if (cohCount > 0) {
        cohTarget.divideScalar(cohCount);
        const desired = new THREE.Vector3().subVectors(cohTarget, boid.position).normalize().multiplyScalar(this.maxSpeed);
        const steer = desired.sub(boid.velocity).clampLength(0, this.maxForce);
        boid.acceleration.add(steer);
      }

      // 4. Circular Island Boundary Attraction
      const distFromCenter = Math.hypot(boid.position.x, boid.position.z);
      if (distFromCenter > this.boundaryRadius) {
        const centerSteer = new THREE.Vector3(-boid.position.x, 0, -boid.position.z).normalize().multiplyScalar(this.maxSpeed * 0.6);
        boid.acceleration.add(centerSteer.sub(boid.velocity).clampLength(0, this.maxForce * 1.5));
      }

      // Altitude constraints
      if (boid.position.y < this.minHeight) {
        boid.acceleration.y += 0.15;
      } else if (boid.position.y > this.maxHeight) {
        boid.acceleration.y -= 0.15;
      }

      // Integrate Physics
      boid.velocity.add(boid.acceleration.multiplyScalar(delta * 60)).clampLength(1.0, this.maxSpeed);
      boid.position.add(boid.velocity.clone().multiplyScalar(delta));
      boid.acceleration.set(0, 0, 0);

      // Update 3D Mesh orientation to match velocity
      boid.mesh.position.copy(boid.position);
      const lookTarget = boid.position.clone().add(boid.velocity);
      boid.mesh.lookAt(lookTarget);

      // Wing flapping animation
      boid.wingPhase += delta * 14.0;
      const wingAngle = Math.sin(boid.wingPhase) * 0.6;
      const lw = boid.mesh.getObjectByName('leftWing');
      const rw = boid.mesh.getObjectByName('rightWing');
      if (lw) lw.rotation.z = wingAngle;
      if (rw) rw.rotation.z = -wingAngle;
    }
  }

  dispose() {
    this.group.parent?.remove(this.group);
  }
}
