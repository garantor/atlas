/**
 * Farm Atlas — FarmInfrastructureModels
 * Procedural 3D models for agricultural estate infrastructure:
 * - Farmhouse / Operations Hub & Veranda
 * - Solar CCTV Surveillance Towers with pan-tilt camera & telemetry antenna
 * - Elevated Water Storage Tower & Borehole Pumping Manifold
 * - Photovoltaic Solar Array & Off-Grid Battery Storage
 * - Raised Solar Drying Patios (Cocoa / Cassava)
 * - Laterite Red-Clay Road Network & Internal Tractor Tracks
 * - Perimeter Wire Security Fence & Farm Entrance Gate
 */

import * as THREE from 'three';
import { getCleanPBR } from './CleanBotanicalModels';

// ─── 1. FARMHOUSE / ESTATE OPERATIONS HUB ───────────────────────────────────
export function buildFarmhouse(x = 0, z = 0): THREE.Group {
  const hub = new THREE.Group();
  hub.position.set(x, 0, z);

  // Plinth / Foundation
  const plinthGeo = new THREE.BoxGeometry(3.6, 0.25, 2.8);
  const plinthMat = getCleanPBR({ color: 0x94a3b8, roughness: 0.85 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.125;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  hub.add(plinth);

  // Main Walls (Stucco / Compressed Earth Brick)
  const wallGeo = new THREE.BoxGeometry(2.8, 1.35, 2.2);
  const wallMat = getCleanPBR({ color: 0xf1f5f9, roughness: 0.65 });
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.set(0.25, 0.92, 0);
  walls.castShadow = true;
  walls.receiveShadow = true;
  hub.add(walls);

  // Shaded Front Veranda Posts
  const postMat = getCleanPBR({ color: 0x78350f, roughness: 0.7 });
  for (const pz of [-0.95, 0, 0.95]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8), postMat);
    post.position.set(-1.35, 0.92, pz);
    post.castShadow = true;
    hub.add(post);
  }

  // Veranda Floor Deck
  const deckGeo = new THREE.BoxGeometry(0.8, 0.08, 2.4);
  const deck = new THREE.Mesh(deckGeo, postMat);
  deck.position.set(-1.35, 0.28, 0);
  deck.receiveShadow = true;
  hub.add(deck);

  // Pitched Roof with Overhang (Corrugated Zinc/Steel with Solar Panels)
  const roofGeo = new THREE.ConeGeometry(2.4, 0.75, 4);
  roofGeo.scale(1.2, 1, 0.85);
  roofGeo.computeVertexNormals();
  const roofMat = getCleanPBR({ color: 0x334155, roughness: 0.4, metalness: 0.3 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0.1, 1.95, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  hub.add(roof);

  // Rooftop Solar Panel
  const panelGeo = new THREE.BoxGeometry(1.2, 0.03, 0.75);
  const panelMat = getCleanPBR({
    color: 0x1e3a8a,
    roughness: 0.15,
    metalness: 0.5,
    clearcoat: 0.8,
  });
  const solar = new THREE.Mesh(panelGeo, panelMat);
  solar.position.set(0.2, 2.05, 0.45);
  solar.rotation.x = -0.45;
  hub.add(solar);

  // Office Windows & Door
  const doorGeo = new THREE.BoxGeometry(0.04, 0.9, 0.45);
  const doorMat = getCleanPBR({ color: 0x451a03, roughness: 0.7 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-1.16, 0.72, 0);
  hub.add(door);

  const winGeo = new THREE.BoxGeometry(0.04, 0.45, 0.45);
  const winMat = getCleanPBR({ color: 0x38bdf8, roughness: 0.1, clearcoat: 0.9 });
  const win1 = new THREE.Mesh(winGeo, winMat);
  win1.position.set(-1.16, 0.95, 0.65);
  hub.add(win1);
  const win2 = new THREE.Mesh(winGeo, winMat);
  win2.position.set(-1.16, 0.95, -0.65);
  hub.add(win2);

  // Rainwater Collection Tank on Veranda Flank
  const tankGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.75, 16);
  tankGeo.computeVertexNormals();
  const tankMat = getCleanPBR({ color: 0x0284c7, roughness: 0.35, clearcoat: 0.4 });
  const rainTank = new THREE.Mesh(tankGeo, tankMat);
  rainTank.position.set(1.45, 0.62, 0.85);
  rainTank.castShadow = true;
  hub.add(rainTank);

  return hub;
}

// ─── 2. SOLAR CCTV SURVEILLANCE & SECURITY TOWER ────────────────────────────
export function buildCctvTower(x = 0, z = 0, height = 3.8): THREE.Group {
  const tower = new THREE.Group();
  tower.position.set(x, 0, z);

  const steelMat = getCleanPBR({ color: 0x64748b, roughness: 0.4, metalness: 0.6 });

  // Concrete anchor footing
  const footGeo = new THREE.BoxGeometry(0.4, 0.25, 0.4);
  const foot = new THREE.Mesh(footGeo, getCleanPBR({ color: 0x94a3b8, roughness: 0.9 }));
  foot.position.y = 0.125;
  foot.castShadow = true;
  tower.add(foot);

  // Steel Lattice / Mast Pole
  const poleGeo = new THREE.CylinderGeometry(0.035, 0.055, height, 8);
  poleGeo.computeVertexNormals();
  const pole = new THREE.Mesh(poleGeo, steelMat);
  pole.position.y = height / 2;
  pole.castShadow = true;
  tower.add(pole);

  // Security equipment box at 1.2m
  const boxGeo = new THREE.BoxGeometry(0.22, 0.32, 0.18);
  const box = new THREE.Mesh(boxGeo, getCleanPBR({ color: 0x475569, roughness: 0.5, metalness: 0.4 }));
  box.position.set(0, 1.2, 0.07);
  tower.add(box);

  // Top Equipment Head Bracket
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.28), steelMat);
  bracket.position.y = height;
  tower.add(bracket);

  // Mini Solar Power Panel on Mast
  const solarGeo = new THREE.BoxGeometry(0.45, 0.02, 0.35);
  const solarMat = getCleanPBR({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.6, clearcoat: 0.7 });
  const solar = new THREE.Mesh(solarGeo, solarMat);
  solar.position.set(0, height + 0.18, -0.15);
  solar.rotation.x = -0.55;
  tower.add(solar);

  // 360° Pan-Tilt-Zoom CCTV Dome Camera
  const cameraGroup = new THREE.Group();
  cameraGroup.position.set(0, height - 0.12, 0.18);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6), steelMat);
  arm.rotation.x = Math.PI / 2;
  cameraGroup.add(arm);

  const domeGeo = new THREE.SphereGeometry(0.065, 12, 10);
  const domeMat = getCleanPBR({ color: 0x0f172a, roughness: 0.2, clearcoat: 0.9 });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.set(0, -0.04, 0.08);
  cameraGroup.add(dome);

  // Green Active Status LED indicator
  const ledGeo = new THREE.SphereGeometry(0.012, 6, 6);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0, 0.02, 0.12);
  cameraGroup.add(led);

  tower.add(cameraGroup);

  // Long-range omnidirectional telemetry antenna mast
  const antGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.65, 4);
  const ant = new THREE.Mesh(antGeo, steelMat);
  ant.position.set(0.08, height + 0.35, 0);
  tower.add(ant);

  return tower;
}

// ─── 3. ELEVATED WATER STORAGE TOWER & DRIP IRRIGATION ───────────────────────
export function buildWaterTower(x = 0, z = 0): THREE.Group {
  const tower = new THREE.Group();
  tower.position.set(x, 0, z);

  const steelMat = getCleanPBR({ color: 0x64748b, roughness: 0.45, metalness: 0.5 });

  // 4 Steel Legs
  const legH = 2.8;
  const legSpread = 0.55;
  for (const lx of [-legSpread, legSpread]) {
    for (const lz of [-legSpread, legSpread]) {
      const legCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(lx * 1.3, 0, lz * 1.3),
        new THREE.Vector3(lx, legH, lz),
      ]);
      const legGeo = new THREE.TubeGeometry(legCurve, 6, 0.035, 6, false);
      const leg = new THREE.Mesh(legGeo, steelMat);
      leg.castShadow = true;
      tower.add(leg);
    }
  }

  // Cross Bracing Stays
  for (let b = 1; b <= 2; b++) {
    const by = (b / 3) * legH;
    const brace = new THREE.Mesh(new THREE.BoxGeometry(legSpread * 2.3, 0.025, legSpread * 2.3), steelMat);
    brace.position.y = by;
    tower.add(brace);
  }

  // Elevated Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.6), steelMat);
  deck.position.y = legH;
  deck.castShadow = true;
  tower.add(deck);

  // Safety Railing
  const railMat = getCleanPBR({ color: 0x94a3b8, roughness: 0.5 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), railMat);
  rail.position.y = legH + 0.2;
  tower.add(rail);

  // Dual 5,000L Polyethylene Water Tanks (Deep Blue)
  const tankMat = getCleanPBR({ color: 0x0284c7, roughness: 0.3, clearcoat: 0.5 });
  for (const tx of [-0.38, 0.38]) {
    const tankGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.05, 20);
    tankGeo.computeVertexNormals();
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(tx, legH + 0.6, 0);
    tank.castShadow = true;
    tower.add(tank);
  }

  // Central Vertical Downpipe to Irrigation Main
  const pipeGeo = new THREE.CylinderGeometry(0.03, 0.03, legH, 8);
  const pipeMat = getCleanPBR({ color: 0x0369a1, roughness: 0.4 });
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.position.set(0, legH / 2, 0);
  pipe.castShadow = true;
  tower.add(pipe);

  // Solar Borehole Pump Head at Base
  const pump = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.35), getCleanPBR({ color: 0x15803d, roughness: 0.6 }));
  pump.position.set(0.45, 0.18, 0.45);
  tower.add(pump);

  return tower;
}

// ─── 4. PHOTOVOLTAIC SOLAR ARRAY (Off-Grid Clean Energy) ─────────────────────
export function buildSolarArray(x = 0, z = 0): THREE.Group {
  const array = new THREE.Group();
  array.position.set(x, 0, z);

  const frameMat = getCleanPBR({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });
  const pvMat = getCleanPBR({
    color: 0x0f172a,
    roughness: 0.15,
    metalness: 0.7,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  });

  // Dual Row Racking Frame
  for (let r = 0; r < 2; r++) {
    const rz = (r - 0.5) * 1.35;
    const rack = new THREE.Group();
    rack.position.set(0, 0, rz);

    // Ground posts
    for (const px of [-1.1, 0, 1.1]) {
      const frontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), frameMat);
      frontLeg.position.set(px, 0.175, 0.3);
      rack.add(frontLeg);

      const rearLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 6), frameMat);
      rearLeg.position.set(px, 0.375, -0.3);
      rack.add(rearLeg);
    }

    // Tilted Solar Photovoltaic Module Table
    const tableGeo = new THREE.BoxGeometry(2.6, 0.03, 0.85);
    const table = new THREE.Mesh(tableGeo, pvMat);
    table.position.set(0, 0.5, 0);
    table.rotation.x = 0.38; // Ideal tropical solar tilt
    table.castShadow = true;
    table.receiveShadow = true;
    rack.add(table);

    array.add(rack);
  }

  // Central Inverter & Battery Storage Cabinet
  const inverter = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.65, 0.28),
    getCleanPBR({ color: 0xf8fafc, roughness: 0.4, metalness: 0.4 })
  );
  inverter.position.set(1.55, 0.32, 0);
  inverter.castShadow = true;
  array.add(inverter);

  return array;
}

// ─── 5. SOLAR DRYING PATIO (Post-Harvest Cocoa & Cassava Processing) ──────────
export function buildDryingPatio(x = 0, z = 0, width = 3.2, depth = 2.4): THREE.Group {
  const patio = new THREE.Group();
  patio.position.set(x, 0, z);

  // Raised Concrete Slab Floor
  const floorGeo = new THREE.BoxGeometry(width, 0.12, depth);
  const floorMat = getCleanPBR({ color: 0xcbd5e1, roughness: 0.85 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = 0.06;
  floor.receiveShadow = true;
  patio.add(floor);

  // 3 Raised Wooden Mesh Drying Racks
  const rackMat = getCleanPBR({ color: 0x78350f, roughness: 0.8 });
  const beanMat = getCleanPBR({ color: 0x5c2b14, roughness: 0.6 }); // Fermented drying cocoa beans

  const rackW = width * 0.26;
  const rackD = depth * 0.75;

  for (let i = 0; i < 3; i++) {
    const rx = (i - 1) * (rackW * 1.22);
    const rackGroup = new THREE.Group();
    rackGroup.position.set(rx, 0, 0);

    // 4 Corner Legs
    for (const lx of [-rackW * 0.45, rackW * 0.45]) {
      for (const lz of [-rackD * 0.45, rackD * 0.45]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), rackMat);
        leg.position.set(lx, 0.34, lz);
        leg.castShadow = true;
        rackGroup.add(leg);
      }
    }

    // Mesh Tray Table
    const tray = new THREE.Mesh(new THREE.BoxGeometry(rackW, 0.04, rackD), rackMat);
    tray.position.y = 0.56;
    tray.castShadow = true;
    rackGroup.add(tray);

    // Bed of Cocoa Beans
    const beanBed = new THREE.Mesh(new THREE.BoxGeometry(rackW * 0.92, 0.02, rackD * 0.92), beanMat);
    beanBed.position.y = 0.58;
    rackGroup.add(beanBed);

    patio.add(rackGroup);
  }

  return patio;
}

// ─── 6. LATERITE RED-CLAY ACCESS ROAD NETWORK ────────────────────────────────
export function buildRoadNetwork(
  bounds = { width: 13.5, depth: 13.5 },
  acreage = 2.47
): THREE.Group {
  const roadGroup = new THREE.Group();

  const roadMat = getCleanPBR({
    color: 0x854d0e, // Rich West African laterite red earth
    roughness: 0.92,
    bumpScale: 0.08,
  });

  const pathMat = getCleanPBR({
    color: 0xa16207,
    roughness: 0.95,
  });

  const { width, depth } = bounds;
  const roadWidth = acreage >= 30 ? 1.6 : 1.1;

  // 1. Central Arterial Axis (North-South)
  const nsGeo = new THREE.PlaneGeometry(roadWidth, depth);
  const nsRoad = new THREE.Mesh(nsGeo, roadMat);
  nsRoad.rotation.x = -Math.PI / 2;
  nsRoad.position.set(0, 0.015, 0);
  nsRoad.receiveShadow = true;
  roadGroup.add(nsRoad);

  // 2. Transverse Access Track (East-West)
  const ewGeo = new THREE.PlaneGeometry(width, roadWidth * 0.85);
  const ewRoad = new THREE.Mesh(ewGeo, pathMat);
  ewRoad.rotation.x = -Math.PI / 2;
  ewRoad.position.set(0, 0.016, 0);
  ewRoad.receiveShadow = true;
  roadGroup.add(ewRoad);

  // 3. Perimeter Ring Road if acreage >= 30 acres
  if (acreage >= 10) {
    const halfW = width * 0.48;
    const halfD = depth * 0.48;
    const perimSegments = [
      { w: width * 0.96, d: roadWidth * 0.75, x: 0, z: halfD },
      { w: width * 0.96, d: roadWidth * 0.75, x: 0, z: -halfD },
      { w: roadWidth * 0.75, d: depth * 0.96, x: halfW, z: 0 },
      { w: roadWidth * 0.75, d: depth * 0.96, x: -halfW, z: 0 },
    ];
    perimSegments.forEach(seg => {
      const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(seg.w, seg.d), pathMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set(seg.x, 0.014, seg.z);
      pMesh.receiveShadow = true;
      roadGroup.add(pMesh);
    });
  }

  return roadGroup;
}

// ─── 7. PERIMETER WIRE SECURITY FENCE & GATE ─────────────────────────────────
export function buildPerimeterFence(
  bounds = { width: 13.5, depth: 13.5 }
): THREE.Group {
  const fence = new THREE.Group();

  const postMat = getCleanPBR({ color: 0x475569, roughness: 0.5, metalness: 0.5 });
  const wireMat = getCleanPBR({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.65 });

  const halfW = bounds.width * 0.49;
  const halfD = bounds.depth * 0.49;
  const fenceH = 1.1;

  // Corner Posts & Straining Wire Strands
  const corners: [number, number][] = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [halfW, halfD],
    [-halfW, halfD],
  ];

  corners.forEach(([cx, cz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, fenceH + 0.2, 8), postMat);
    post.position.set(cx, (fenceH + 0.2) / 2, cz);
    post.castShadow = true;
    fence.add(post);
  });

  // Perimeter Wire Planes
  const sides = [
    { w: bounds.width * 0.98, d: 0.02, x: 0, z: halfD },
    { w: bounds.width * 0.98, d: 0.02, x: 0, z: -halfD },
    { w: 0.02, d: bounds.depth * 0.98, x: halfW, z: 0 },
    { w: 0.02, d: bounds.depth * 0.98, x: -halfW, z: 0 },
  ];

  sides.forEach(s => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(s.w, fenceH, s.d), wireMat);
    panel.position.set(s.x, fenceH / 2, s.z);
    fence.add(panel);
  });

  // Farm Entrance Security Gate (at Front Edge)
  const gateW = 1.8;
  const gatePostMat = getCleanPBR({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
  for (const gx of [-gateW / 2, gateW / 2]) {
    const gPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), gatePostMat);
    gPost.position.set(gx, 0.9, halfD);
    gPost.castShadow = true;
    fence.add(gPost);
  }

  // Overhead Farm Entry Signboard Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(gateW + 0.4, 0.28, 0.08), gatePostMat);
  beam.position.set(0, 1.75, halfD);
  fence.add(beam);

  return fence;
}
