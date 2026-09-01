/**
 * Farm Atlas — ProceduralTreeEngine
 * Mathematical, procedural growth generator for tropical agricultural crop trees and agroforestry species.
 * Inspired by Token-Gremlin/realistic-forest (Sylva) and botanical fractal growth rules.
 * Generates unique specimens with zero external 3D files:
 * - Emergent Shade Hardwoods (Iroko / Mahogany)
 * - Cauliflorous Cocoa Trees (Theobroma cacao)
 * - Monopodial Palms & Bananas (Oil Palm, Plantain)
 * - Spreading Fruit Trees (Mango, Cashew)
 * - Apical Stipe Trees (Pawpaw / Papaya)
 */

import * as THREE from 'three';
import {
  getLeafTexture,
  getBarkTexture,
  getCocoaPodTexture,
} from './TextureGenerator';
import { getCleanPBR } from './CleanBotanicalModels';

/** Deterministic pseudo-random number generator for reproducible procedural seed variations */
class PRNG {
  private s: number;
  constructor(seed = 1337) {
    this.s = Math.abs(seed) || 1;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// ─── 1. EMERGENT HARDWOOD GENERATOR (Iroko / African Mahogany / Ceiba) ────────
export function generateEmergentHardwood(options: {
  x?: number;
  z?: number;
  seed?: number;
  height?: number;
  canopySpread?: number;
  barkColor?: number;
} = {}): THREE.Group {
  const {
    x = 0,
    z = 0,
    seed = Math.random() * 10000,
    height = 7.6,
    barkColor = 0x2e180c,
  } = options;

  const rng = new PRNG(seed);
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = rng.range(0, Math.PI * 2);

  const actualH = height * rng.range(0.92, 1.12);

  const barkTex = getBarkTexture(barkColor, 'hardwood');
  const trunkMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.12,
    roughnessMap: barkTex.roughnessMap,
    roughness: 0.85,
    clearcoat: 0.1,
  });

  // 1. Buttress Roots (3 to 5 flared structural buttresses)
  const rootCount = Math.floor(rng.range(4, 6));
  for (let r = 0; r < rootCount; r++) {
    const rootAngle = (r / rootCount) * Math.PI * 2 + rng.range(-0.25, 0.25);
    const rootReach = rng.range(1.1, 1.5);
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(rootAngle) * 0.28, rng.range(1.1, 1.5), Math.sin(rootAngle) * 0.28),
      new THREE.Vector3(Math.cos(rootAngle) * 0.65, 0.45, Math.sin(rootAngle) * 0.65),
      new THREE.Vector3(Math.cos(rootAngle) * rootReach, 0.02, Math.sin(rootAngle) * rootReach),
    ]);
    const rootGeo = new THREE.TubeGeometry(rootCurve, 12, rng.range(0.08, 0.12), 10, false);
    rootGeo.computeVertexNormals();
    const rootMesh = new THREE.Mesh(rootGeo, trunkMat);
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;
    group.add(rootMesh);
  }

  // 2. Trunk with Organic Catmull-Rom Sway
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(rng.range(-0.1, 0.1), actualH * 0.35, rng.range(-0.1, 0.1)),
    new THREE.Vector3(rng.range(-0.12, 0.12), actualH * 0.7, rng.range(-0.12, 0.12)),
    new THREE.Vector3(rng.range(-0.06, 0.06), actualH * 0.9, rng.range(-0.06, 0.06)),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 28, rng.range(0.26, 0.32), 16, false);
  trunkGeo.computeVertexNormals();
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  group.add(trunkMesh);

  // 3. Multi-Level Primary Bough Bifurcation
  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.06,
    roughnessMap: leafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.35,
    clearcoat: 0.45,
    clearcoatRoughness: 0.15,
  });

  const boughCount = 3 + (rng.next() > 0.5 ? 1 : 0);
  for (let b = 0; b < boughCount; b++) {
    const angle = (b / boughCount) * Math.PI * 2 + rng.range(-0.3, 0.3);
    const boughStartY = actualH * rng.range(0.68, 0.85);
    const boughLen = rng.range(2.4, 3.2);

    const bx = Math.cos(angle) * boughLen;
    const bz = Math.sin(angle) * boughLen;
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, boughStartY, 0),
      new THREE.Vector3(bx * 0.5, boughStartY + rng.range(0.3, 0.5), bz * 0.5),
      new THREE.Vector3(bx, boughStartY + rng.range(0.7, 1.0), bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 16, rng.range(0.1, 0.14), 12, false);
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, trunkMat);
    bMesh.castShadow = true;
    group.add(bMesh);

    // Tertiary Twigs & Layered Foliage Planes
    for (let t = 0; t < 3; t++) {
      const subAngle = angle + (t - 1) * rng.range(0.4, 0.7);
      const subLen = rng.range(1.2, 1.6);
      const sx = bx + Math.cos(subAngle) * subLen;
      const sz = bz + Math.sin(subAngle) * subLen;
      const sCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(bx, boughStartY + 0.8, bz),
        new THREE.Vector3(sx * 0.8, boughStartY + rng.range(1.1, 1.3), sz * 0.8),
        new THREE.Vector3(sx, boughStartY + rng.range(1.3, 1.6), sz),
      ]);
      const sGeo = new THREE.TubeGeometry(sCurve, 10, 0.05, 8, false);
      sGeo.computeVertexNormals();
      const sMesh = new THREE.Mesh(sGeo, trunkMat);
      sMesh.castShadow = true;
      group.add(sMesh);

      // Layered Translucent Foliage Cards
      const cardCount = Math.floor(rng.range(5, 8));
      for (let l = 0; l < cardCount; l++) {
        const leafCard = new THREE.Mesh(new THREE.PlaneGeometry(rng.range(1.1, 1.4), rng.range(0.8, 1.1)), leafMat);
        const lx = sx + rng.range(-0.7, 0.7);
        const ly = boughStartY + 1.4 + rng.range(-0.4, 0.4);
        const lz = sz + rng.range(-0.7, 0.7);
        leafCard.position.set(lx, ly, lz);
        leafCard.rotation.set(rng.range(0, 0.6), rng.range(0, Math.PI * 2), rng.range(0, 0.6));
        leafCard.castShadow = true;
        group.add(leafCard);
      }
    }
  }

  return group;
}

// ─── 2. CAULIFLOROUS COCOA TREE GENERATOR (Theobroma cacao) ─────────────────
export function generateCocoaTree(options: {
  x?: number;
  z?: number;
  seed?: number;
} = {}): THREE.Group {
  const { x = 0, z = 0, seed = Math.random() * 10000 } = options;
  const rng = new PRNG(seed);

  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = rng.range(0, Math.PI * 2);

  const barkTex = getBarkTexture(0x3d2314, 'cacao');
  const trunkMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.1,
    roughnessMap: barkTex.roughnessMap,
    roughness: 0.85,
    clearcoat: 0.1,
  });

  // Gnarled Organic Trunk
  const trunkH = rng.range(2.1, 2.5);
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(rng.range(0.04, 0.09), trunkH * 0.35, rng.range(-0.04, 0.04)),
    new THREE.Vector3(rng.range(-0.08, -0.02), trunkH * 0.65, rng.range(-0.06, 0.06)),
    new THREE.Vector3(rng.range(0.01, 0.05), trunkH, rng.range(-0.02, 0.02)),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 24, rng.range(0.12, 0.15), 16, false);
  trunkGeo.computeVertexNormals();
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  group.add(trunkMesh);

  // Scaffold Boughs
  const branchCount = 4;
  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.05,
    roughnessMap: leafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.35,
    clearcoat: 0.45,
    clearcoatRoughness: 0.15,
  });

  for (let b = 0; b < branchCount; b++) {
    const angle = (b / branchCount) * Math.PI * 2 + rng.range(-0.2, 0.2);
    const startY = trunkH * rng.range(0.65, 0.95);
    const length = rng.range(1.4, 1.8);

    const bx = Math.cos(angle) * length * 0.55;
    const bz = Math.sin(angle) * length * 0.55;
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, startY, 0),
      new THREE.Vector3(bx * 0.6, startY + rng.range(0.25, 0.4), bz * 0.6),
      new THREE.Vector3(bx, startY + rng.range(0.45, 0.65), bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 14, rng.range(0.06, 0.08), 12, false);
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, trunkMat);
    bMesh.castShadow = true;
    group.add(bMesh);

    // Drooping Cocoa Leaves
    for (let l = 0; l < 9; l++) {
      const leafCard = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.85), leafMat);
      const lx = bx * (0.4 + (l / 9) * 0.8) + rng.range(-0.35, 0.35);
      const ly = startY + 0.4 + (l / 9) * 0.6 + rng.range(-0.2, 0.2);
      const lz = bz * (0.4 + (l / 9) * 0.8) + rng.range(-0.35, 0.35);
      leafCard.position.set(lx, ly, lz);
      leafCard.rotation.set(rng.range(0.2, 0.9), rng.range(0, Math.PI * 2), rng.range(0.2, 0.9));
      leafCard.castShadow = true;
      group.add(leafCard);
    }
  }

  // Cauliflorous Cocoa Pods along woody trunk
  const podColors = [0xf59e0b, 0xea580c, 0x16a34a, 0xb91c1c];
  const podCount = Math.floor(rng.range(5, 8));
  for (let p = 0; p < podCount; p++) {
    const angle = (p / podCount) * Math.PI * 2 + rng.range(-0.3, 0.3);
    const podY = 0.45 + p * rng.range(0.28, 0.36);
    const color = podColors[p % podColors.length];
    const podTex = getCocoaPodTexture(color);

    const podGroup = new THREE.Group();
    podGroup.position.set(Math.cos(angle) * 0.15, podY, Math.sin(angle) * 0.15);
    podGroup.rotation.set(0.35, angle, 0.2);

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), trunkMat);
    stalk.position.set(0, 0.12, 0);
    podGroup.add(stalk);

    const podGeo = new THREE.SphereGeometry(0.12, 20, 16);
    podGeo.scale(0.75, 1.8, 0.75);
    podGeo.computeVertexNormals();
    const podMat = getCleanPBR({
      map: podTex.map,
      bumpMap: podTex.bumpMap,
      bumpScale: 0.08,
      roughness: 0.35,
      clearcoat: 0.55,
      clearcoatRoughness: 0.1,
    });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.castShadow = true;
    podGroup.add(podMesh);

    group.add(podGroup);
  }

  return group;
}

// ─── 3. SPREADING FRUIT TREE GENERATOR (Mango / Cashew / Citrus) ─────────────
export function generateFruitTree(options: {
  x?: number;
  z?: number;
  seed?: number;
  height?: number;
  fruitColor?: number;
} = {}): THREE.Group {
  const {
    x = 0,
    z = 0,
    seed = Math.random() * 10000,
    height = 5.2,
    fruitColor = 0xf59e0b,
  } = options;

  const rng = new PRNG(seed);
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = rng.range(0, Math.PI * 2);

  const trunkH = height * 0.45;
  const barkTex = getBarkTexture(0x3a2012, 'hardwood');
  const trunkMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.08,
    roughness: 0.85,
    clearcoat: 0.1,
  });

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, trunkH, 16);
  trunkGeo.computeVertexNormals();
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Dense Hemispherical Canopy Dome
  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.05,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.32,
    clearcoat: 0.5,
  });

  const boughCount = 5;
  for (let b = 0; b < boughCount; b++) {
    const angle = (b / boughCount) * Math.PI * 2 + rng.range(-0.25, 0.25);
    const bLen = rng.range(1.8, 2.4);
    const bx = Math.cos(angle) * bLen;
    const bz = Math.sin(angle) * bLen;

    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, trunkH * 0.85, 0),
      new THREE.Vector3(bx * 0.5, trunkH + 0.4, bz * 0.5),
      new THREE.Vector3(bx, trunkH + 0.7, bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 12, 0.07, 8, false);
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, trunkMat);
    bMesh.castShadow = true;
    group.add(bMesh);

    // Leafy Dome Clusters
    for (let l = 0; l < 8; l++) {
      const card = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), leafMat);
      card.position.set(bx + rng.range(-0.5, 0.5), trunkH + 0.6 + rng.range(-0.3, 0.5), bz + rng.range(-0.5, 0.5));
      card.rotation.set(rng.range(0, 0.7), rng.range(0, Math.PI * 2), rng.range(0, 0.7));
      card.castShadow = true;
      group.add(card);
    }
  }

  // Pendulous Fruit Clusters
  const fruitMat = getCleanPBR({
    color: fruitColor,
    roughness: 0.25,
    clearcoat: 0.65,
    clearcoatRoughness: 0.1,
  });
  for (let f = 0; f < 10; f++) {
    const fAngle = rng.range(0, Math.PI * 2);
    const fR = rng.range(1.0, 2.2);
    const fruitGeo = new THREE.SphereGeometry(0.11, 14, 12);
    fruitGeo.scale(0.8, 1.3, 0.8);
    fruitGeo.computeVertexNormals();
    const fruit = new THREE.Mesh(fruitGeo, fruitMat);
    fruit.position.set(Math.cos(fAngle) * fR, trunkH + rng.range(0.1, 0.7), Math.sin(fAngle) * fR);
    fruit.castShadow = true;
    group.add(fruit);
  }

  return group;
}

// ─── 4. TALL APICAL MERISTEM PAWPAW / PAPAYA (Carica papaya) ─────────────────
export function generatePawpaw(options: {
  x?: number;
  z?: number;
  seed?: number;
  height?: number;
} = {}): THREE.Group {
  const { x = 0, z = 0, seed = Math.random() * 10000, height = 3.6 } = options;
  const rng = new PRNG(seed);

  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = rng.range(0, Math.PI * 2);

  const stipeMat = getCleanPBR({ color: 0x65a30d, roughness: 0.65, clearcoat: 0.2 });
  const stipeGeo = new THREE.CylinderGeometry(0.08, 0.14, height, 16);
  stipeGeo.computeVertexNormals();
  const stipe = new THREE.Mesh(stipeGeo, stipeMat);
  stipe.position.y = height / 2;
  stipe.castShadow = true;
  group.add(stipe);

  // Spiraling Palmate Crown Leaves
  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.05,
    transparent: true,
    alphaTest: 0.3,
    roughness: 0.35,
    clearcoat: 0.4,
  });

  const frondCount = 12;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const petioleGroup = new THREE.Group();
    petioleGroup.position.set(0, height - 0.15, 0);
    petioleGroup.rotation.y = angle;

    const petioleGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.95, 8);
    petioleGeo.computeVertexNormals();
    const petiole = new THREE.Mesh(petioleGeo, stipeMat);
    petiole.position.set(0.48, 0.1, 0);
    petiole.rotation.z = -Math.PI / 2.8;
    petioleGroup.add(petiole);

    const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), leafMat);
    blade.position.set(0.95, 0.25, 0);
    blade.rotation.x = Math.PI / 2.2;
    blade.castShadow = true;
    petioleGroup.add(blade);

    group.add(petioleGroup);
  }

  // Fruit Cluster under Crown
  const fruitMat = getCleanPBR({ color: 0xeab308, roughness: 0.35, clearcoat: 0.5 });
  for (let p = 0; p < 8; p++) {
    const pAngle = (p / 8) * Math.PI * 2;
    const fruitGeo = new THREE.SphereGeometry(0.09, 14, 12);
    fruitGeo.scale(0.8, 1.5, 0.8);
    fruitGeo.computeVertexNormals();
    const fruit = new THREE.Mesh(fruitGeo, fruitMat);
    fruit.position.set(Math.cos(pAngle) * 0.14, height - 0.45 - (p * 0.04), Math.sin(pAngle) * 0.14);
    fruit.castShadow = true;
    group.add(fruit);
  }

  return group;
}
