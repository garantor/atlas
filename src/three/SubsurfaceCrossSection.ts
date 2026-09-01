/**
 * Farm Atlas — Subterranean Cross-Section View
 * Soil stratigraphy, root depth zones, Rhizobium nodules, mycorrhizal networks
 */

import * as THREE from 'three';

export function buildSubsurface(): THREE.Group {
  const group = new THREE.Group();

  // ─── Soil Horizon Layers ──────────────────────────────────────────────────
  const horizons = [
    { y: -0.1,  h: 0.15, color: 0x2d4a1a, label: 'O – Organic Litter',  roughness: 0.98 },
    { y: -0.35, h: 0.40, color: 0x4a3010, label: 'A – Topsoil',           roughness: 0.96 },
    { y: -0.80, h: 0.50, color: 0x6b4a20, label: 'B – Subsoil',           roughness: 0.95 },
    { y: -1.35, h: 0.50, color: 0x8b6a3a, label: 'C – Parent Material',   roughness: 0.92 },
    { y: -1.85, h: 0.60, color: 0xb08a5a, label: 'R – Bedrock',            roughness: 0.8  },
  ];

  horizons.forEach(({ y, h, color, roughness }) => {
    const geo = new THREE.BoxGeometry(10, h, 10);
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, y - h / 2, 0);
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // ─── Root Systems ─────────────────────────────────────────────────────────

  // Fibrous shallow roots (leafy greens, 0–15cm)
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 4;
    const z = (Math.random() - 0.5) * 4;
    const root = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.002, 0.08 + Math.random() * 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x8db04a, roughness: 0.9 })
    );
    root.position.set(x, -0.10 - Math.random() * 0.08, z);
    root.rotation.set(
      (Math.random() - 0.5) * 0.5,
      Math.random() * Math.PI,
      (Math.random() - 0.5) * 0.5
    );
    group.add(root);
  }

  // Cassava/Yam storage tubers (20–60cm)
  for (let t = 0; t < 5; t++) {
    const tx = (Math.random() - 0.5) * 4;
    const tz = (Math.random() - 0.5) * 4;

    // Connecting root
    const rootLen = 0.25 + Math.random() * 0.15;
    const rootMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.008, rootLen, 5),
      new THREE.MeshStandardMaterial({ color: 0xc8a060, roughness: 0.9 })
    );
    rootMesh.position.set(tx, -0.2 - rootLen / 2, tz);
    group.add(rootMesh);

    // Tuber
    const tuber = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 + Math.random() * 0.06, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8c870, roughness: 0.85 })
    );
    tuber.scale.set(0.8, 2.2, 0.8);
    tuber.position.set(tx, -0.38 - rootLen, tz);
    group.add(tuber);
  }

  // Deep taproots (pigeon pea, trees: 1.5–3m+)
  const taprootPositions: [number, number][] = [[-2, -2], [2, 1], [-1, 2], [1.5, -1.5]];
  taprootPositions.forEach(([x, z]) => {
    const depth = 1.8 + Math.random() * 0.8;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, -0.05, z),
      new THREE.Vector3(x + (Math.random() - 0.5) * 0.3, -depth * 0.5, z),
      new THREE.Vector3(x, -depth, z),
    ]);
    const taproot = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 12, 0.025, 5, false),
      new THREE.MeshStandardMaterial({ color: 0x6b4010, roughness: 0.9 })
    );
    group.add(taproot);
  });

  // ─── Rhizobium Nodules (on legume roots) ──────────────────────────────────
  for (let n = 0; n < 18; n++) {
    const nx = (Math.random() - 0.5) * 5;
    const nz = (Math.random() - 0.5) * 5;
    const nodule = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.025, 6, 5),
      new THREE.MeshStandardMaterial({
        color: 0xff8080,
        roughness: 0.7,
        emissive: 0xff3030,
        emissiveIntensity: 0.15,
      })
    );
    nodule.position.set(nx, -0.15 - Math.random() * 0.2, nz);
    group.add(nodule);
  }

  // ─── Mycorrhizal Hyphae Network ───────────────────────────────────────────
  for (let h = 0; h < 20; h++) {
    const x1 = (Math.random() - 0.5) * 6;
    const z1 = (Math.random() - 0.5) * 6;
    const x2 = x1 + (Math.random() - 0.5) * 2;
    const z2 = z1 + (Math.random() - 0.5) * 2;
    const depth = -0.08 - Math.random() * 0.3;

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x1, depth, z1),
      new THREE.Vector3((x1 + x2) / 2, depth - 0.05, (z1 + z2) / 2),
      new THREE.Vector3(x2, depth, z2)
    );

    const hypha = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 6, 0.006, 3, false),
      new THREE.MeshStandardMaterial({
        color: 0xf5e0c0,
        roughness: 0.6,
        emissive: 0xffcc80,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.7,
      })
    );
    group.add(hypha);
  }

  // ─── Earthworm Channels ───────────────────────────────────────────────────
  for (let e = 0; e < 6; e++) {
    const ex = (Math.random() - 0.5) * 5;
    const ez = (Math.random() - 0.5) * 5;
    const wormCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ex, -0.05, ez),
      new THREE.Vector3(ex + 0.1, -0.2, ez + 0.05),
      new THREE.Vector3(ex - 0.05, -0.4, ez),
      new THREE.Vector3(ex, -0.6, ez - 0.05),
    ]);
    const channel = new THREE.Mesh(
      new THREE.TubeGeometry(wormCurve, 8, 0.018, 5, false),
      new THREE.MeshStandardMaterial({ color: 0x3a1a08, roughness: 0.95 })
    );
    group.add(channel);
  }

  // ─── Legend Plane (flat plane at the top) ─────────────────────────────────
  // (Labels rendered via CSS overlay in the React component)

  return group;
}
