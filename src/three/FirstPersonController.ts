/**
 * Farm Atlas — FirstPersonController
 * Implements smooth first-person walking controls (WASD / Arrow keys + Mouse Look / Touch)
 * at realistic farmer eye level (1.65m) with rhythmic head-bobbing, sprint, and plot boundary clamping.
 */

import * as THREE from 'three';

export interface WalkState {
  isWalking: boolean;
  isSprinting: boolean;
  activeTarget: string | null;
  coordinates: { x: number; z: number };
}

export class FirstPersonController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private enabled = false;

  // Movement vectors
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private isSprinting = false;

  // Look angles (Euler yaw & pitch)
  private yaw = 0;
  private pitch = 0;
  private isPointerLocked = false;
  private isMouseDown = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  // Head bobbing & parameters
  private walkDistance = 0;
  private eyeHeight = 1.65; // 1.65m farmer eye level
  private plotBoundary = 6.4; // 1-acre square plot boundary
  private raycaster = new THREE.Raycaster();
  private onWalkStateChange?: (state: WalkState) => void;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    onWalkStateChange?: (state: WalkState) => void
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.onWalkStateChange = onWalkStateChange;

    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Touch support for mobile devices
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  enable(startPos = new THREE.Vector3(0, 1.65, 5.0), lookTarget = new THREE.Vector3(0, 1.65, 0)) {
    this.enabled = true;
    this.camera.position.copy(startPos);
    this.camera.position.y = this.eyeHeight;

    const dir = new THREE.Vector3().subVectors(lookTarget, startPos).normalize();
    this.yaw = Math.atan2(-dir.x, -dir.z);
    this.pitch = Math.asin(dir.y);
    this.updateCameraRotation();
  }

  disable() {
    this.enabled = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
    }
  }

  private onMouseDown(e: MouseEvent) {
    if (!this.enabled) return;
    this.isMouseDown = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  }

  private onMouseUp() {
    this.isMouseDown = false;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.enabled || !this.isMouseDown) return;

    const deltaX = e.clientX - this.prevMouseX;
    const deltaY = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    const lookSpeed = 0.003;
    this.yaw -= deltaX * lookSpeed;
    this.pitch -= deltaY * lookSpeed;
    this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

    this.updateCameraRotation();
  }

  private onTouchStart(e: TouchEvent) {
    if (!this.enabled || e.touches.length === 0) return;
    this.isMouseDown = true;
    this.prevMouseX = e.touches[0].clientX;
    this.prevMouseY = e.touches[0].clientY;
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.enabled || !this.isMouseDown || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - this.prevMouseX;
    const deltaY = e.touches[0].clientY - this.prevMouseY;
    this.prevMouseX = e.touches[0].clientX;
    this.prevMouseY = e.touches[0].clientY;

    const lookSpeed = 0.004;
    this.yaw -= deltaX * lookSpeed;
    this.pitch -= deltaY * lookSpeed;
    this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

    this.updateCameraRotation();
  }

  private onTouchEnd() {
    this.isMouseDown = false;
  }

  private updateCameraRotation() {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.y = this.yaw;
    euler.x = this.pitch;
    this.camera.quaternion.setFromEuler(euler);
  }

  update(delta: number, interactiveObjects: THREE.Object3D[] = []) {
    if (!this.enabled) return;

    // Movement deceleration / friction
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const walkSpeed = this.isSprinting ? 7.5 : 3.8;
    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * walkSpeed * 10.0 * delta;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * walkSpeed * 10.0 * delta;
    }

    // Move in camera look direction
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0)).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0)).normalize();

    this.camera.position.addScaledVector(forward, -this.velocity.z * delta);
    this.camera.position.addScaledVector(right, -this.velocity.x * delta);

    // Clamp inside 1-Acre Square Farm Cadastral Boundary
    this.camera.position.x = Math.max(-this.plotBoundary, Math.min(this.plotBoundary, this.camera.position.x));
    this.camera.position.z = Math.max(-this.plotBoundary, Math.min(this.plotBoundary, this.camera.position.z));

    // Natural Rhythmic Head-Bobbing
    const speedMagnitude = Math.hypot(this.velocity.x, this.velocity.z);
    if (speedMagnitude > 0.1) {
      this.walkDistance += speedMagnitude * delta * 2.8;
      const bobY = Math.sin(this.walkDistance * 4.0) * (this.isSprinting ? 0.045 : 0.025);
      this.camera.position.y = this.eyeHeight + bobY;
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.eyeHeight, delta * 8.0);
    }

    // Raycast center crosshair for crop / fauna inspection
    let targetLabel: string | null = null;
    if (interactiveObjects.length > 0) {
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const hits = this.raycaster.intersectObjects(interactiveObjects, true);
      if (hits.length > 0 && hits[0].distance < 4.5) {
        let curr: THREE.Object3D | null = hits[0].object;
        while (curr && !curr.name && curr.parent) {
          curr = curr.parent;
        }
        if (curr && curr.name) {
          targetLabel = curr.name;
        }
      }
    }

    if (this.onWalkStateChange) {
      this.onWalkStateChange({
        isWalking: speedMagnitude > 0.1,
        isSprinting: this.isSprinting,
        activeTarget: targetLabel,
        coordinates: {
          x: Math.round(this.camera.position.x * 10) / 10,
          z: Math.round(this.camera.position.z * 10) / 10,
        },
      });
    }
  }

  dispose() {
    this.disable();
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }
}
