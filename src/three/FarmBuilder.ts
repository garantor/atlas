/**
 * Farm Atlas — FarmBuilder
 * Assembles procedural 3D scenes for each of the 8 farm ecosystems,
 * multi-block agricultural estates (30 ac, 100 ac, 1,000 ac, 1,000,000 ac),
 * and modular farm infrastructure (roads, farmhouse, CCTV towers, water tower, solar array, drying patio).
 */

import * as THREE from 'three';
import type { FarmEcosystem, ViewState, Season, FarmInfrastructure } from '../data/types';
import {
  buildCassava, buildYamMound, buildMaize, buildOilPalm, buildPlantain,
  buildCocoa, buildPineapple, buildShrub, buildTree, buildPaddyWater,
  buildChicken, buildGoat, buildEmergentTree
} from './ProceduralVegetation';
import { buildSculptedSnail } from './SculptedFauna';
import { buildSubsurface } from './SubsurfaceCrossSection';
import { InstancedGrass } from './InstancedGrass';
import {
  buildFarmhouse,
  buildCctvTower,
  buildWaterTower,
  buildSolarArray,
  buildDryingPatio,
  buildRoadNetwork,
  buildPerimeterFence,
} from './FarmInfrastructureModels';

type LayerName = 'canopy' | 'shrub' | 'herbaceous' | 'roots' | 'fauna' | 'particles' | 'grass' | 'infrastructure';

function randInCircle(radius: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

export function getFootprintDimension(acreage: number): number {
  if (acreage <= 5) return 13.5;
  if (acreage <= 40) return 24.0;
  if (acreage <= 150) return 36.0;
  if (acreage <= 2000) return 52.0;
  return 72.0; // Concession scale (e.g. 10,000 to 1,000,000 acres)
}

export class FarmBuilder {
  private scene: THREE.Scene;
  private farmGroup: THREE.Group | null = null;
  private subsurfaceGroup: THREE.Group | null = null;
  private layers: Map<LayerName, THREE.Group> = new Map();
  private instancedGrass: InstancedGrass | null = null;

  private currentAcreage = 2.47;
  private currentInfra: FarmInfrastructure = {
    roads: true,
    farmhouse: true,
    cctv: true,
    waterTower: true,
    solarArray: true,
    perimeterFence: true,
    dryingPatio: true,
  };
  private lastFarm: FarmEcosystem | null = null;
  private lastCustomConfig: { cropIds: string[]; livestockIds: string[] } | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private initLayers(idName: string, biome = 'rainforest', acreage = 2.47) {
    this.clear();
    this.currentAcreage = acreage;
    this.farmGroup = new THREE.Group();
    this.farmGroup.name = idName;

    const layerNames: LayerName[] = [
      'canopy', 'shrub', 'herbaceous', 'roots', 'fauna', 'particles', 'grass', 'infrastructure'
    ];
    layerNames.forEach(name => {
      const g = new THREE.Group();
      g.name = `layer-${name}`;
      this.layers.set(name, g);
      this.farmGroup!.add(g);
    });

    // Add Dynamic Instanced Grass Ground Layer scaled to acreage
    const dim = getFootprintDimension(acreage);
    const halfD = (dim / 2) * 0.95;
    const bladeCount = acreage <= 5 ? 10000 : 15000;
    this.instancedGrass = new InstancedGrass(bladeCount, {
      minX: -halfD, maxX: halfD, minZ: -halfD, maxZ: halfD
    });
    this.instancedGrass.setBiomePalette(biome);
    const grassLayer = this.layers.get('grass')!;
    grassLayer.add(this.instancedGrass.getMesh());

    this.subsurfaceGroup = buildSubsurface();
    this.subsurfaceGroup.visible = false;
    this.farmGroup.add(this.subsurfaceGroup);

    this.scene.add(this.farmGroup);
  }

  build(farm: FarmEcosystem, acreage = 2.47, infra?: FarmInfrastructure) {
    this.lastFarm = farm;
    this.lastCustomConfig = null;
    if (infra) this.currentInfra = infra;
    this.currentAcreage = acreage;

    this.initLayers(`farm-${farm.id}`, farm.biome, acreage);
    const dim = getFootprintDimension(acreage);

    // Build Infrastructure & Security Layer
    this.buildInfrastructure({ width: dim, depth: dim }, this.currentInfra, acreage);

    // Build Crops and Fauna
    if (acreage >= 10) {
      this.buildMultiBlockEstate(farm, acreage, dim);
    } else {
      this.buildFarm(farm);
    }
  }

  /**
   * Dynamically build a custom 3D diorama reflecting the exact crops & fauna
   * configured by the user in the Sandbox!
   */
  buildCustom(cropIds: string[], livestockIds: string[], acreage = 2.47, infra?: FarmInfrastructure) {
    this.lastFarm = null;
    this.lastCustomConfig = { cropIds, livestockIds };
    if (infra) this.currentInfra = infra;
    this.currentAcreage = acreage;

    this.initLayers('farm-custom-sandbox', 'rainforest', acreage);
    const dim = getFootprintDimension(acreage);

    this.buildInfrastructure({ width: dim, depth: dim }, this.currentInfra, acreage);

    const herb = this.layers.get('herbaceous')!;
    const shrub = this.layers.get('shrub')!;
    const canopy = this.layers.get('canopy')!;
    const fauna = this.layers.get('fauna')!;

    if (cropIds.length === 0 && livestockIds.length === 0) {
      this.buildGenericFarm(herb, shrub, canopy, fauna);
      return;
    }

    // Check presence of specific crops
    const hasOilPalm = cropIds.includes('oil-palm');
    const hasCocoa = cropIds.includes('cocoa');
    const hasPlantain = cropIds.includes('plantain');
    const hasMango = cropIds.includes('mango');
    const hasCashew = cropIds.includes('cashew');
    const hasKola = cropIds.includes('kola-nut');
    const hasPawpaw = cropIds.includes('pawpaw');
    const hasMaize = cropIds.includes('maize');
    const hasYam = cropIds.some(c => c.includes('yam'));
    const hasCassava = cropIds.includes('cassava');
    const hasRice = cropIds.includes('ofada-rice');
    const hasPineapple = cropIds.includes('pineapple');
    const hasScentOrBitter = cropIds.includes('scent-leaf') || cropIds.includes('bitter-leaf');
    const hasLegumes = cropIds.some(c => ['cowpea', 'pigeon-pea', 'soybean', 'groundnut', 'bambara-groundnut'].includes(c));
    const hasVeggies = cropIds.some(c => ['hot-pepper', 'tomato', 'okra', 'egusi', 'pumpkin', 'waterleaf', 'ginger'].includes(c));

    const scaleFactor = acreage >= 10 ? 1.6 : 1.0;

    // 1. Emergent / Tree Canopy
    if (hasOilPalm) {
      [[-2.8, -2.8], [2.8, -2.8], [0, 3.2]].forEach(([x, z]) => canopy.add(buildOilPalm(x * scaleFactor, z * scaleFactor)));
    }
    if (hasPlantain) {
      [[-2.2, 2.2], [2.5, 2.0], [0, -3.2]].forEach(([x, z]) => canopy.add(buildPlantain(x * scaleFactor, z * scaleFactor)));
    }
    if (hasCocoa) {
      [[0, 0], [-1.8, -0.6], [1.8, 0.6], [-0.6, 1.8]].forEach(([x, z]) => shrub.add(buildCocoa(x * scaleFactor, z * scaleFactor)));
    }
    if (hasMango) {
      [[-2.6, 1.8], [2.6, -1.8]].forEach(([x, z]) => canopy.add(buildTree(x * scaleFactor, z * scaleFactor, 0x3a2012, 0x15803d, 5.2)));
    }
    if (hasCashew) {
      [[1.8, 2.4], [-1.8, -2.4]].forEach(([x, z]) => canopy.add(buildTree(x * scaleFactor, z * scaleFactor, 0x451a03, 0x16a34a, 4.8)));
    }
    if (hasKola) {
      [[-3.2, 0], [3.2, 0]].forEach(([x, z]) => canopy.add(buildTree(x * scaleFactor, z * scaleFactor, 0x2e180c, 0x14532d, 5.8)));
    }
    if (hasPawpaw) {
      [[-1.2, 2.8], [1.2, 2.8], [0, -2.6]].forEach(([x, z]) => shrub.add(buildShrub(x * scaleFactor, z * scaleFactor, 0x65a30d, 1.6, 0xeab308)));
    }
    if (!hasOilPalm && !hasPlantain && !hasCocoa && !hasMango && !hasCashew && !hasKola && !hasPawpaw && cropIds.some(c => ['mango', 'cashew', 'kola-nut', 'pawpaw'].includes(c))) {
      [[-2.5, 1.5], [2.5, -1.5]].forEach(([x, z]) => canopy.add(buildTree(x * scaleFactor, z * scaleFactor)));
    }

    // 2. Cereals & Tubers
    if (hasRice) {
      herb.add(buildPaddyWater(0, 0, 5.5 * scaleFactor, 5.5 * scaleFactor));
    }
    if (hasYam) {
      [[-1.5, -1.5], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5]].forEach(([x, z]) => herb.add(buildYamMound(x * scaleFactor, z * scaleFactor)));
    }
    if (hasCassava) {
      [[-1.0, 0], [1.0, 0], [0, -1.2], [0, 1.2], [-2.0, -0.8], [2.0, 0.8]].forEach(([x, z]) => herb.add(buildCassava(x * scaleFactor, z * scaleFactor)));
    }
    if (hasMaize) {
      [[-0.6, -1.8], [0.6, -1.8], [-0.6, 1.8], [0.6, 1.8], [-2.2, 0.5], [2.2, -0.5]].forEach(([x, z]) => herb.add(buildMaize(x * scaleFactor, z * scaleFactor)));
    }

    // 3. Groundcover & Vegetables
    if (hasPineapple) {
      [[-2.0, -2.0], [-1.2, -2.2], [-0.4, -2.4], [0.4, -2.4], [1.2, -2.2], [2.0, -2.0]].forEach(([x, z]) => herb.add(buildPineapple(x * scaleFactor, z * scaleFactor)));
    }
    if (hasVeggies) {
      for (let i = 0; i < 8; i++) {
        const [x, z] = randInCircle(3.2 * scaleFactor);
        herb.add(buildShrub(x, z, 0x16a34a, 0.55, 0xdc2626));
      }
    }
    if (hasLegumes) {
      for (let i = 0; i < 6; i++) {
        const [x, z] = randInCircle(3.0 * scaleFactor);
        herb.add(buildShrub(x, z, 0x22c55e, 0.45));
      }
    }
    if (hasScentOrBitter) {
      for (let i = 0; i < 4; i++) {
        const [x, z] = randInCircle(2.5 * scaleFactor);
        shrub.add(buildShrub(x, z, 0x15803d, 0.85));
      }
    }

    // 4. Fauna
    if (livestockIds.includes('local-chicken') || livestockIds.includes('guinea-fowl')) {
      fauna.add(buildChicken(-0.8 * scaleFactor, 0.6 * scaleFactor));
      fauna.add(buildChicken(0.9 * scaleFactor, -0.4 * scaleFactor));
      fauna.add(buildChicken(-1.4 * scaleFactor, -0.8 * scaleFactor));
    }
    if (livestockIds.includes('wad-goats') || livestockIds.includes('wad-sheep')) {
      fauna.add(buildGoat(2.0 * scaleFactor, -1.5 * scaleFactor));
      fauna.add(buildGoat(-2.2 * scaleFactor, -1.2 * scaleFactor));
    }
    if (livestockIds.includes('land-snail')) {
      fauna.add(buildSculptedSnail(0.8 * scaleFactor, -0.8 * scaleFactor));
      fauna.add(buildSculptedSnail(1.2 * scaleFactor, -0.5 * scaleFactor));
    }
  }

  /**
   * Rebuild or update infrastructure without clearing biological layers
   */
  updateInfrastructure(infra: FarmInfrastructure) {
    this.currentInfra = infra;
    const infraLayer = this.layers.get('infrastructure');
    if (!infraLayer) return;

    while (infraLayer.children.length > 0) {
      const child = infraLayer.children[0];
      infraLayer.remove(child);
      if (child instanceof THREE.Mesh) child.geometry?.dispose();
    }

    const dim = getFootprintDimension(this.currentAcreage);
    this.buildInfrastructure({ width: dim, depth: dim }, infra, this.currentAcreage);
  }

  private buildInfrastructure(
    bounds: { width: number; depth: number },
    infra: FarmInfrastructure,
    acreage: number
  ) {
    const infraLayer = this.layers.get('infrastructure');
    if (!infraLayer) return;

    // 1. Laterite Access Roads & Internal Tracks
    if (infra.roads) {
      infraLayer.add(buildRoadNetwork(bounds, acreage));
    }

    // 2. Central Operations Hub / Farmhouse
    const hubX = acreage >= 10 ? -bounds.width * 0.24 : -bounds.width * 0.32;
    const hubZ = acreage >= 10 ? bounds.depth * 0.24 : bounds.depth * 0.32;

    if (infra.farmhouse) {
      infraLayer.add(buildFarmhouse(hubX, hubZ));
    }

    // 3. Elevated Water Storage Tower & Irrigation
    if (infra.waterTower) {
      infraLayer.add(buildWaterTower(hubX + 2.4, hubZ + 0.1));
    }

    // 4. Photovoltaic Solar Power Array
    if (infra.solarArray) {
      infraLayer.add(buildSolarArray(hubX - 0.2, hubZ - 2.2));
    }

    // 5. Post-Harvest Solar Drying Patio
    if (infra.dryingPatio) {
      infraLayer.add(buildDryingPatio(hubX + 2.3, hubZ - 2.1));
    }

    // 6. Solar CCTV Security Surveillance Towers
    if (infra.cctv) {
      const halfW = bounds.width * 0.46;
      const halfD = bounds.depth * 0.46;

      // 4 Perimeter Corner Surveillance Posts
      infraLayer.add(buildCctvTower(-halfW, -halfD, 3.8));
      infraLayer.add(buildCctvTower(halfW, -halfD, 3.8));
      infraLayer.add(buildCctvTower(halfW, halfD, 3.8));
      infraLayer.add(buildCctvTower(-halfW, halfD, 3.8));

      // Operations hub security mast if acreage >= 30
      if (acreage >= 30) {
        infraLayer.add(buildCctvTower(hubX + 1.2, hubZ + 1.2, 4.8));
      }
    }

    // 7. Perimeter Security Fence & Farm Entrance Gate
    if (infra.perimeterFence) {
      infraLayer.add(buildPerimeterFence(bounds));
    }
  }

  /**
   * Multi-Block Commercial Agricultural Estate (30 ac, 100 ac, 1,000 ac, 1M ac)
   * Arranges the farm diorama into structured parcel sectors with road access
   */
  private buildMultiBlockEstate(farm: FarmEcosystem, acreage: number, dim: number) {
    const herb = this.layers.get('herbaceous')!;
    const shrub = this.layers.get('shrub')!;
    const canopy = this.layers.get('canopy')!;
    const fauna = this.layers.get('fauna')!;

    const halfSpan = dim * 0.42;

    // Perimeter Agroforestry Windbreak Tree Belts
    const windbreakCount = Math.min(16, Math.floor(dim * 0.4));
    for (let i = 0; i < windbreakCount; i++) {
      const step = (i / windbreakCount) * (dim * 0.88) - (dim * 0.44);
      canopy.add(buildTree(step, -halfSpan, 0x2e180c, 0x15803d, 6.5));
      canopy.add(buildTree(halfSpan, step, 0x2e180c, 0x15803d, 6.2));
    }

    // Quadrant 1 (North-East: Cash Crop Canopy Block)
    const q1X = dim * 0.22;
    const q1Z = dim * 0.22;
    if (farm.id.includes('oil-palm') || farm.cropIds.includes('oil-palm')) {
      [[-2.0, -2.0], [0, -2.0], [2.0, -2.0], [-2.0, 0], [0, 0], [2.0, 0], [-2.0, 2.0], [0, 2.0], [2.0, 2.0]].forEach(([ox, oz]) => {
        canopy.add(buildOilPalm(q1X + ox, q1Z + oz));
      });
    } else {
      // Cocoa & Plantain Canopy
      canopy.add(buildEmergentTree(q1X + 2.5, q1Z + 2.5, 7.5));
      [[-2.2, 0], [2.2, 0], [0, -2.2], [0, 2.2]].forEach(([ox, oz]) => canopy.add(buildPlantain(q1X + ox, q1Z + oz)));
      [[-1.2, -1.2], [1.2, 1.2], [1.2, -1.2], [-1.2, 1.2], [0, 0]].forEach(([ox, oz]) => shrub.add(buildCocoa(q1X + ox, q1Z + oz)));
    }

    // Quadrant 2 (South-West: Arable Staple Food Crop Rotation)
    const q2X = -dim * 0.22;
    const q2Z = -dim * 0.22;
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const mx = q2X + c * 2.2;
        const mz = q2Z + r * 2.2;
        if ((r + c) % 2 === 0) {
          herb.add(buildYamMound(mx, mz));
        } else {
          herb.add(buildCassava(mx, mz));
        }
      }
    }
    // Intercropped Maize Rows
    for (let m = -2; m <= 2; m++) {
      herb.add(buildMaize(q2X + m * 1.0, q2Z + 2.8));
    }

    // Quadrant 3 (South-East: Market Garden & Silvopasture)
    const q3X = dim * 0.22;
    const q3Z = -dim * 0.22;
    for (let p = -2; p <= 2; p++) {
      herb.add(buildPineapple(q3X + p * 1.1, q3Z - 1.8));
    }
    for (let s = 0; s < 10; s++) {
      const [sx, sz] = randInCircle(2.8);
      shrub.add(buildShrub(q3X + sx, q3Z + sz, 0x16a34a, 0.6, 0xdc2626));
    }

    // Livestock Pasture in Q3
    fauna.add(buildGoat(q3X + 1.2, q3Z + 0.8));
    fauna.add(buildGoat(q3X - 1.0, q3Z + 1.4));
    fauna.add(buildChicken(q3X - 0.5, q3Z - 0.6));
    fauna.add(buildChicken(q3X + 0.6, q3Z - 1.2));
  }

  private buildFarm(farm: FarmEcosystem) {
    const herb = this.layers.get('herbaceous')!;
    const shrub = this.layers.get('shrub')!;
    const canopy = this.layers.get('canopy')!;
    const fauna = this.layers.get('fauna')!;

    switch (farm.id) {
      case 'cocoa-agroforest':
        this.buildCocoaAgroforest(herb, shrub, canopy, fauna);
        break;
      case 'yam-egusi-mound':
        this.buildYamEgusiMound(herb, shrub, canopy, fauna);
        break;
      case 'cassava-maize-relay':
        this.buildCassavaMaizeRelay(herb, shrub, canopy, fauna);
        break;
      case 'ofada-rice-aquaculture':
        this.buildOfadaRiceAquaculture(herb, shrub, canopy, fauna);
        break;
      case 'oil-palm-silvopasture':
        this.buildOilPalmSilvopasture(herb, shrub, canopy, fauna);
        break;
      case 'mandala-market-garden':
        this.buildMandalaMarketGarden(herb, shrub, canopy, fauna);
        break;
      case 'savanna-cereal-belt':
        this.buildSavannaCerealBelt(herb, shrub, canopy, fauna);
        break;
      case 'aquaponics-snailery':
        this.buildAquaponicsSnailery(herb, shrub, canopy, fauna);
        break;
      default:
        this.buildGenericFarm(herb, shrub, canopy, fauna);
    }
  }

  private buildCocoaAgroforest(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.8, -3.2, 0x2e180c, 0x15803d, 7.2));

    const plantainPositions: [number, number][] = [[-2.5, -2.5], [2.8, 1.8], [3.2, -2.0], [0, -3.5]];
    plantainPositions.forEach(([x, z]) => canopy.add(buildPlantain(x, z)));

    const cocoaPositions: [number, number][] = [[0, 0], [-1.8, 0.8], [1.8, -0.8], [-0.8, -2.0], [2.2, 2.4], [0.8, 1.8]];
    cocoaPositions.forEach(([x, z]) => shrub.add(buildCocoa(x, z)));

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.35));
    }

    fauna.add(buildChicken(0.6, 0.8));
    fauna.add(buildChicken(1.4, 0.6));
  }

  private buildYamEgusiMound(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.8, -3.2, 0x2e180c, 0x15803d, 6.8));

    const yamPos: [number, number][] = [[-2.2, -2.0], [2.2, 1.8], [0, 0], [2.4, -2.2], [-0.8, -1.2]];
    yamPos.forEach(([x, z]) => herb.add(buildYamMound(x, z)));

    const maizePos: [number, number][] = [[-1.2, -1.5], [1.2, -1.2], [0, 1.8], [1.5, 1.6], [0, -2.4], [2.4, 0]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      const egusi = new THREE.Mesh(
        new THREE.SphereGeometry(0.32 + Math.random() * 0.12, 8, 4),
        new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 })
      );
      egusi.scale.set(1.6, 0.15, 1.4);
      egusi.position.set(Math.cos(angle) * r, 0.05, Math.sin(angle) * r);
      egusi.receiveShadow = true;
      herb.add(egusi);
    }

    fauna.add(buildChicken(0.8, -0.6));
    fauna.add(buildGoat(2.2, -1.5));
  }

  private buildCassavaMaizeRelay(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.5, 3.5, 0x2e180c, 0x15803d, 6.5));

    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 3; col++) {
        const x = col * 1.3 + (Math.random() - 0.5) * 0.25;
        const z = row * 1.4 + (Math.random() - 0.5) * 0.25;
        if (Math.hypot(x, z) < 5.2 && !(x < -1 && z > 1)) {
          herb.add(buildCassava(x, z));
        }
      }
    }

    const maizePos: [number, number][] = [[1.2, 0.2], [-1.2, -1.8], [1.2, -1.8], [0, -0.8], [2.5, -0.5]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    fauna.add(buildChicken(0.5, 1.5));
    fauna.add(buildChicken(0.9, 1.2));
  }

  private buildOfadaRiceAquaculture(herb: THREE.Group, _shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.5, -3.2, 0x2e180c, 0x15803d, 6.2));
    herb.add(buildPaddyWater(0.5, 0.5, 6.5, 6.5));

    fauna.add(buildChicken(3.5, 2.5));
  }

  private buildOilPalmSilvopasture(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    const palmPos: [number, number][] = [[-3.0, -3.0], [0, -3.5], [3.0, -3.0], [0, 0], [3.2, 0], [0, 3.5], [3.0, 3.0]];
    palmPos.forEach(([x, z]) => canopy.add(buildOilPalm(x, z)));

    for (let row = -2; row <= 2; row++) {
      for (let col = -2.5; col <= 3.5; col += 0.9) {
        const x = col;
        const z = row * 1.8;
        if (Math.hypot(x, z) < 5.0 && !(x < -1 && z > 1) && Math.random() > 0.35) {
          herb.add(buildPineapple(x, z));
        }
      }
    }

    fauna.add(buildGoat(1.8, -1.5));
    fauna.add(buildGoat(2.2, 1.2));
  }

  private buildMandalaMarketGarden(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.5, -3.5, 0x2e180c, 0x15803d, 6.0));

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const r = 4.8;
      shrub.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.85));
    }

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = 3.2;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x22c55e, 0.65, 0xdc2626));
    }

    herb.add(buildShrub(0, 0, 0x15803d, 0.8));
    fauna.add(buildChicken(2.4, 0.8));
  }

  private buildSavannaCerealBelt(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    canopy.add(buildTree(3.5, -3.2, 0x451a03, 0x84cc16, 5.8));

    for (let row = -3; row <= 3; row++) {
      for (let col = -2; col <= 3; col++) {
        const x = col * 1.3 + (Math.random() - 0.5) * 0.25;
        const z = row * 1.2 + (Math.random() - 0.5) * 0.25;
        if (Math.hypot(x, z) < 5.2 && !(x < -1 && z > 1)) {
          const isMillet = Math.random() > 0.5;
          herb.add(buildShrub(x, z, isMillet ? 0xca8a04 : 0xb45309, isMillet ? 1.3 : 2.1));
        }
      }
    }

    fauna.add(buildGoat(2.2, -1.2));
  }

  private buildAquaponicsSnailery(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    const tankGeo = new THREE.BoxGeometry(4.2, 0.9, 2.8);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0.5, 0.1, -0.8);
    herb.add(tank);

    const waterSurf = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.05, transparent: true, opacity: 0.9 })
    );
    waterSurf.rotation.x = -Math.PI / 2;
    waterSurf.position.set(0.5, 0.54, -0.8);
    herb.add(waterSurf);

    canopy.add(buildTree(2.2, -2.8, 0x451a03, 0x16a34a, 5.2));
    fauna.add(buildSculptedSnail(1.6, 1.2));
    fauna.add(buildSculptedSnail(2.2, 0.8));
  }

  private buildGenericFarm(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    for (let i = 0; i < 3; i++) {
      const [x, z] = randInCircle(4.0);
      canopy.add(buildTree(x, z));
    }
    for (let i = 0; i < 8; i++) {
      const [x, z] = randInCircle(3.5);
      herb.add(buildCassava(x, z));
    }
    fauna.add(buildChicken(0, 0));
  }

  updateGrass(elapsedTime: number, sunPosition?: THREE.Vector3) {
    if (this.instancedGrass) {
      this.instancedGrass.update(elapsedTime, sunPosition);
    }
  }

  setSeason(season: Season) {
    if (this.instancedGrass) {
      this.instancedGrass.setSeason(season);
    }
  }

  setViewState(viewState: ViewState) {
    if (!this.farmGroup || !this.subsurfaceGroup) return;

    const isSubterranean = viewState === 'subterranean';
    this.subsurfaceGroup.visible = isSubterranean;
    this.farmGroup.children.forEach(child => {
      if (child !== this.subsurfaceGroup) {
        child.visible = !isSubterranean;
      }
    });
  }

  setLayerVisible(layer: string, visible: boolean) {
    const g = this.layers.get(layer as LayerName);
    if (g) g.visible = visible;
  }

  getInteractiveObjects(): THREE.Object3D[] {
    if (!this.farmGroup) return [];
    const objs: THREE.Object3D[] = [];
    this.farmGroup.traverse(child => {
      if (child instanceof THREE.Mesh && child.parent) {
        objs.push(child);
      }
    });
    return objs;
  }

  clear() {
    if (this.instancedGrass) {
      this.instancedGrass.dispose();
      this.instancedGrass = null;
    }
    if (this.farmGroup) {
      this.scene.remove(this.farmGroup);
      this.farmGroup.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      this.farmGroup = null;
    }
    this.layers.clear();
    this.subsurfaceGroup = null;
  }

  dispose() {
    this.clear();
  }
}
