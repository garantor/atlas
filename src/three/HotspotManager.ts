/**
 * Farm Atlas — HotspotManager
 * Manages 3D hotspot markers, raycasting, and screen-space projection
 */

import * as THREE from 'three';
import type { Hotspot } from '../data/types';

export class HotspotManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private onClickCallback: (id: string) => void;

  private hotspots: Hotspot[] = [];
  private markerMeshes: Map<string, THREE.Mesh> = new Map();
  private raycaster = new THREE.Raycaster();

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    onClick: (id: string) => void
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.onClickCallback = onClick;
  }

  loadHotspots(hotspots: Hotspot[]) {
    this.clear();
    this.hotspots = hotspots;

    hotspots.forEach(hs => {
      const color = hs.color ? new THREE.Color(hs.color) : new THREE.Color(0xf5a623);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.17, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);

      // Inner dot
      const dotGeo = new THREE.CircleGeometry(0.07, 12);
      const dotMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      ring.add(dot);

      ring.position.set(...hs.position3d);
      ring.renderOrder = 999;

      // Always face camera
      ring.onBeforeRender = (_, __, cam) => {
        ring.quaternion.copy(cam.quaternion);
      };

      ring.userData.hotspotId = hs.id;
      this.scene.add(ring);
      this.markerMeshes.set(hs.id, ring);
    });
  }

  projectAll(): Map<string, { x: number; y: number; visible: boolean }> {
    const result = new Map<string, { x: number; y: number; visible: boolean }>();
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const temp = new THREE.Vector3();

    this.hotspots.forEach(hs => {
      temp.set(...hs.position3d);
      temp.project(this.camera);

      const x = (temp.x * 0.5 + 0.5) * w;
      const y = (-temp.y * 0.5 + 0.5) * h;
      const visible = temp.z < 1; // in front of camera

      result.set(hs.id, { x, y, visible });
    });

    return result;
  }

  handleClick(event: MouseEvent) {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);
    const meshes = Array.from(this.markerMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData.hotspotId) {
        obj = obj.parent;
      }
      if (obj?.userData.hotspotId) {
        this.onClickCallback(obj.userData.hotspotId);
      }
    }
  }

  clear() {
    this.markerMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.markerMeshes.clear();
    this.hotspots = [];
  }
}
