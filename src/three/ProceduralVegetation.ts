/**
 * Farm Atlas — ProceduralVegetation
 * Seamlessly integrates clean PBR botanical & faunal specimens
 */

export {
  buildCleanCocoa as buildCocoa,
  buildCleanOilPalm as buildOilPalm,
  buildCleanPlantain as buildPlantain,
  buildCleanMaize as buildMaize,
  buildCleanYamMound as buildYamMound,
} from './CleanBotanicalModels';

export {
  buildSculptedChicken as buildChicken,
  buildSculptedGoat as buildGoat,
  buildSculptedSnail as buildCleanSnail,
} from './SculptedFauna';

import * as THREE from 'three';
import { getCleanPBR, buildEmergentTree } from './CleanBotanicalModels';
import {
  generateEmergentHardwood,
  generateCocoaTree,
  generateFruitTree,
  generatePawpaw,
} from './ProceduralTreeEngine';

export {
  buildEmergentTree,
  generateEmergentHardwood,
  generateCocoaTree,
  generateFruitTree,
  generatePawpaw,
};

// Helper: Random in Circle
function randInCircle(radius: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

// ─── CLEAN CASSAVA SPECIMEN (Manihot esculenta) ──────────────────────────────
export function buildCassava(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.04, 0.6, 0.02),
    new THREE.Vector3(-0.02, 1.2, -0.02),
    new THREE.Vector3(0.02, 1.8, 0.01),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.045, 12, false);
  stemGeo.computeVertexNormals();
  const stemMat = getCleanPBR({ color: 0x82643a, roughness: 0.8, clearcoat: 0.1 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.castShadow = true;
  stem.receiveShadow = true;
  group.add(stem);

  const nodes = [0.8, 1.3, 1.8];
  nodes.forEach((nodeY, nIdx) => {
    const clusterCount = 5 + nIdx;
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2 + nIdx * 0.5;
      const petioleGroup = new THREE.Group();
      petioleGroup.position.set(0, nodeY, 0);
      petioleGroup.rotation.y = angle;
      petioleGroup.rotation.z = -0.3 - Math.random() * 0.2;

      const petioleGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.45, 8);
      petioleGeo.computeVertexNormals();
      const petiole = new THREE.Mesh(petioleGeo, getCleanPBR({ color: 0xb94a48, roughness: 0.5, clearcoat: 0.3 }));
      petiole.position.set(0.22, 0, 0);
      petiole.rotation.z = Math.PI / 2;
      petioleGroup.add(petiole);

      const leafMat = getCleanPBR({ color: nIdx === 2 ? 0x22c55e : 0x15803d, roughness: 0.35, clearcoat: 0.35 });
      for (let f = -2; f <= 2; f++) {
        const fingerAngle = f * 0.28;
        const leafLen = 0.52 - Math.abs(f) * 0.08;
        const leafGeo = new THREE.ConeGeometry(0.055, leafLen, 8);
        leafGeo.scale(1, 1, 0.15);
        leafGeo.computeVertexNormals();
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(0.45 + (leafLen / 2) * Math.cos(fingerAngle), 0, (leafLen / 2) * Math.sin(fingerAngle));
        leaf.rotation.z = -Math.PI / 2 + 0.15;
        leaf.rotation.y = fingerAngle;
        leaf.castShadow = true;
        petioleGroup.add(leaf);
      }

      group.add(petioleGroup);
    }
  });

  return group;
}

// ─── CLEAN PINEAPPLE SPECIMEN (Ananas comosus) ──────────────────────────────
export function buildPineapple(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const leafCount = 20;
  const leafMat = getCleanPBR({ color: 0x3f6212, roughness: 0.4, clearcoat: 0.35 });
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafLen = 0.65 + Math.random() * 0.15;
    const leafGeo = new THREE.ConeGeometry(0.04, leafLen, 6);
    leafGeo.scale(1, 1, 0.12);
    leafGeo.computeVertexNormals();
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.1, 0.25, Math.sin(angle) * 0.1);
    leaf.rotation.set(Math.sin(angle) * 0.8, 0, -Math.cos(angle) * 0.8);
    leaf.castShadow = true;
    group.add(leaf);
  }

  const fruitGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.45, 16);
  fruitGeo.computeVertexNormals();
  const fruitMat = getCleanPBR({ color: 0xf59e0b, roughness: 0.45, clearcoat: 0.4, emissive: 0xd97706, emissiveIntensity: 0.15 });
  const fruit = new THREE.Mesh(fruitGeo, fruitMat);
  fruit.position.y = 0.35;
  fruit.castShadow = true;
  group.add(fruit);

  const crownMat = getCleanPBR({ color: 0x4d7c0f, roughness: 0.4, clearcoat: 0.35 });
  for (let c = 0; c < 8; c++) {
    const cAngle = (c / 8) * Math.PI * 2;
    const crownGeo = new THREE.ConeGeometry(0.025, 0.28, 6);
    crownGeo.computeVertexNormals();
    const crownLeaf = new THREE.Mesh(crownGeo, crownMat);
    crownLeaf.position.set(Math.cos(cAngle) * 0.05, 0.68, Math.sin(cAngle) * 0.05);
    crownLeaf.rotation.set(Math.sin(cAngle) * 0.3, 0, -Math.cos(cAngle) * 0.3);
    group.add(crownLeaf);
  }

  return group;
}

// ─── CLEAN SHRUB / VEGETABLE SPECIMEN ────────────────────────────────────────
export function buildShrub(
  x = 0, z = 0,
  color = 0x16a34a,
  height = 0.65,
  fruitColor?: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const stemGeo = new THREE.CylinderGeometry(0.02, 0.035, height, 10);
  stemGeo.computeVertexNormals();
  const stem = new THREE.Mesh(stemGeo, getCleanPBR({ color: 0x422006, roughness: 0.85 }));
  stem.position.y = height / 2;
  stem.castShadow = true;
  group.add(stem);

  const leafMat = getCleanPBR({ color, roughness: 0.35, clearcoat: 0.35 });
  for (let i = 0; i < 6; i++) {
    const [cx, cz] = randInCircle(0.3);
    const clumpGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.08, 14, 10);
    clumpGeo.computeVertexNormals();
    const clump = new THREE.Mesh(clumpGeo, leafMat);
    clump.position.set(cx, height * 0.75 + Math.random() * 0.15, cz);
    clump.castShadow = true;
    group.add(clump);
  }

  if (fruitColor !== undefined) {
    const fruitMat = getCleanPBR({ color: fruitColor, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.1 });
    for (let f = 0; f < 6; f++) {
      const [fx, fz] = randInCircle(0.25);
      const fruitGeo = new THREE.SphereGeometry(0.05, 12, 10);
      fruitGeo.scale(0.8, 1.5, 0.8);
      fruitGeo.computeVertexNormals();
      const fruit = new THREE.Mesh(fruitGeo, fruitMat);
      fruit.position.set(fx, height * 0.65 + Math.random() * 0.15, fz);
      fruit.castShadow = true;
      group.add(fruit);
    }
  }

  return group;
}

// ─── REALISTIC FRACTAL AGROFORESTRY TREE SPECIMEN ──────────────────────────
export function buildTree(
  x = 0, z = 0,
  _trunkColor = 0x3e2010,
  _canopyColor = 0x15803d,
  trunkH = 6.2,
  _canopyR = 2.4
): THREE.Group {
  // Uses procedural branching tree with buttress roots and realistic leaf clusters
  return buildEmergentTree(x, z, trunkH);
}

// ─── CLEAN PADDY WATER ───────────────────────────────────────────────────────
export function buildPaddyWater(x = 0, z = 0, w = 4.5, d = 4.5): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const waterMat = getCleanPBR({
    color: 0x0284c7,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    transmission: 0.2,
    ior: 1.33,
  });
  const waterGeo = new THREE.PlaneGeometry(w, d, 8, 8);
  waterGeo.computeVertexNormals();
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.03;
  water.receiveShadow = true;
  group.add(water);

  const riceMat = getCleanPBR({ color: 0x84cc16, roughness: 0.4, clearcoat: 0.3 });
  for (let i = 0; i < 35; i++) {
    const [rx, rz] = randInCircle(Math.min(w, d) * 0.42);
    const riceGeo = new THREE.ConeGeometry(0.04, 0.55 + Math.random() * 0.2, 8);
    riceGeo.computeVertexNormals();
    const rice = new THREE.Mesh(riceGeo, riceMat);
    rice.position.set(rx, 0.28, rz);
    rice.castShadow = true;
    group.add(rice);
  }

  return group;
}
