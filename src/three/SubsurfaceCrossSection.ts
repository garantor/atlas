/**
 * Farm Atlas — Subterranean Cross-Section View
 * Soil stratigraphy, root depth zones, Rhizobium nodules, mycorrhizal networks
 */

import * as THREE from 'three';

export function buildSubsurface(): THREE.Group {
  const group = new THREE.Group();

  // ─── Soil Horizon Stratigraphy Cylinders (matching circular diorama) ──────
  const horizons = [
    { y: -0.1,  h: 0.25, color: 0x22381e, roughness: 0.98, r: 8.2 },
    { y: -0.45, h: 0.45, color: 0x3d2410, roughness: 0.96, r: 8.0 },
    { y: -1.00, h: 0.65, color: 0x5a3818, roughness: 0.95, r: 7.8 },
    { y: -1.75, h: 0.85, color: 0x784c24, roughness: 0.92, r: 7.5 },
  ];

  horizons.forEach(({ y, h, color, roughness, r }) => {
    const geo = new THREE.CylinderGeometry(r, r - 0.2, h, 48);
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // ─── Root Networks ─────────────────────────────────────────────────────────

  // Fibrous shallow roots (leafy greens & herbs, 0–20cm)
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 4.5;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const root = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.002, 0.18 + Math.random() * 0.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.8 })
    );
    root.position.set(x, -0.15 - Math.random() * 0.1, z);
    root.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * Math.PI, (Math.random() - 0.5) * 0.6);
    group.add(root);
  }

  // Cassava & Yam storage tubers (20–80cm)
  for (let t = 0; t < 8; t++) {
    const angle = (t / 8) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 1.0 + Math.random() * 2.8;
    const tx = Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;

    const tuber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.16, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 })
    );
    tuber.position.set(tx, -0.65, tz);
    tuber.rotation.set(0.3, angle, 0.2);
    tuber.castShadow = true;
    group.add(tuber);
  }

  // Deep taproots (pigeon pea, trees: 1.5–3m+)
  const taprootPositions: [number, number][] = [[-2.5, -2.0], [2.2, 1.5], [-1.2, 2.5], [1.8, -2.0]];
  taprootPositions.forEach(([x, z]) => {
    const depth = 2.4 + Math.random() * 0.6;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, -0.05, z),
      new THREE.Vector3(x + (Math.random() - 0.5) * 0.4, -depth * 0.5, z),
      new THREE.Vector3(x, -depth, z),
    ]);
    const taproot = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.035, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    group.add(taproot);
  });

  // ─── Glowing Rhizobium Nodules ────────────────────────────────────────────
  for (let n = 0; n < 24; n++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 3.8;
    const nx = Math.cos(angle) * dist;
    const nz = Math.sin(angle) * dist;

    const nodule = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.03, 8, 6),
      new THREE.MeshStandardMaterial({
        color: 0xf87171,
        roughness: 0.5,
        emissive: 0xef4444,
        emissiveIntensity: 0.6,
      })
    );
    nodule.position.set(nx, -0.22 - Math.random() * 0.35, nz);
    group.add(nodule);
  }

  // ─── Bioluminescent Mycorrhizal Hyphae Network ─────────────────────────────
  for (let h = 0; h < 28; h++) {
    const angle1 = Math.random() * Math.PI * 2;
    const dist1 = Math.random() * 4.2;
    const x1 = Math.cos(angle1) * dist1;
    const z1 = Math.sin(angle1) * dist1;

    const x2 = x1 + (Math.random() - 0.5) * 2.5;
    const z2 = z1 + (Math.random() - 0.5) * 2.5;
    const depth = -0.15 - Math.random() * 0.45;

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x1, depth, z1),
      new THREE.Vector3((x1 + x2) / 2, depth - 0.1, (z1 + z2) / 2),
      new THREE.Vector3(x2, depth, z2)
    );

    const hypha = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 8, 0.008, 4, false),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.4,
        emissive: 0xfacc15,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.85,
      })
    );
    group.add(hypha);
  }

  return group;
}
