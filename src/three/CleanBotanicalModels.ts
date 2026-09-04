/**
 * Farm Atlas — CleanBotanicalModels
 * High-fidelity, organic 3D botanical & faunal specimens inspired by
 * Codrops "Fractals to Forests" procedural branching and botanical anatomy.
 * Powered by high-resolution PBR textures, organic leaf venation cards,
 * furrowed bark bump maps, flared buttress roots, warty pod rinds, and feathered plumage.
 */

import * as THREE from 'three';
import {
  getLeafTexture,
  getBarkTexture,
  getCocoaPodTexture,
} from './TextureGenerator';

// ─── PBR Material Cache ──────────────────────────────────────────────────────
export function getCleanPBR(options: {
  color?: number;
  map?: THREE.Texture;
  alphaMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
  bumpScale?: number;
  roughnessMap?: THREE.Texture;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  ior?: number;
  transparent?: boolean;
  opacity?: number;
  alphaTest?: number;
  emissive?: number;
  emissiveIntensity?: number;
}): THREE.MeshPhysicalMaterial {
  const matOptions: THREE.MeshPhysicalMaterialParameters = {
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide,
    roughness: options.roughness ?? 0.45,
    metalness: options.metalness ?? 0.02,
    clearcoat: options.clearcoat ?? 0.25,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.2,
  };

  if (options.color !== undefined) matOptions.color = options.color;
  if (options.map) matOptions.map = options.map;
  if (options.alphaMap) matOptions.alphaMap = options.alphaMap;
  if (options.bumpMap) {
    matOptions.bumpMap = options.bumpMap;
    matOptions.bumpScale = options.bumpScale ?? 0.05;
  }
  if (options.roughnessMap) matOptions.roughnessMap = options.roughnessMap;
  if (options.transmission !== undefined) matOptions.transmission = options.transmission;
  if (options.ior !== undefined) matOptions.ior = options.ior;
  if (options.transparent !== undefined) matOptions.transparent = options.transparent;
  if (options.opacity !== undefined) matOptions.opacity = options.opacity;
  if (options.alphaTest !== undefined) matOptions.alphaTest = options.alphaTest;
  if (options.emissive !== undefined) matOptions.emissive = options.emissive;
  if (options.emissiveIntensity !== undefined) matOptions.emissiveIntensity = options.emissiveIntensity;

  return new THREE.MeshPhysicalMaterial(matOptions);
}

// ─── 1. FRACTAL EMERGENT RAINFOREST TREE (Iroko / Mahogany) ──────────────────
export function buildEmergentTree(x = 0, z = 0, height = 7.5): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const barkTex = getBarkTexture(0x2e180c, 'hardwood');
  const trunkMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.12,
    roughnessMap: barkTex.roughnessMap,
    roughness: 0.85,
    clearcoat: 0.1,
  });

  // Flared Buttress Roots at base
  for (let r = 0; r < 5; r++) {
    const rootAngle = (r / 5) * Math.PI * 2 + Math.random() * 0.3;
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(rootAngle) * 0.25, 1.2, Math.sin(rootAngle) * 0.25),
      new THREE.Vector3(Math.cos(rootAngle) * 0.65, 0.4, Math.sin(rootAngle) * 0.65),
      new THREE.Vector3(Math.cos(rootAngle) * 1.15, 0.02, Math.sin(rootAngle) * 1.15),
    ]);
    const rootGeo = new THREE.TubeGeometry(rootCurve, 12, 0.08, 10, false);
    rootGeo.computeVertexNormals();
    const rootMesh = new THREE.Mesh(rootGeo, trunkMat);
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;
    group.add(rootMesh);
  }

  // Tapering Main Trunk with Natural Catmull-Rom Sway
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, height * 0.3, 0.04),
    new THREE.Vector3(-0.06, height * 0.6, -0.05),
    new THREE.Vector3(0.04, height * 0.85, 0.02),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 28, 0.28, 16, false);
  trunkGeo.computeVertexNormals();
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  group.add(trunkMesh);

  // Fractal Branch Bifurcation
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

  const boughs = [
    { startY: height * 0.7, angle: 0.2, length: 2.8, tilt: 0.55 },
    { startY: height * 0.78, angle: 2.3, length: 2.5, tilt: 0.6 },
    { startY: height * 0.85, angle: 4.4, length: 2.6, tilt: 0.5 },
  ];

  boughs.forEach((bc) => {
    const bx = Math.cos(bc.angle) * bc.length;
    const bz = Math.sin(bc.angle) * bc.length;
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, bc.startY, 0),
      new THREE.Vector3(bx * 0.5, bc.startY + 0.4, bz * 0.5),
      new THREE.Vector3(bx, bc.startY + 0.8, bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 16, 0.12, 12, false);
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, trunkMat);
    bMesh.castShadow = true;
    group.add(bMesh);

    // Sub-twigs branching off primary bough
    for (let t = 0; t < 3; t++) {
      const subAngle = bc.angle + (t - 1) * 0.6;
      const subLen = 1.4;
      const sx = bx + Math.cos(subAngle) * subLen;
      const sz = bz + Math.sin(subAngle) * subLen;
      const sCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(bx, bc.startY + 0.8, bz),
        new THREE.Vector3(sx * 0.8, bc.startY + 1.2, sz * 0.8),
        new THREE.Vector3(sx, bc.startY + 1.4, sz),
      ]);
      const sGeo = new THREE.TubeGeometry(sCurve, 10, 0.05, 8, false);
      sGeo.computeVertexNormals();
      const sMesh = new THREE.Mesh(sGeo, trunkMat);
      sMesh.castShadow = true;
      group.add(sMesh);

      // Layered Foliage Clusters on Twigs
      for (let l = 0; l < 6; l++) {
        const leafCard = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), leafMat);
        const lx = sx + (Math.random() - 0.5) * 0.8;
        const ly = bc.startY + 1.3 + (Math.random() - 0.5) * 0.6;
        const lz = sz + (Math.random() - 0.5) * 0.8;
        leafCard.position.set(lx, ly, lz);
        leafCard.rotation.set(Math.random() * 0.6, Math.random() * Math.PI * 2, Math.random() * 0.6);
        leafCard.castShadow = true;
        group.add(leafCard);
      }
    }
  });

  return group;
}

// ─── 2. REALISTIC COCOA TREE (Theobroma cacao) ───────────────────────────────
export function buildCleanCocoa(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

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
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.06, 0.7, 0.02),
    new THREE.Vector3(-0.05, 1.4, -0.04),
    new THREE.Vector3(0.03, 2.2, 0.01),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 24, 0.13, 16, false);
  trunkGeo.computeVertexNormals();
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  group.add(trunkMesh);

  // Branching boughs
  const branchConfigs = [
    { startY: 1.5, angle: 0.3, length: 1.6, tilt: 0.6 },
    { startY: 1.7, angle: 1.9, length: 1.5, tilt: 0.65 },
    { startY: 1.9, angle: 3.5, length: 1.7, tilt: 0.55 },
    { startY: 2.1, angle: 5.0, length: 1.4, tilt: 0.7 },
  ];

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

  branchConfigs.forEach(bc => {
    const bx = Math.cos(bc.angle) * bc.length * 0.5;
    const bz = Math.sin(bc.angle) * bc.length * 0.5;
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, bc.startY, 0),
      new THREE.Vector3(bx * 0.6, bc.startY + 0.3, bz * 0.6),
      new THREE.Vector3(bx, bc.startY + 0.5, bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 14, 0.065, 12, false);
    bGeo.computeVertexNormals();
    const bMesh = new THREE.Mesh(bGeo, trunkMat);
    bMesh.castShadow = true;
    group.add(bMesh);

    // Botanical Leaf Cards along branch
    for (let l = 0; l < 9; l++) {
      const leafCard = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.85), leafMat);
      const lx = bx * (0.4 + (l / 9) * 0.8) + (Math.random() - 0.5) * 0.35;
      const ly = bc.startY + 0.4 + (l / 9) * 0.6 + (Math.random() - 0.5) * 0.2;
      const lz = bz * (0.4 + (l / 9) * 0.8) + (Math.random() - 0.5) * 0.35;
      leafCard.position.set(lx, ly, lz);
      leafCard.rotation.set(Math.random() * 0.8, Math.random() * Math.PI * 2, Math.random() * 0.8);
      leafCard.castShadow = true;
      group.add(leafCard);
    }
  });

  // Cauliflorous Cocoa Pods on Trunk
  const podColors = [0xf59e0b, 0xea580c, 0x16a34a, 0xb91c1c];
  for (let p = 0; p < 6; p++) {
    const angle = (p / 6) * Math.PI * 2 + 0.4;
    const podY = 0.5 + p * 0.32;
    const color = podColors[p % podColors.length];
    const podTex = getCocoaPodTexture(color);

    const podGroup = new THREE.Group();
    podGroup.position.set(Math.cos(angle) * 0.15, podY, Math.sin(angle) * 0.15);
    podGroup.rotation.set(0.35, angle, 0.2);

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), trunkMat);
    stalk.position.set(0, 0.12, 0);
    podGroup.add(stalk);

    const podGeo = new THREE.SphereGeometry(0.12, 24, 18);
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

// ─── 3. REALISTIC OIL PALM (Elaeis guineensis) ───────────────────────────────
export function buildCleanOilPalm(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const trunkH = 6.0 + Math.random() * 1.0;

  const barkTex = getBarkTexture(0x452310, 'palm');
  const trunkMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.14,
    roughness: 0.9,
    clearcoat: 0.05,
  });

  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.36, trunkH, 24, 16);
  trunkGeo.computeVertexNormals();
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Arching Feather Fronds with Slender Leaflet Cards
  const palmLeafTex = getLeafTexture('palm');
  const frondMat = getCleanPBR({
    map: palmLeafTex.map,
    alphaMap: palmLeafTex.alphaMap,
    bumpMap: palmLeafTex.bumpMap,
    bumpScale: 0.06,
    roughnessMap: palmLeafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.35,
    clearcoat: 0.45,
  });

  const frondCount = 22;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondGroup = new THREE.Group();
    frondGroup.position.set(0, trunkH - 0.2, 0);
    frondGroup.rotation.y = angle;

    const rachisCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.3, 0.7, 0),
      new THREE.Vector3(2.8, 0.45, 0),
      new THREE.Vector3(4.0, -0.7, 0),
    ]);
    const rachisGeo = new THREE.TubeGeometry(rachisCurve, 20, 0.038, 8, false);
    rachisGeo.computeVertexNormals();
    const rachis = new THREE.Mesh(rachisGeo, trunkMat);
    rachis.castShadow = true;
    frondGroup.add(rachis);

    for (let p = 2; p <= 16; p++) {
      const t = p / 18;
      const pt = rachisCurve.getPoint(t);
      for (const side of [-1, 1]) {
        const leaflet = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.9), frondMat);
        leaflet.position.set(pt.x, pt.y - 0.08, pt.z + side * 0.28);
        leaflet.rotation.set(side * 0.48, 0, -0.42);
        leaflet.castShadow = true;
        frondGroup.add(leaflet);
      }
    }

    group.add(frondGroup);
  }

  // Lustrous Orange-Red Palm Kernel Fruit Bunch
  const bunchGeo = new THREE.SphereGeometry(0.46, 20, 16);
  bunchGeo.scale(1, 0.85, 1);
  bunchGeo.computeVertexNormals();
  const bunchMat = getCleanPBR({
    color: 0xea580c,
    roughness: 0.25,
    clearcoat: 0.65,
    clearcoatRoughness: 0.1,
    emissive: 0xc2410c,
    emissiveIntensity: 0.2,
  });
  const bunch = new THREE.Mesh(bunchGeo, bunchMat);
  bunch.position.set(0.24, trunkH - 0.4, 0.2);
  bunch.castShadow = true;
  group.add(bunch);

  return group;
}

// ─── 4. REALISTIC PLANTAIN / BANANA (Musa paradisiaca) ───────────────────────
export function buildCleanPlantain(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const stemH = 3.4 + Math.random() * 0.5;

  const barkTex = getBarkTexture(0x4d7c0f, 'palm');
  const pstemMat = getCleanPBR({
    map: barkTex.map,
    bumpMap: barkTex.bumpMap,
    bumpScale: 0.06,
    roughness: 0.55,
    clearcoat: 0.2,
  });

  const pstemGeo = new THREE.CylinderGeometry(0.15, 0.26, stemH, 20);
  pstemGeo.computeVertexNormals();
  const pstem = new THREE.Mesh(pstemGeo, pstemMat);
  pstem.position.y = stemH / 2;
  pstem.castShadow = true;
  group.add(pstem);

  // Broad Paddle Fronds with Vein Maps & Sheen
  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.06,
    roughnessMap: leafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.3,
    roughness: 0.35,
    clearcoat: 0.45,
  });

  const leafCount = 8;
  for (let l = 0; l < leafCount; l++) {
    const angle = (l / leafCount) * Math.PI * 2 + (l * 0.15);
    const leafGroup = new THREE.Group();
    leafGroup.position.set(0, stemH - 0.1, 0);
    leafGroup.rotation.y = angle;

    const leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.05), leafMat);
    leafMesh.position.set(1.4, 0.38, 0);
    leafMesh.rotation.x = Math.PI / 2.2;
    leafMesh.rotation.y = 0.12;
    leafMesh.castShadow = true;
    leafGroup.add(leafMesh);

    group.add(leafGroup);
  }

  // Banana Hands & Terminal Blossom
  const bunchGroup = new THREE.Group();
  bunchGroup.position.set(0.3, stemH - 0.45, 0.18);

  const bananaMat = getCleanPBR({ color: 0xfacc15, roughness: 0.3, clearcoat: 0.45 });
  for (let b = 0; b < 12; b++) {
    const ringAngle = (b / 12) * Math.PI * 2;
    const bananaGeo = new THREE.CylinderGeometry(0.026, 0.018, 0.38, 12);
    bananaGeo.computeVertexNormals();
    const banana = new THREE.Mesh(bananaGeo, bananaMat);
    banana.position.set(Math.cos(ringAngle) * 0.18, -0.08 - (b * 0.035), Math.sin(ringAngle) * 0.18);
    banana.rotation.set(0.35, ringAngle, 0.25);
    banana.castShadow = true;
    bunchGroup.add(banana);
  }

  const bellGeo = new THREE.ConeGeometry(0.11, 0.3, 16);
  bellGeo.computeVertexNormals();
  const bellMat = getCleanPBR({ color: 0x7e22ce, roughness: 0.35, clearcoat: 0.45 });
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.position.set(0, -0.6, 0);
  bell.rotation.x = Math.PI;
  bell.castShadow = true;
  bunchGroup.add(bell);

  group.add(bunchGroup);
  return group;
}

// ─── 5. REALISTIC MAIZE / CORN (Zea mays) ────────────────────────────────────
export function buildCleanMaize(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const height = 2.3 + Math.random() * 0.3;

  const stalkGeo = new THREE.CylinderGeometry(0.025, 0.04, height, 16);
  stalkGeo.computeVertexNormals();
  const stalkMat = getCleanPBR({ color: 0x65a30d, roughness: 0.6, clearcoat: 0.2 });
  const stalk = new THREE.Mesh(stalkGeo, stalkMat);
  stalk.position.y = height / 2;
  stalk.castShadow = true;
  group.add(stalk);

  const leafTex = getLeafTexture('broad');
  const leafMat = getCleanPBR({
    map: leafTex.map,
    alphaMap: leafTex.alphaMap,
    bumpMap: leafTex.bumpMap,
    bumpScale: 0.05,
    roughnessMap: leafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.38,
    clearcoat: 0.35,
  });

  for (let i = 1; i <= 6; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const nodeY = (i / 7) * height;
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.25), leafMat);
    leaf.position.set(side * 0.4, nodeY, 0);
    leaf.rotation.set(0.2, i * 0.7, side * 0.4);
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Golden silk cob
  const cobGroup = new THREE.Group();
  cobGroup.position.set(0.07, height * 0.52, 0);
  cobGroup.rotation.z = 0.32;

  const huskGeo = new THREE.ConeGeometry(0.075, 0.48, 14);
  huskGeo.computeVertexNormals();
  const husk = new THREE.Mesh(huskGeo, getCleanPBR({ color: 0x84cc16, roughness: 0.6, clearcoat: 0.2 }));
  husk.castShadow = true;
  cobGroup.add(husk);

  const silkGeo = new THREE.ConeGeometry(0.035, 0.18, 10);
  silkGeo.computeVertexNormals();
  const silk = new THREE.Mesh(silkGeo, getCleanPBR({ color: 0xfde047, roughness: 0.3, clearcoat: 0.5, emissive: 0xca8a04, emissiveIntensity: 0.2 }));
  silk.position.y = 0.26;
  cobGroup.add(silk);
  group.add(cobGroup);

  return group;
}

// ─── 6. REALISTIC YAM MOUND & VINES (Dioscorea rotundata) ─────────────────────
export function buildCleanYamMound(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const moundGeo = new THREE.ConeGeometry(0.95, 0.75, 32);
  moundGeo.computeVertexNormals();
  const moundMat = getCleanPBR({ color: 0x5c3d24, roughness: 0.95 });
  const mound = new THREE.Mesh(moundGeo, moundMat);
  mound.position.y = 0.36;
  mound.receiveShadow = true;
  mound.castShadow = true;
  group.add(mound);

  const stakeGeo = new THREE.CylinderGeometry(0.022, 0.035, 2.5, 12);
  stakeGeo.computeVertexNormals();
  const stake = new THREE.Mesh(stakeGeo, getCleanPBR({ color: 0xc29b62, roughness: 0.85 }));
  stake.position.set(0.05, 1.25, 0.05);
  stake.castShadow = true;
  group.add(stake);

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 2 * 4.5;
    const r = 0.06 + (1 - t) * 0.03;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0.35 + t * 1.95, Math.sin(a) * r));
  }
  const vineGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.016, 8, false);
  vineGeo.computeVertexNormals();
  const vine = new THREE.Mesh(vineGeo, getCleanPBR({ color: 0x2e7d32, roughness: 0.45, clearcoat: 0.3 }));
  vine.castShadow = true;
  group.add(vine);

  const yamLeafTex = getLeafTexture('yam');
  const leafMat = getCleanPBR({
    map: yamLeafTex.map,
    alphaMap: yamLeafTex.alphaMap,
    bumpMap: yamLeafTex.bumpMap,
    bumpScale: 0.05,
    roughnessMap: yamLeafTex.roughnessMap,
    transparent: true,
    alphaTest: 0.3,
    roughness: 0.35,
    clearcoat: 0.4,
  });

  for (let i = 0; i < 14; i++) {
    const t = (i + 1) / 15;
    const p = pts[Math.floor(t * pts.length)];
    if (p) {
      const leafCard = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.42), leafMat);
      leafCard.position.copy(p);
      leafCard.rotation.set(0.3, i * 1.3, 0.5);
      leafCard.castShadow = true;
      group.add(leafCard);
    }
  }

  return group;
}

// ─── 7. REALISTIC SCULPTED FAUNA (Exported from SculptedFauna) ───────────────
export {
  buildSculptedChicken as buildCleanChicken,
  buildSculptedGoat as buildCleanGoat,
  buildSculptedSnail as buildCleanSnail,
} from './SculptedFauna';
