/**
 * Farm Atlas — ProceduralVegetation
 * Generates 3D meshes for tropical crops using procedural geometry
 */

import * as THREE from 'three';

// ─── Shared Materials Cache ───────────────────────────────────────────────────
const MAT_CACHE = new Map<string, THREE.MeshStandardMaterial>();

function getMat(color: number, roughness = 0.8, metalness = 0): THREE.MeshStandardMaterial {
  const key = `${color}-${roughness}-${metalness}`;
  if (!MAT_CACHE.has(key)) {
    MAT_CACHE.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  }
  return MAT_CACHE.get(key)!;
}

// ─── Helper: Random scatter in circle ────────────────────────────────────────
function randInCircle(radius: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

// ─── CASSAVA ─────────────────────────────────────────────────────────────────
export function buildCassava(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Woody stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 1.8, 7),
    getMat(0x8b6914, 0.9)
  );
  stem.position.y = 0.9;
  stem.castShadow = true;
  group.add(stem);

  // Palmate leaf crown (6–8 leaves)
  const leafCount = 7;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafGroup = new THREE.Group();
    leafGroup.position.set(0, 1.7, 0);
    leafGroup.rotation.y = angle;
    leafGroup.rotation.z = -Math.PI / 5;

    // Leaf blade — tapered box
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.7, 0.25),
      getMat(0x2e7d32, 0.8)
    );
    leaf.position.set(0.3, 0.3, 0);
    leaf.rotation.z = 0.2;
    leafGroup.add(leaf);
    group.add(leafGroup);
  }

  // Storage tubers (underground, shown when in subterranean view)
  for (let t = 0; t < 4; t++) {
    const [tx, tz] = randInCircle(0.25);
    const tuber = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      getMat(0xd4a55a, 0.9)
    );
    tuber.scale.set(1, 2.4, 1); // elongated tuber shape
    tuber.position.set(tx, -0.35 - t * 0.12, tz);
    tuber.castShadow = true;
    group.add(tuber);
  }

  return group;
}

// ─── YAM MOUND ───────────────────────────────────────────────────────────────
export function buildYamMound(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Earthen mound
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    getMat(0x7a5030, 0.98)
  );
  mound.scale.set(1, 0.65, 1);
  mound.receiveShadow = true;
  mound.castShadow = true;
  group.add(mound);

  // Yam vine (spiralling up a maize stake)
  const stakeGeo = new THREE.CylinderGeometry(0.025, 0.03, 2.2, 6);
  const stake = new THREE.Mesh(stakeGeo, getMat(0xd4b060, 0.9));
  stake.position.y = 1.1;
  stake.castShadow = true;
  group.add(stake);

  // Vine tendrils
  const vineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.5, 0),
    new THREE.Vector3(0.06, 0.9, 0.05),
    new THREE.Vector3(0, 1.4, 0),
    new THREE.Vector3(-0.04, 1.8, -0.03),
  ]);
  const vine = new THREE.Mesh(
    new THREE.TubeGeometry(vineCurve, 10, 0.015, 5, false),
    getMat(0x388e3c, 0.85)
  );
  group.add(vine);

  // Yam leaf clusters
  for (let i = 0; i < 3; i++) {
    const h = 0.8 + i * 0.45;
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 4),
      getMat(0x2e7d32, 0.85)
    );
    leaf.scale.set(2.2, 0.3, 1.2);
    leaf.position.set(Math.sin(i * 2.1) * 0.18, h, Math.cos(i * 2.1) * 0.18);
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Underground tuber
  const tuber = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8),
    getMat(0xe8c870, 0.9)
  );
  tuber.scale.set(1, 2.8, 1);
  tuber.position.y = -0.45;
  group.add(tuber);

  return group;
}

// ─── MAIZE / CORN ────────────────────────────────────────────────────────────
export function buildMaize(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const height = 1.8 + Math.random() * 0.4;

  // Stalk segments
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.04, height / 5, 7),
      getMat(i < 2 ? 0x5d8a3c : 0x8db04a, 0.8)
    );
    seg.position.y = (i + 0.5) * (height / 5);
    seg.castShadow = true;
    group.add(seg);
  }

  // Broad leaves at each node
  for (let i = 1; i < 5; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.7, 0.12),
      getMat(0x388e3c, 0.8)
    );
    const leafH = i * (height / 5);
    leaf.position.set(side * 0.28, leafH + 0.15, 0);
    leaf.rotation.z = side * 0.55;
    leaf.rotation.y = i * 0.8;
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Tassel
  for (let t = 0; t < 5; t++) {
    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0, 0.18, 4),
      getMat(0xd4b040, 0.7)
    );
    tassel.position.set(
      (Math.random() - 0.5) * 0.12,
      height + 0.05 + Math.random() * 0.08,
      (Math.random() - 0.5) * 0.12
    );
    tassel.rotation.set(
      (Math.random() - 0.5) * 0.4,
      0,
      (Math.random() - 0.5) * 0.4
    );
    group.add(tassel);
  }

  // Ear (cob)
  if (Math.random() > 0.4) {
    const cob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.045, 0.3, 10),
      getMat(0xf5c842, 0.7)
    );
    cob.position.set(0.06, height * 0.65, 0);
    cob.rotation.z = 0.25;
    cob.castShadow = true;
    group.add(cob);
  }

  return group;
}

// ─── OIL PALM ─────────────────────────────────────────────────────────────────
export function buildOilPalm(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunkH = 5 + Math.random() * 2;

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, trunkH, 10),
    getMat(0x5a4020, 0.95)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Fronds (crown)
  const frondCount = 18;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondGroup = new THREE.Group();
    frondGroup.position.y = trunkH;
    frondGroup.rotation.y = angle;
    frondGroup.rotation.z = -Math.PI / 4 - Math.random() * 0.2;

    // Rachis
    const rachis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.025, 2.8, 5),
      getMat(0x3d6b20, 0.8)
    );
    rachis.position.set(1.4, 0, 0);
    rachis.rotation.z = Math.PI / 2;
    frondGroup.add(rachis);

    // Pinnae (leaflets) along rachis
    for (let p = 0; p < 10; p++) {
      const pinnaeSide = p % 2 === 0 ? 1 : -1;
      const pinnae = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.28, 0.04),
        getMat(0x2e7d32, 0.85)
      );
      pinnae.position.set(0.35 + p * 0.22, 0, pinnaeSide * 0.14);
      pinnae.rotation.z = pinnaeSide * 0.35;
      frondGroup.add(pinnae);
    }

    group.add(frondGroup);
  }

  // Fruit bunch at base of crown
  const bunch = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 8),
    getMat(0xff6d00, 0.75)
  );
  bunch.scale.set(0.9, 0.7, 0.9);
  bunch.position.y = trunkH - 0.3;
  bunch.castShadow = true;
  group.add(bunch);

  return group;
}

// ─── PLANTAIN / BANANA ────────────────────────────────────────────────────────
export function buildPlantain(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const pseudostemH = 2.5 + Math.random() * 0.7;

  // Pseudostem (formed from overlapping leaf sheaths)
  const pstem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, pseudostemH, 8),
    getMat(0x5a8040, 0.85)
  );
  pstem.position.y = pseudostemH / 2;
  pstem.castShadow = true;
  group.add(pstem);

  // Giant paddle leaves
  for (let l = 0; l < 5; l++) {
    const angle = (l / 5) * Math.PI * 2;
    const leafGroup = new THREE.Group();
    leafGroup.position.y = pseudostemH;
    leafGroup.rotation.y = angle;
    leafGroup.rotation.z = -Math.PI / 5;

    // Midrib
    const midrib = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 1.8, 0.04),
      getMat(0x6aaf48, 0.8)
    );
    midrib.position.set(0.7, 0.5, 0);
    midrib.rotation.z = Math.PI / 2;
    leafGroup.add(midrib);

    // Blade halves
    for (const side of [-1, 1]) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.5, 0.3),
        getMat(0x4caf50, 0.78)
      );
      blade.position.set(0.7, 0.3, side * 0.17);
      blade.rotation.z = Math.PI / 2;
      leafGroup.add(blade);
    }

    group.add(leafGroup);
  }

  // Banana bunch
  if (Math.random() > 0.4) {
    const bunchGroup = new THREE.Group();
    bunchGroup.position.set(0.2, pseudostemH - 0.6, 0.1);

    for (let b = 0; b < 6; b++) {
      const banana = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.018, 0.22, 6),
        getMat(0xffc300, 0.7)
      );
      banana.position.set(
        Math.cos(b * 1.05) * 0.12,
        -b * 0.06,
        Math.sin(b * 1.05) * 0.12
      );
      banana.rotation.z = Math.random() * 0.3;
      bunchGroup.add(banana);
    }

    group.add(bunchGroup);
  }

  return group;
}

// ─── COCOA TREE ───────────────────────────────────────────────────────────────
export function buildCocoa(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunkH = 1.8 + Math.random() * 0.5;

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.1, trunkH, 8),
    getMat(0x3e2010, 0.92)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Canopy — layered sphere clusters
  for (let layer = 0; layer < 3; layer++) {
    const y = trunkH + layer * 0.4;
    const r = 0.9 - layer * 0.18;
    for (let c = 0; c < 5; c++) {
      const [cx, cz] = randInCircle(r * 0.5);
      const clump = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.35 + Math.random() * 0.1, 7, 5),
        getMat(0x1b5e20, 0.85)
      );
      clump.position.set(cx, y, cz);
      clump.castShadow = true;
      group.add(clump);
    }
  }

  // Cauliflorous pods on trunk
  const podColors = [0xffa000, 0xe65100, 0x4caf50, 0xc62828];
  for (let p = 0; p < 4; p++) {
    const pod = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 6),
      getMat(podColors[p % podColors.length], 0.7)
    );
    pod.scale.set(0.7, 1.5, 0.7);
    const angle = (p / 4) * Math.PI * 2;
    pod.position.set(
      Math.cos(angle) * 0.1,
      0.5 + p * 0.35,
      Math.sin(angle) * 0.1
    );
    pod.castShadow = true;
    group.add(pod);
  }

  return group;
}

// ─── PINEAPPLE ────────────────────────────────────────────────────────────────
export function buildPineapple(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Leaf rosette
  const leafCount = 16;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.55, 0.04),
      getMat(0x558b2f, 0.85)
    );
    leaf.position.set(
      Math.cos(angle) * 0.06,
      0.22,
      Math.sin(angle) * 0.06
    );
    leaf.rotation.y = angle;
    leaf.rotation.z = -Math.PI / 6;
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Fruit
  const fruit = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8),
    getMat(0xf5c842, 0.75)
  );
  fruit.scale.set(1, 1.6, 1);
  fruit.position.y = 0.22;
  fruit.castShadow = true;
  group.add(fruit);

  // Crown leaves
  for (let c = 0; c < 6; c++) {
    const ca = (c / 6) * Math.PI * 2;
    const cl = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.3, 0.03),
      getMat(0x33691e, 0.85)
    );
    cl.position.set(Math.cos(ca) * 0.04, 0.55, Math.sin(ca) * 0.04);
    cl.rotation.y = ca;
    cl.rotation.z = -Math.PI / 8;
    group.add(cl);
  }

  return group;
}

// ─── GENERIC SHRUB (for peppers, bitter leaf, scent leaf etc.) ───────────────
export function buildShrub(
  x = 0, z = 0,
  color = 0x2e7d32,
  height = 0.6,
  fruitColor?: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, height, 5),
    getMat(0x4a3010, 0.9)
  );
  stem.position.y = height / 2;
  group.add(stem);

  // Foliage clumps
  for (let i = 0; i < 5; i++) {
    const [cx, cz] = randInCircle(0.25);
    const clump = new THREE.Mesh(
      new THREE.SphereGeometry(0.14 + Math.random() * 0.06, 6, 4),
      getMat(color, 0.85)
    );
    clump.position.set(cx, height * 0.7 + Math.random() * 0.15, cz);
    clump.castShadow = true;
    group.add(clump);
  }

  // Fruits / peppers
  if (fruitColor !== undefined) {
    for (let f = 0; f < 5; f++) {
      const [fx, fz] = randInCircle(0.2);
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 5, 4),
        getMat(fruitColor, 0.65)
      );
      fruit.scale.set(0.7, 1.8, 0.7);
      fruit.position.set(fx, height * 0.6 + Math.random() * 0.1, fz);
      group.add(fruit);
    }
  }

  return group;
}

// ─── GENERIC TREE (mango, avocado, breadfruit etc.) ──────────────────────────
export function buildTree(
  x = 0, z = 0,
  trunkColor = 0x4a2810,
  canopyColor = 0x1b5e20,
  trunkH = 3.5,
  canopyR = 2.0
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, trunkH, 8),
    getMat(trunkColor, 0.92)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Canopy clusters
  for (let l = 0; l < 3; l++) {
    const y = trunkH + l * (canopyR * 0.35);
    const r = canopyR - l * (canopyR * 0.2);
    for (let c = 0; c < (3 - l) * 3; c++) {
      const [cx, cz] = randInCircle(r * 0.6);
      const clump = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.35, 7, 5),
        getMat(canopyColor, 0.85)
      );
      clump.position.set(cx, y, cz);
      clump.castShadow = true;
      group.add(clump);
    }
  }

  return group;
}

// ─── WATER CHANNEL / PADDY ───────────────────────────────────────────────────
export function buildPaddyWater(x = 0, z = 0, w = 4, d = 4): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({
      color: 0x1a5276,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.02;
  water.receiveShadow = true;
  group.add(water);

  // Rice stems
  for (let i = 0; i < 30; i++) {
    const [rx, rz] = randInCircle(Math.min(w, d) * 0.45);
    const rice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.01, 0.5 + Math.random() * 0.2, 4),
      getMat(0x8db04a, 0.8)
    );
    rice.position.set(rx, 0.28, rz);
    group.add(rice);
  }

  return group;
}

// ─── EARTHEN MOUND TERRAIN ────────────────────────────────────────────────────
export function buildMoundTerrain(count = 6, spread = 5): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = spread * 0.5 + Math.random() * spread * 0.3;
    const mx = Math.cos(angle) * r;
    const mz = Math.sin(angle) * r;
    const mound = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      getMat(0x7a5030, 0.97)
    );
    mound.scale.set(1, 0.6, 1);
    mound.position.set(mx, 0, mz);
    mound.receiveShadow = true;
    mound.castShadow = true;
    group.add(mound);
  }
  return group;
}
