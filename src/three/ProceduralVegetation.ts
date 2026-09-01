/**
 * Farm Atlas — ProceduralVegetation
 * Generates stylized, organic 3D botanical & faunal specimens
 * Designed with rich botanical fidelity, subtle curves, and warm natural palettes.
 */

import * as THREE from 'three';

// ─── Shared Materials Cache ───────────────────────────────────────────────────
const MAT_CACHE = new Map<string, THREE.MeshStandardMaterial>();

export function getMat(color: number, roughness = 0.65, metalness = 0.05, emissive = 0x000000): THREE.MeshStandardMaterial {
  const key = `${color}-${roughness}-${metalness}-${emissive}`;
  if (!MAT_CACHE.has(key)) {
    MAT_CACHE.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity: emissive ? 0.3 : 0,
      shadowSide: THREE.DoubleSide,
    }));
  }
  return MAT_CACHE.get(key)!;
}

// ─── Helper: Random in Circle ────────────────────────────────────────────────
function randInCircle(radius: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

// ─── CASSAVA SPECIMEN ────────────────────────────────────────────────────────
export function buildCassava(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  // Woody nodular stem with natural slight tilt
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.04, 0.6, 0.02),
    new THREE.Vector3(-0.02, 1.2, -0.02),
    new THREE.Vector3(0.02, 1.8, 0.01),
  ]);
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(stemCurve, 12, 0.045, 8, false),
    getMat(0x82643a, 0.85)
  );
  stem.castShadow = true;
  stem.receiveShadow = true;
  group.add(stem);

  // Palmate leaf clusters at multiple nodes
  const nodes = [0.8, 1.3, 1.8];
  nodes.forEach((nodeY, nIdx) => {
    const clusterCount = 5 + nIdx;
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2 + nIdx * 0.5;
      const petioleGroup = new THREE.Group();
      petioleGroup.position.set(0, nodeY, 0);
      petioleGroup.rotation.y = angle;
      petioleGroup.rotation.z = -0.3 - Math.random() * 0.2;

      // Reddish-green leaf petiole
      const petiole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.012, 0.45, 5),
        getMat(0xb94a48, 0.7)
      );
      petiole.position.set(0.22, 0, 0);
      petiole.rotation.z = Math.PI / 2;
      petioleGroup.add(petiole);

      // Palmate leaflets (5 fingers)
      for (let f = -2; f <= 2; f++) {
        const fingerAngle = f * 0.28;
        const leafLen = 0.5 - Math.abs(f) * 0.08;
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.055, leafLen, 6),
          getMat(nIdx === 2 ? 0x22c55e : 0x15803d, 0.6)
        );
        leaf.scale.set(1, 1, 0.2); // flat leaf blade
        leaf.position.set(0.45 + (leafLen / 2) * Math.cos(fingerAngle), 0, (leafLen / 2) * Math.sin(fingerAngle));
        leaf.rotation.z = -Math.PI / 2 + 0.15;
        leaf.rotation.y = fingerAngle;
        leaf.castShadow = true;
        petioleGroup.add(leaf);
      }

      group.add(petioleGroup);
    }
  });

  // Underground swollen storage tubers (Subterranean View)
  for (let t = 0; t < 5; t++) {
    const angle = (t / 5) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 0.15 + Math.random() * 0.15;
    const tuber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.08, 0.65, 8),
      getMat(0xc49a58, 0.9)
    );
    tuber.scale.set(1, 1, 0.8);
    tuber.position.set(Math.cos(angle) * dist, -0.35, Math.sin(angle) * dist);
    tuber.rotation.set(Math.PI / 3, angle, 0);
    tuber.castShadow = true;
    group.add(tuber);
  }

  return group;
}

// ─── YAM MOUND SPECIMEN ──────────────────────────────────────────────────────
export function buildYamMound(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  // Earthen conical mound with organic surface
  const mound = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 0.75, 18),
    getMat(0x5c3d24, 0.95)
  );
  mound.position.y = 0.35;
  mound.receiveShadow = true;
  mound.castShadow = true;
  group.add(mound);

  // Bamboo / living wooden stake
  const stake = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.035, 2.4, 7),
    getMat(0xc29b62, 0.8)
  );
  stake.position.set(0.05, 1.2, 0.05);
  stake.rotation.z = 0.06;
  stake.castShadow = true;
  group.add(stake);

  // Spiralling vine tube
  const points: THREE.Vector3[] = [];
  const turns = 4;
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const angle = t * Math.PI * 2 * turns;
    const r = 0.06 + (1 - t) * 0.04;
    const vy = 0.35 + t * 1.9;
    points.push(new THREE.Vector3(Math.cos(angle) * r, vy, Math.sin(angle) * r));
  }
  const vineCurve = new THREE.CatmullRomCurve3(points);
  const vine = new THREE.Mesh(
    new THREE.TubeGeometry(vineCurve, 32, 0.016, 6, false),
    getMat(0x2e7d32, 0.7)
  );
  vine.castShadow = true;
  group.add(vine);

  // Heart-shaped yam leaves clustered along the vine
  for (let i = 0; i < 12; i++) {
    const t = (i + 1) / 13;
    const p = vineCurve.getPoint(t);
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.22, 5),
      getMat(0x15803d, 0.6)
    );
    leaf.scale.set(1.4, 1, 0.15); // flat heart-like shape
    leaf.position.copy(p);
    leaf.rotation.set(0.3, i * 1.2, 0.5);
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Giant subterranean yam tuber
  const tuberGeo = new THREE.CylinderGeometry(0.06, 0.15, 0.9, 10);
  const tuber = new THREE.Mesh(tuberGeo, getMat(0xd8b276, 0.9));
  tuber.position.set(0, -0.4, 0);
  tuber.castShadow = true;
  group.add(tuber);

  return group;
}

// ─── MAIZE / CORN SPECIMEN ──────────────────────────────────────────────────
export function buildMaize(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const height = 2.1 + Math.random() * 0.3;

  // Stalk with jointed nodes
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.04, height, 8),
    getMat(0x65a30d, 0.75)
  );
  stalk.position.y = height / 2;
  stalk.castShadow = true;
  group.add(stalk);

  // Gracefully arching ribbon leaves
  const leafNodes = 6;
  for (let i = 1; i <= leafNodes; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const nodeY = (i / (leafNodes + 1)) * height;
    const leafGroup = new THREE.Group();
    leafGroup.position.set(0, nodeY, 0);
    leafGroup.rotation.y = (i * 0.6) + (side * 0.3);

    // Curved ribbon blade
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.35, 0.15, 0),
      new THREE.Vector3(side * 0.75, -0.05, 0),
      new THREE.Vector3(side * 1.0, -0.3, 0),
    ]);
    const blade = new THREE.Mesh(
      new THREE.TubeGeometry(bladeCurve, 8, 0.04, 4, false),
      getMat(0x16a34a, 0.6)
    );
    blade.scale.set(1, 0.15, 1);
    blade.castShadow = true;
    leafGroup.add(blade);
    group.add(leafGroup);
  }

  // Golden silk cob with green husks
  const cobGroup = new THREE.Group();
  cobGroup.position.set(0.06, height * 0.55, 0);
  cobGroup.rotation.z = 0.35;

  // Husk
  const husk = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.45, 8),
    getMat(0x84cc16, 0.7)
  );
  husk.castShadow = true;
  cobGroup.add(husk);

  // Golden silk emerging from top
  const silk = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.15, 5),
    getMat(0xfacc15, 0.5, 0.2, 0xca8a04)
  );
  silk.position.y = 0.24;
  cobGroup.add(silk);
  group.add(cobGroup);

  // Feathery tassel crown at the peak
  for (let t = 0; t < 6; t++) {
    const tasselAngle = (t / 6) * Math.PI * 2;
    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.008, 0.35, 4),
      getMat(0xfde047, 0.6)
    );
    tassel.position.set(Math.cos(tasselAngle) * 0.04, height + 0.15, Math.sin(tasselAngle) * 0.04);
    tassel.rotation.set(Math.cos(tasselAngle) * 0.4, 0, Math.sin(tasselAngle) * 0.4);
    group.add(tassel);
  }

  return group;
}

// ─── OIL PALM SPECIMEN ──────────────────────────────────────────────────────
export function buildOilPalm(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const trunkH = 5.5 + Math.random() * 1.5;

  // Trunk with diamond pattern scars
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.32, trunkH, 12),
    getMat(0x452b14, 0.95)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Crown of 20 arching feather fronds
  const frondCount = 22;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondGroup = new THREE.Group();
    frondGroup.position.y = trunkH - 0.2;
    frondGroup.rotation.y = angle;

    // Curving rachis
    const rachisCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, 0.6, 0),
      new THREE.Vector3(2.5, 0.3, 0),
      new THREE.Vector3(3.6, -0.6, 0),
    ]);
    const rachis = new THREE.Mesh(
      new THREE.TubeGeometry(rachisCurve, 12, 0.035, 6, false),
      getMat(0x2d6a4f, 0.7)
    );
    rachis.castShadow = true;
    frondGroup.add(rachis);

    // Dense radiating leaflets (pinnae)
    for (let p = 1; p <= 14; p++) {
      const t = p / 15;
      const pt = rachisCurve.getPoint(t);
      for (const side of [-1, 1]) {
        const leaflet = new THREE.Mesh(
          new THREE.ConeGeometry(0.045, 0.65, 4),
          getMat(0x16a34a, 0.65)
        );
        leaflet.scale.set(1, 1, 0.1);
        leaflet.position.set(pt.x, pt.y - 0.1, pt.z + side * 0.25);
        leaflet.rotation.set(side * 0.4, 0, -0.4);
        leaflet.castShadow = true;
        frondGroup.add(leaflet);
      }
    }

    group.add(frondGroup);
  }

  // Vivid orange-red fruit bunch in trunk axil
  const fruitBunch = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 10),
    getMat(0xea580c, 0.6, 0.2, 0xc2410c)
  );
  fruitBunch.scale.set(1, 0.8, 1);
  fruitBunch.position.set(0.2, trunkH - 0.4, 0.15);
  fruitBunch.castShadow = true;
  group.add(fruitBunch);

  return group;
}

// ─── PLANTAIN / BANANA SPECIMEN ──────────────────────────────────────────────
export function buildPlantain(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const stemH = 3.0 + Math.random() * 0.6;

  // Pseudostem (green layered sheath)
  const pstem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.22, stemH, 10),
    getMat(0x4d7c0f, 0.8)
  );
  pstem.position.y = stemH / 2;
  pstem.castShadow = true;
  group.add(pstem);

  // Giant paddle leaves
  const leafCount = 7;
  for (let l = 0; l < leafCount; l++) {
    const angle = (l / leafCount) * Math.PI * 2 + (l * 0.2);
    const leafGroup = new THREE.Group();
    leafGroup.position.set(0, stemH - 0.1, 0);
    leafGroup.rotation.y = angle;

    // Graceful arching leaf blade
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.8, 0.6, 0),
      new THREE.Vector3(1.8, 0.4, 0),
      new THREE.Vector3(2.5, -0.3, 0),
    ]);

    const leafGeom = new THREE.PlaneGeometry(2.4, 0.7, 8, 2);
    const leafMat = new THREE.MeshStandardMaterial({
      color: l % 2 === 0 ? 0x22c55e : 0x16a34a,
      roughness: 0.55,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const leafMesh = new THREE.Mesh(leafGeom, leafMat);
    leafMesh.position.set(1.2, 0.3, 0);
    leafMesh.rotation.x = Math.PI / 2.3;
    leafMesh.rotation.y = 0.1;
    leafMesh.castShadow = true;
    leafGroup.add(leafMesh);

    group.add(leafGroup);
  }

  // Hanging banana bunch with purple terminal bell
  const bunchGroup = new THREE.Group();
  bunchGroup.position.set(0.25, stemH - 0.5, 0.15);

  for (let b = 0; b < 10; b++) {
    const ringAngle = (b / 10) * Math.PI * 2;
    const banana = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.016, 0.32, 6),
      getMat(0xfacc15, 0.5)
    );
    banana.position.set(Math.cos(ringAngle) * 0.15, -0.1 - (b * 0.03), Math.sin(ringAngle) * 0.15);
    banana.rotation.set(0.3, ringAngle, 0.2);
    banana.castShadow = true;
    bunchGroup.add(banana);
  }

  // Purple terminal flower bell
  const bell = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.25, 7),
    getMat(0x7e22ce, 0.6, 0.1, 0x581c87)
  );
  bell.position.set(0, -0.5, 0);
  bell.rotation.x = Math.PI;
  bell.castShadow = true;
  bunchGroup.add(bell);

  group.add(bunchGroup);

  return group;
}

// ─── COCOA SPECIMEN ──────────────────────────────────────────────────────────
export function buildCocoa(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  const trunkH = 2.4 + Math.random() * 0.4;

  // Gnarled, branching understory trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.14, trunkH, 8),
    getMat(0x38220f, 0.95)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Branches
  for (let b = 0; b < 4; b++) {
    const bAngle = (b / 4) * Math.PI * 2;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 1.3, 6),
      getMat(0x38220f, 0.95)
    );
    branch.position.set(Math.cos(bAngle) * 0.35, trunkH * 0.8, Math.sin(bAngle) * 0.35);
    branch.rotation.set(Math.sin(bAngle) * 0.7, 0, Math.cos(bAngle) * 0.7);
    branch.castShadow = true;
    group.add(branch);
  }

  // Rich tiered foliage clumps (subcanopy shade crown)
  for (let layer = 0; layer < 4; layer++) {
    const layerY = trunkH + layer * 0.35;
    const radius = 1.3 - layer * 0.2;
    for (let c = 0; c < 5; c++) {
      const [cx, cz] = randInCircle(radius * 0.7);
      const clump = new THREE.Mesh(
        new THREE.SphereGeometry(0.42 + Math.random() * 0.12, 8, 6),
        getMat(layer % 2 === 0 ? 0x14532d : 0x166534, 0.65)
      );
      clump.scale.set(1.4, 0.65, 1.4);
      clump.position.set(cx, layerY, cz);
      clump.castShadow = true;
      group.add(clump);
    }
  }

  // Cauliflorous pods on trunk (ripe yellow, orange, green, burgundy)
  const podColors = [0xf59e0b, 0xea580c, 0x22c55e, 0x991b1b];
  for (let p = 0; p < 5; p++) {
    const angle = (p / 5) * Math.PI * 2;
    const podY = 0.6 + p * 0.32;
    const color = podColors[p % podColors.length];

    const pod = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      getMat(color, 0.5, 0.15)
    );
    pod.scale.set(0.7, 1.8, 0.7);
    pod.position.set(Math.cos(angle) * 0.13, podY, Math.sin(angle) * 0.13);
    pod.rotation.set(0.2, angle, 0.15);
    pod.castShadow = true;
    group.add(pod);
  }

  return group;
}

// ─── PINEAPPLE SPECIMEN ──────────────────────────────────────────────────────
export function buildPineapple(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Geometric rosette of sharp serrated leaves
  const leafCount = 20;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafLen = 0.65 + Math.random() * 0.15;
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, leafLen, 4),
      getMat(0x3f6212, 0.7)
    );
    leaf.scale.set(1, 1, 0.15);
    leaf.position.set(Math.cos(angle) * 0.1, 0.25, Math.sin(angle) * 0.1);
    leaf.rotation.set(Math.sin(angle) * 0.8, 0, -Math.cos(angle) * 0.8);
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Golden patterned fruit
  const fruit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.12, 0.45, 10),
    getMat(0xf59e0b, 0.6, 0.1, 0xd97706)
  );
  fruit.position.y = 0.35;
  fruit.castShadow = true;
  group.add(fruit);

  // Crown of spiked top leaves
  for (let c = 0; c < 8; c++) {
    const cAngle = (c / 8) * Math.PI * 2;
    const crownLeaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.28, 4),
      getMat(0x4d7c0f, 0.65)
    );
    crownLeaf.position.set(Math.cos(cAngle) * 0.05, 0.68, Math.sin(cAngle) * 0.05);
    crownLeaf.rotation.set(Math.sin(cAngle) * 0.3, 0, -Math.cos(cAngle) * 0.3);
    group.add(crownLeaf);
  }

  return group;
}

// ─── SHRUB / VEGETABLE / HERB SPECIMEN ───────────────────────────────────────
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

  // Stems
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.035, height, 6),
    getMat(0x422006, 0.9)
  );
  stem.position.y = height / 2;
  stem.castShadow = true;
  group.add(stem);

  // Foliage cluster
  for (let i = 0; i < 6; i++) {
    const [cx, cz] = randInCircle(0.3);
    const clump = new THREE.Mesh(
      new THREE.SphereGeometry(0.18 + Math.random() * 0.08, 6, 5),
      getMat(color, 0.65)
    );
    clump.position.set(cx, height * 0.75 + Math.random() * 0.15, cz);
    clump.castShadow = true;
    group.add(clump);
  }

  // Bright peppers / tomatoes
  if (fruitColor !== undefined) {
    for (let f = 0; f < 6; f++) {
      const [fx, fz] = randInCircle(0.25);
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 5),
        getMat(fruitColor, 0.45, 0.1)
      );
      fruit.scale.set(0.8, 1.5, 0.8);
      fruit.position.set(fx, height * 0.65 + Math.random() * 0.15, fz);
      fruit.castShadow = true;
      group.add(fruit);
    }
  }

  return group;
}

// ─── GENERIC TREE (Mango / Cashew / Breadfruit) ──────────────────────────────
export function buildTree(
  x = 0, z = 0,
  trunkColor = 0x3e2010,
  canopyColor = 0x15803d,
  trunkH = 3.8,
  canopyR = 2.2
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.swayable = true;
  group.userData.swayPhase = Math.random() * Math.PI * 2;

  // Sturdy trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, trunkH, 10),
    getMat(trunkColor, 0.95)
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Foliage dome
  for (let l = 0; l < 4; l++) {
    const y = trunkH + l * (canopyR * 0.3);
    const r = canopyR - l * (canopyR * 0.18);
    for (let c = 0; c < 6; c++) {
      const [cx, cz] = randInCircle(r * 0.7);
      const clump = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.45, 8, 6),
        getMat(canopyColor, 0.68)
      );
      clump.position.set(cx, y, cz);
      clump.castShadow = true;
      group.add(clump);
    }
  }

  return group;
}

// ─── LOW-POLY STYLIZED FAUNA SPECIMENS ───────────────────────────────────────

// Free-range Chicken
export function buildChicken(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.animType = 'chicken';
  group.userData.animOffset = Math.random() * Math.PI * 2;

  // Body
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    getMat(0xd97706, 0.7)
  );
  body.scale.set(1, 0.8, 1.4);
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);

  // Head & Beak
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 5),
    getMat(0xb45309, 0.7)
  );
  head.position.set(0, 0.32, 0.14);
  group.add(head);

  // Red Comb
  const comb = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.05, 0.06),
    getMat(0xdc2626, 0.5)
  );
  comb.position.set(0, 0.38, 0.14);
  group.add(comb);

  // Beak
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.025, 0.06, 4),
    getMat(0xfacc15, 0.5)
  );
  beak.position.set(0, 0.31, 0.22);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);

  // Legs
  for (const s of [-0.05, 0.05]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4),
      getMat(0xfacc15, 0.8)
    );
    leg.position.set(s, 0.07, 0);
    group.add(leg);
  }

  return group;
}

// West African Dwarf Goat
export function buildGoat(x = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Torso
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.26, 0.55),
    getMat(0x78350f, 0.85)
  );
  body.position.y = 0.38;
  body.castShadow = true;
  group.add(body);

  // Neck & Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.16, 0.22),
    getMat(0x92400e, 0.85)
  );
  head.position.set(0, 0.52, 0.28);
  group.add(head);

  // Horns
  for (const s of [-0.05, 0.05]) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.018, 0.14, 4),
      getMat(0x1c1917, 0.7)
    );
    horn.position.set(s, 0.65, 0.22);
    horn.rotation.set(-0.4, 0, s * 0.3);
    group.add(horn);
  }

  // 4 Legs
  const legPos = [[-0.1, 0.2], [0.1, 0.2], [-0.1, -0.2], [0.1, -0.2]];
  legPos.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.26, 5),
      getMat(0x451a03, 0.9)
    );
    leg.position.set(lx, 0.13, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

// ─── PADDY WATER WITH GLISTENING SURFACE ─────────────────────────────────────
export function buildPaddyWater(x = 0, z = 0, w = 4.5, d = 4.5): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.03;
  water.receiveShadow = true;
  group.add(water);

  // Rice tufts
  for (let i = 0; i < 35; i++) {
    const [rx, rz] = randInCircle(Math.min(w, d) * 0.42);
    const rice = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.55 + Math.random() * 0.2, 5),
      getMat(0x84cc16, 0.6)
    );
    rice.position.set(rx, 0.28, rz);
    rice.castShadow = true;
    group.add(rice);
  }

  return group;
}

// ─── EARTHEN MOUND TERRAIN ────────────────────────────────────────────────────
export function buildMoundTerrain(count = 6, spread = 4.5): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = spread * 0.45 + Math.random() * 0.4;
    const mx = Math.cos(angle) * r;
    const mz = Math.sin(angle) * r;
    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(0.75, 0.6, 16),
      getMat(0x5c3d24, 0.95)
    );
    mound.position.set(mx, 0.3, mz);
    mound.receiveShadow = true;
    mound.castShadow = true;
    group.add(mound);
  }
  return group;
}
