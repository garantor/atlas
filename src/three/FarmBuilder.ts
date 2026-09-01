/**
 * Farm Atlas — FarmBuilder
 * Assembles procedural 3D scenes for each of the 8 farm ecosystems
 * and dynamically builds custom user-configured polycultures from the Sandbox!
 */

import * as THREE from 'three';
import type { FarmEcosystem, ViewState } from '../data/types';
import {
  buildCassava, buildYamMound, buildMaize, buildOilPalm, buildPlantain,
  buildCocoa, buildPineapple, buildShrub, buildTree, buildPaddyWater,
  buildChicken, buildGoat
} from './ProceduralVegetation';
import { buildSculptedSnail } from './SculptedFauna';
import { buildSubsurface } from './SubsurfaceCrossSection';

type LayerName = 'canopy' | 'shrub' | 'herbaceous' | 'roots' | 'fauna' | 'particles';

function randInCircle(radius: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

export class FarmBuilder {
  private scene: THREE.Scene;
  private farmGroup: THREE.Group | null = null;
  private subsurfaceGroup: THREE.Group | null = null;
  private layers: Map<LayerName, THREE.Group> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private initLayers(idName: string) {
    this.clear();
    this.farmGroup = new THREE.Group();
    this.farmGroup.name = idName;

    const layerNames: LayerName[] = ['canopy', 'shrub', 'herbaceous', 'roots', 'fauna', 'particles'];
    layerNames.forEach(name => {
      const g = new THREE.Group();
      g.name = `layer-${name}`;
      this.layers.set(name, g);
      this.farmGroup!.add(g);
    });

    this.subsurfaceGroup = buildSubsurface();
    this.subsurfaceGroup.visible = false;
    this.farmGroup.add(this.subsurfaceGroup);

    this.scene.add(this.farmGroup);
  }

  build(farm: FarmEcosystem) {
    this.initLayers(`farm-${farm.id}`);
    this.buildFarm(farm);
  }

  /**
   * Dynamically build a custom 3D diorama reflecting the exact crops & fauna
   * configured by the user in the Sandbox!
   */
  buildCustom(cropIds: string[], livestockIds: string[]) {
    this.initLayers('farm-custom-sandbox');

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
    const hasTree = cropIds.some(c => ['mango', 'cashew', 'kola-nut', 'pawpaw'].includes(c));
    const hasMaize = cropIds.includes('maize');
    const hasYam = cropIds.some(c => c.includes('yam'));
    const hasCassava = cropIds.includes('cassava');
    const hasRice = cropIds.includes('ofada-rice');
    const hasPineapple = cropIds.includes('pineapple');
    const hasScentOrBitter = cropIds.includes('scent-leaf') || cropIds.includes('bitter-leaf');
    const hasLegumes = cropIds.some(c => ['cowpea', 'pigeon-pea', 'soybean', 'groundnut', 'bambara-groundnut'].includes(c));
    const hasVeggies = cropIds.some(c => ['hot-pepper', 'tomato', 'okra', 'egusi', 'pumpkin', 'waterleaf', 'ginger'].includes(c));

    // 1. Emergent / Tree Canopy
    if (hasOilPalm) {
      [[-2.8, -2.8], [2.8, -2.8], [0, 3.2]].forEach(([x, z]) => canopy.add(buildOilPalm(x, z)));
    }
    if (hasPlantain) {
      [[-2.2, 2.2], [2.5, 2.0], [0, -3.2]].forEach(([x, z]) => canopy.add(buildPlantain(x, z)));
    }
    if (hasCocoa) {
      [[0, 0], [-1.8, -0.6], [1.8, 0.6], [-0.6, 1.8]].forEach(([x, z]) => shrub.add(buildCocoa(x, z)));
    }
    if (hasTree && !hasOilPalm && !hasPlantain) {
      [[-2.5, 1.5], [2.5, -1.5]].forEach(([x, z]) => canopy.add(buildTree(x, z)));
    }

    // 2. Cereals & Tubers
    if (hasRice) {
      herb.add(buildPaddyWater(0, 0, 6.5, 6.5));
    }
    if (hasYam) {
      [[-2.0, -1.5], [2.0, 1.5], [0, -1.2], [-1.2, 1.8]].forEach(([x, z]) => herb.add(buildYamMound(x, z)));
    }
    if (hasMaize) {
      [[-1.2, -1.8], [1.2, -1.8], [-1.5, 0.5], [1.5, -0.5], [0, 1.5], [2.2, -1.0]].forEach(([x, z]) => herb.add(buildMaize(x, z)));
    }
    if (hasCassava) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 2.4 + Math.random() * 1.5;
        herb.add(buildCassava(Math.cos(angle) * r, Math.sin(angle) * r));
      }
    }

    // 3. Groundcover / Veggies / Legumes / Pineapples
    if (hasPineapple) {
      for (let col = -3.0; col <= 3.0; col += 0.8) {
        if (Math.abs(col) < 5.0) herb.add(buildPineapple(col, 2.6));
      }
    }
    if (hasScentOrBitter) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        shrub.add(buildShrub(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0x14532d, 0.95));
      }
    }
    if (hasLegumes || hasVeggies) {
      for (let i = 0; i < 16; i++) {
        const [gx, gz] = randInCircle(4.2);
        shrub.add(buildShrub(gx, gz, 0x22c55e, 0.5, 0xdc2626));
      }
    }

    // 4. Livestock & Fauna
    if (livestockIds.includes('chickens') || livestockIds.includes('guinea-fowl')) {
      fauna.add(buildChicken(-1.0, 1.0));
      fauna.add(buildChicken(-1.4, 0.6));
    }
    if (livestockIds.includes('wad-goats') || livestockIds.includes('wad-sheep')) {
      fauna.add(buildGoat(2.0, -1.5));
      fauna.add(buildGoat(-2.2, -1.2));
    }
    if (livestockIds.includes('land-snail')) {
      fauna.add(buildSculptedSnail(0.8, -0.8));
      fauna.add(buildSculptedSnail(1.2, -0.5));
    }
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
    const plantainPositions: [number, number][] = [[-2.5, -2.5], [2.8, 1.8], [-1.8, 3.2], [3.2, -2.0], [0, -3.5]];
    plantainPositions.forEach(([x, z]) => canopy.add(buildPlantain(x, z)));

    const cocoaPositions: [number, number][] = [[0, 0], [-1.8, 0.8], [1.8, -0.8], [-0.8, -2.0], [2.2, 2.4], [-2.6, -0.8], [0.8, 1.8]];
    cocoaPositions.forEach(([x, z]) => shrub.add(buildCocoa(x, z)));

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 5.0;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.35));
    }

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5.8, Math.sin(angle) * 5.8, 0x14532d, 0.9));
    }

    fauna.add(buildChicken(-1.2, 0.8));
    fauna.add(buildChicken(-1.5, 0.4));
    fauna.add(buildChicken(1.4, 0.6));
  }

  private buildYamEgusiMound(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    const yamPos: [number, number][] = [[-2.2, -2.0], [2.2, 1.8], [0, 0], [-1.8, 2.4], [2.4, -2.2], [-0.8, -1.2]];
    yamPos.forEach(([x, z]) => herb.add(buildYamMound(x, z)));

    const maizePos: [number, number][] = [[-1.2, -1.5], [1.2, -1.2], [0, 1.8], [-1.5, 1.2], [1.5, 1.6], [0, -2.4], [2.4, 0], [-2.5, 0]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 5.2;
      const egusi = new THREE.Mesh(
        new THREE.SphereGeometry(0.32 + Math.random() * 0.12, 8, 4),
        new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 })
      );
      egusi.scale.set(1.6, 0.15, 1.4);
      egusi.position.set(Math.cos(angle) * r, 0.05, Math.sin(angle) * r);
      egusi.receiveShadow = true;
      herb.add(egusi);
    }

    const ppPos: [number, number][] = [[-4.5, 0], [4.5, 0], [0, 4.5], [0, -4.5], [-3.2, 3.2], [3.2, -3.2]];
    ppPos.forEach(([x, z]) => shrub.add(buildShrub(x, z, 0x15803d, 1.3)));

    fauna.add(buildChicken(0.8, -0.6));
    fauna.add(buildGoat(-3.0, 1.5));
  }

  private buildCassavaMaizeRelay(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    for (let row = -2; row <= 2; row++) {
      for (let col = -3; col <= 3; col++) {
        const x = col * 1.3 + (Math.random() - 0.5) * 0.25;
        const z = row * 1.4 + (Math.random() - 0.5) * 0.25;
        if (Math.hypot(x, z) < 5.4) {
          herb.add(buildCassava(x, z));
        }
      }
    }

    const maizePos: [number, number][] = [[-1.2, -1.8], [1.2, 0.2], [-1.2, 1.8], [1.2, -1.8], [0, 0.8], [-2.5, 0.5], [2.5, -0.5]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0x16a34a, 1.4));
    }

    fauna.add(buildChicken(0.5, 1.5));
    fauna.add(buildChicken(0.9, 1.2));
  }

  private buildOfadaRiceAquaculture(herb: THREE.Group, _shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    herb.add(buildPaddyWater(0, 0, 7.5, 7.5));

    const trenchGeo = new THREE.RingGeometry(4.0, 5.0, 48);
    const trenchMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.rotation.x = -Math.PI / 2;
    trench.position.y = 0.02;
    herb.add(trench);

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 1.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x65a30d, 0.55));
    }

    fauna.add(buildChicken(3.5, 2.5));
  }

  private buildOilPalmSilvopasture(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    const palmPos: [number, number][] = [[-3.0, -3.0], [0, -3.5], [3.0, -3.0], [-3.2, 0], [0, 0], [3.2, 0], [-3.0, 3.0], [0, 3.5], [3.0, 3.0]];
    palmPos.forEach(([x, z]) => canopy.add(buildOilPalm(x, z)));

    for (let row = -2; row <= 2; row++) {
      for (let col = -3.5; col <= 3.5; col += 0.9) {
        const x = col;
        const z = row * 1.8;
        if (Math.hypot(x, z) < 5.2 && Math.random() > 0.3) {
          herb.add(buildPineapple(x, z));
        }
      }
    }

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x15803d, 0.38));
    }

    fauna.add(buildGoat(-1.5, 1.2));
    fauna.add(buildGoat(1.8, -1.5));
  }

  private buildMandalaMarketGarden(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 5.2;
      const isScent = i % 2 === 0;
      shrub.add(buildShrub(
        Math.cos(angle) * r, Math.sin(angle) * r,
        isScent ? 0x16a34a : 0x14532d,
        isScent ? 0.75 : 1.05
      ));
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 3.4;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x22c55e, 0.65, 0xdc2626));
    }

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const r = 1.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.55, 0xea580c));
    }

    herb.add(buildShrub(0, 0, 0x15803d, 0.8));
    fauna.add(buildChicken(2.4, 0.8));
  }

  private buildSavannaCerealBelt(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const x = col * 1.3 + (Math.random() - 0.5) * 0.25;
        const z = row * 1.2 + (Math.random() - 0.5) * 0.25;
        if (Math.hypot(x, z) < 5.4) {
          const isMillet = Math.random() > 0.5;
          herb.add(buildShrub(x, z, isMillet ? 0xca8a04 : 0xb45309, isMillet ? 1.3 : 2.1));
        }
      }
    }

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      shrub.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x65a30d, 0.5));
    }

    fauna.add(buildGoat(-2.0, 1.8));
    fauna.add(buildGoat(2.2, -1.2));
  }

  private buildAquaponicsSnailery(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    const tankGeo = new THREE.BoxGeometry(4.8, 0.9, 3.2);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-1.8, 0.1, 0);
    herb.add(tank);

    const waterSurf = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.05, transparent: true, opacity: 0.9 })
    );
    waterSurf.rotation.x = -Math.PI / 2;
    waterSurf.position.set(-1.8, 0.54, 0);
    herb.add(waterSurf);

    const raft = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.06, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    raft.position.set(2.4, 0.45, 0);
    herb.add(raft);

    for (let i = 0; i < 14; i++) {
      const gx = 1.3 + Math.random() * 2.2;
      const gz = -0.8 + Math.random() * 1.6;
      herb.add(buildShrub(gx, gz, 0x22c55e, 0.32 + Math.random() * 0.15));
    }

    const biofilter = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.1, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
    );
    biofilter.position.set(0.2, 0.55, 1.8);
    herb.add(biofilter);

    shrub.add(buildTree(2.2, -2.8, 0x451a03, 0x16a34a, 2.8, 1.4));

    fauna.add(buildSculptedSnail(1.6, 1.2));
    fauna.add(buildSculptedSnail(2.2, 0.8));
    fauna.add(buildSculptedSnail(0.8, -1.8));
  }

  private buildGenericFarm(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    for (let i = 0; i < 6; i++) {
      const [x, z] = randInCircle(4.5);
      canopy.add(buildTree(x, z));
    }
    for (let i = 0; i < 10; i++) {
      const [x, z] = randInCircle(4.0);
      herb.add(buildCassava(x, z));
    }
    fauna.add(buildChicken(0, 0));
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
