/**
 * Farm Atlas — SculptedFauna
 * Anatomically sculpted, organic 3D fauna specimens for tropical agro-ecosystems.
 * Eliminates boxy/geometric primitive looks with continuous lofted anatomical curves,
 * articulated joints, alpha feather/fur cards, wattle/comb fleshy folds, and realistic horns.
 */

import * as THREE from 'three';
import { getCleanPBR } from './CleanBotanicalModels';
import { getFeatherTexture, getGoatFurTexture } from './TextureGenerator';

// ─── 1. ANATOMICALLY SCULPTED DWARF GOAT (Capra hircus) ───────────────────────
export function buildSculptedGoat(x = 0, z = 0): THREE.Group {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.userData.animType = 'goat';
  root.userData.animOffset = Math.random() * Math.PI * 2;

  const furTex = getGoatFurTexture();
  const furMat = getCleanPBR({
    map: furTex,
    roughness: 0.65,
    clearcoat: 0.15,
  });

  const darkHornMat = getCleanPBR({
    color: 0x1c1917,
    roughness: 0.4,
    clearcoat: 0.4,
  });

  const hoofMat = getCleanPBR({
    color: 0x0f0e0d,
    roughness: 0.5,
  });

  // 1. Anatomical Torso (Lofted Spine Curve with Ribcage & Flank Contours)
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.48, -0.32), // Rump
    new THREE.Vector3(0, 0.52, -0.1),  // Loin
    new THREE.Vector3(0, 0.54, 0.12),  // Withers / Ribcage
    new THREE.Vector3(0, 0.62, 0.3),   // Base of neck
  ]);
  const bodyGeo = new THREE.TubeGeometry(spineCurve, 20, 0.18, 16, false);
  bodyGeo.scale(0.85, 1.15, 1.0);
  bodyGeo.computeVertexNormals();
  const body = new THREE.Mesh(bodyGeo, furMat);
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // 2. Sculpted Muscular Neck & Head
  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.6, 0.28);
  neckGroup.name = 'goatNeck';

  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.15, 0.12),
    new THREE.Vector3(0, 0.28, 0.22),
  ]);
  const neckGeo = new THREE.TubeGeometry(neckCurve, 12, 0.1, 14, false);
  neckGeo.computeVertexNormals();
  const neck = new THREE.Mesh(neckGeo, furMat);
  neck.castShadow = true;
  neckGroup.add(neck);

  // Sculpted Tapered Head & Muzzle
  const headGeo = new THREE.SphereGeometry(0.12, 18, 14);
  headGeo.scale(0.75, 0.85, 1.5);
  headGeo.computeVertexNormals();
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.set(0, 0.32, 0.32);
  head.rotation.x = 0.25;
  head.castShadow = true;
  neckGroup.add(head);

  // Dark Muzzle & Nostrils
  const muzzleGeo = new THREE.SphereGeometry(0.065, 12, 10);
  muzzleGeo.scale(0.8, 0.8, 1.2);
  muzzleGeo.computeVertexNormals();
  const muzzle = new THREE.Mesh(muzzleGeo, getCleanPBR({ color: 0x27170d, roughness: 0.7 }));
  muzzle.position.set(0, 0.27, 0.48);
  neckGroup.add(muzzle);

  // Backward-Sweeping Corrugated Horns
  for (const s of [-1, 1]) {
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.04, 0.4, 0.3),
      new THREE.Vector3(s * 0.08, 0.52, 0.24),
      new THREE.Vector3(s * 0.11, 0.58, 0.12),
    ]);
    const hornGeo = new THREE.TubeGeometry(hornCurve, 14, 0.02, 8, false);
    hornGeo.computeVertexNormals();
    const horn = new THREE.Mesh(hornGeo, darkHornMat);
    horn.castShadow = true;
    neckGroup.add(horn);

    // Drooped Ears
    const earGeo = new THREE.ConeGeometry(0.035, 0.14, 8);
    earGeo.scale(1.3, 1, 0.25);
    earGeo.computeVertexNormals();
    const ear = new THREE.Mesh(earGeo, furMat);
    ear.position.set(s * 0.11, 0.38, 0.26);
    ear.rotation.set(0.4, 0, s * 1.2);
    neckGroup.add(ear);
  }

  // Chin Goatee Beard
  const beardGeo = new THREE.ConeGeometry(0.025, 0.1, 6);
  beardGeo.computeVertexNormals();
  const beard = new THREE.Mesh(beardGeo, getCleanPBR({ color: 0x451a03, roughness: 0.8 }));
  beard.position.set(0, 0.2, 0.38);
  beard.rotation.x = -0.3;
  neckGroup.add(beard);

  root.add(neckGroup);

  // 3. Articulated Legs with Shoulders, Hocks, and Cloven Hooves
  const legConfigs = [
    { x: -0.12, z: 0.22, front: true },
    { x: 0.12,  z: 0.22, front: true },
    { x: -0.11, z: -0.24, front: false },
    { x: 0.11,  z: -0.24, front: false },
  ];

  legConfigs.forEach(cfg => {
    const legGroup = new THREE.Group();
    legGroup.position.set(cfg.x, 0, cfg.z);

    // Thigh / Upper Leg
    const upperGeo = new THREE.CylinderGeometry(0.045, 0.032, 0.24, 10);
    upperGeo.computeVertexNormals();
    const upper = new THREE.Mesh(upperGeo, furMat);
    upper.position.y = 0.36;
    upper.rotation.x = cfg.front ? -0.1 : 0.15;
    upper.castShadow = true;
    legGroup.add(upper);

    // Lower Leg / Shank
    const lowerGeo = new THREE.CylinderGeometry(0.028, 0.02, 0.22, 10);
    lowerGeo.computeVertexNormals();
    const lower = new THREE.Mesh(lowerGeo, furMat);
    lower.position.set(0, 0.15, cfg.front ? -0.02 : 0.03);
    lower.rotation.x = cfg.front ? 0.08 : -0.12;
    lower.castShadow = true;
    legGroup.add(lower);

    // Cloven Hoof
    const hoofGeo = new THREE.BoxGeometry(0.04, 0.04, 0.05);
    hoofGeo.computeVertexNormals();
    const hoof = new THREE.Mesh(hoofGeo, hoofMat);
    hoof.position.set(0, 0.02, 0);
    hoof.castShadow = true;
    legGroup.add(hoof);

    root.add(legGroup);
  });

  // Short Up-curved Tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, -0.34),
    new THREE.Vector3(0, 0.58, -0.42),
    new THREE.Vector3(0, 0.65, -0.44),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 8, 0.02, 6, false);
  tailGeo.computeVertexNormals();
  const tail = new THREE.Mesh(tailGeo, furMat);
  tail.castShadow = true;
  root.add(tail);

  return root;
}

// ─── 2. ANATOMICALLY SCULPTED FREE-RANGE CHICKEN (Gallus gallus domesticus) ──
export function buildSculptedChicken(x = 0, z = 0): THREE.Group {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.userData.animType = 'chicken';
  root.userData.animOffset = Math.random() * Math.PI * 2;

  const featherTex = getFeatherTexture();
  const featherMat = getCleanPBR({
    map: featherTex,
    roughness: 0.5,
    clearcoat: 0.25,
  });

  const fleshMat = getCleanPBR({
    color: 0xdc2626,
    roughness: 0.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  const beakMat = getCleanPBR({
    color: 0xfacc15,
    roughness: 0.3,
    clearcoat: 0.4,
  });

  // 1. Aerodynamic Teardrop Body (Contoured Breast & Saddle)
  const bodyGeo = new THREE.SphereGeometry(0.16, 20, 16);
  bodyGeo.scale(0.85, 1.0, 1.45);
  bodyGeo.computeVertexNormals();
  const body = new THREE.Mesh(bodyGeo, featherMat);
  body.position.set(0, 0.28, 0);
  body.rotation.x = -0.15;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // 2. Sculpted Flared Sickle Tail Feathers
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.34, -0.18);
  for (let t = -2; t <= 2; t++) {
    const tAngle = t * 0.15;
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(t * 0.025, 0.18, -0.12),
      new THREE.Vector3(t * 0.04, 0.3, -0.22),
    ]);
    const tGeo = new THREE.TubeGeometry(tCurve, 10, 0.02, 6, false);
    tGeo.scale(1, 0.2, 1);
    tGeo.computeVertexNormals();
    const tMesh = new THREE.Mesh(tGeo, getCleanPBR({ color: 0x1e3a8a, roughness: 0.35, clearcoat: 0.4 }));
    tMesh.rotation.y = tAngle;
    tMesh.castShadow = true;
    tailGroup.add(tMesh);
  }
  root.add(tailGroup);

  // 3. S-Curved Avian Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.32, 0.18);
  headGroup.name = 'chickenHead';

  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.12, 0.04),
    new THREE.Vector3(0, 0.22, 0.06),
  ]);
  const neckGeo = new THREE.TubeGeometry(neckCurve, 10, 0.045, 12, false);
  neckGeo.computeVertexNormals();
  const neck = new THREE.Mesh(neckGeo, featherMat);
  neck.castShadow = true;
  headGroup.add(neck);

  // Sleek Avian Head
  const headGeo = new THREE.SphereGeometry(0.065, 16, 12);
  headGeo.scale(0.8, 0.9, 1.2);
  headGeo.computeVertexNormals();
  const head = new THREE.Mesh(headGeo, featherMat);
  head.position.set(0, 0.24, 0.08);
  headGroup.add(head);

  // Serrated Crown Comb
  for (let c = 0; c < 4; c++) {
    const combPoint = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.045 + c * 0.01, 6),
      fleshMat
    );
    combPoint.position.set(0, 0.3 + c * 0.005, 0.06 + c * 0.02);
    headGroup.add(combPoint);
  }

  // Fleshy Pendulous Wattles
  for (const s of [-0.012, 0.012]) {
    const wattle = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 10, 8),
      fleshMat
    );
    wattle.scale.set(0.5, 1.6, 0.8);
    wattle.position.set(s, 0.18, 0.11);
    headGroup.add(wattle);
  }

  // Tapered Sharp Beak
  const beakGeo = new THREE.ConeGeometry(0.02, 0.06, 8);
  beakGeo.computeVertexNormals();
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.23, 0.16);
  beak.rotation.x = Math.PI / 2;
  headGroup.add(beak);

  root.add(headGroup);

  // 4. Scaled Yellow Legs & 3-Toed Spurred Feet
  const legMat = getCleanPBR({ color: 0xf59e0b, roughness: 0.5 });
  for (const side of [-0.06, 0.06]) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side, 0, 0);

    // Shank
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.008, 0.18, 8), legMat);
    shank.position.set(0, 0.1, 0);
    shank.castShadow = true;
    legGroup.add(shank);

    // 3 Radiating Front Toes & 1 Back Spur
    for (const tAngle of [-0.45, 0, 0.45]) {
      const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.07, 6), legMat);
      toe.position.set(Math.sin(tAngle) * 0.03, 0.005, 0.03 + Math.cos(tAngle) * 0.02);
      toe.rotation.set(Math.PI / 2, 0, tAngle);
      legGroup.add(toe);
    }
    const backToe = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.04, 6), legMat);
    backToe.position.set(0, 0.005, -0.02);
    backToe.rotation.x = -Math.PI / 2;
    legGroup.add(backToe);

    root.add(legGroup);
  }

  return root;
}

// ─── 3. ANATOMICALLY SCULPTED GIANT LAND SNAIL (Archachatina marginata) ──────
export function buildSculptedSnail(x = 0, z = 0): THREE.Group {
  const root = new THREE.Group();
  root.position.set(x, 0, z);

  // Fleshy Creeping Muscular Foot
  const footGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.48, 16);
  footGeo.scale(1, 0.35, 1.4);
  footGeo.computeVertexNormals();
  const footMat = getCleanPBR({ color: 0x3d2817, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.1 });
  const foot = new THREE.Mesh(footGeo, footMat);
  foot.position.set(0, 0.04, 0);
  root.add(foot);

  // Logarithmic Spiral Dextral Shell (Tiger Snail Pattern)
  const shellGeo = new THREE.ConeGeometry(0.14, 0.38, 20);
  shellGeo.scale(1.2, 1, 0.9);
  shellGeo.computeVertexNormals();
  const shellMat = getCleanPBR({
    color: 0x78350f,
    roughness: 0.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.15,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.position.set(0, 0.16, -0.06);
  shell.rotation.set(-0.6, 0.2, 0.3);
  shell.castShadow = true;
  root.add(shell);

  // 2 Retractile Eye-stalk Tentacles
  for (const s of [-0.03, 0.03]) {
    const tentacle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.004, 0.1, 6),
      footMat
    );
    tentacle.position.set(s, 0.12, 0.22);
    tentacle.rotation.set(0.6, s * 0.4, 0);
    root.add(tentacle);
  }

  return root;
}
