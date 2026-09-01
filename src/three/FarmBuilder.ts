/**
 * Farm Atlas — FarmBuilder
 * Assembles procedural 3D scenes for each of the 8 farm ecosystems
 * Arranged inside a stylized circular agroforest diorama.
 */

import * as THREE from 'three';
import type { FarmEcosystem, ViewState } from '../data/types';
import {
  buildCassava, buildYamMound, buildMaize, buildOilPalm, buildPlantain,
  buildCocoa, buildPineapple, buildShrub, buildTree, buildPaddyWater,
  buildMoundTerrain, buildChicken, buildGoat
} from './ProceduralVegetation';
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

  build(farm: FarmEcosystem) {
    this.clear();

    this.farmGroup = new THREE.Group();
    this.farmGroup.name = `farm-${farm.id}`;

    // Initialise layer groups
    const layerNames: LayerName[] = ['canopy', 'shrub', 'herbaceous', 'roots', 'fauna', 'particles'];
    layerNames.forEach(name => {
      const g = new THREE.Group();
      g.name = `layer-${name}`;
      this.layers.set(name, g);
      this.farmGroup!.add(g);
    });

    // Build the specific farm
    this.buildFarm(farm);

    // Subsurface cross-section (hidden by default)
    this.subsurfaceGroup = buildSubsurface();
    this.subsurfaceGroup.visible = false;
    this.farmGroup.add(this.subsurfaceGroup);

    this.scene.add(this.farmGroup);
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
    // Upper emergent/nurse canopy: Plantain & Kola
    const plantainPositions: [number, number][] = [[-2.5, -2.5], [2.8, 1.8], [-1.8, 3.2], [3.2, -2.0], [0, -3.5]];
    plantainPositions.forEach(([x, z]) => canopy.add(buildPlantain(x, z)));

    // Subcanopy: Cocoa trees
    const cocoaPositions: [number, number][] = [[0, 0], [-1.8, 0.8], [1.8, -0.8], [-0.8, -2.0], [2.2, 2.4], [-2.6, -0.8], [0.8, 1.8]];
    cocoaPositions.forEach(([x, z]) => shrub.add(buildCocoa(x, z)));

    // Understory herbaceous: Ginger and cocoyam
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 5.0;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.35));
    }

    // Boundary hedge: Bitter leaf
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5.8, Math.sin(angle) * 5.8, 0x14532d, 0.9));
    }

    // Free-range chickens foraging under cocoa
    fauna.add(buildChicken(-1.2, 0.8));
    fauna.add(buildChicken(-1.5, 0.4));
    fauna.add(buildChicken(1.4, 0.6));
  }

  private buildYamEgusiMound(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    // Conical yam mounds with stakes & vines
    const yamPos: [number, number][] = [[-2.2, -2.0], [2.2, 1.8], [0, 0], [-1.8, 2.4], [2.4, -2.2], [-0.8, -1.2]];
    yamPos.forEach(([x, z]) => herb.add(buildYamMound(x, z)));

    // Living maize stakes around mounds
    const maizePos: [number, number][] = [[-1.2, -1.5], [1.2, -1.2], [0, 1.8], [-1.5, 1.2], [1.5, 1.6], [0, -2.4], [2.4, 0], [-2.5, 0]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    // Egusi melon groundcover (creeping green cushions)
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

    // Pigeon pea boundary shrubs
    const ppPos: [number, number][] = [[-4.5, 0], [4.5, 0], [0, 4.5], [0, -4.5], [-3.2, 3.2], [3.2, -3.2]];
    ppPos.forEach(([x, z]) => shrub.add(buildShrub(x, z, 0x15803d, 1.3)));

    // Fauna
    fauna.add(buildChicken(0.8, -0.6));
    fauna.add(buildGoat(-3.0, 1.5));
  }

  private buildCassavaMaizeRelay(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    // Organized relay rows of cassava
    for (let row = -2; row <= 2; row++) {
      for (let col = -3; col <= 3; col++) {
        const x = col * 1.3 + (Math.random() - 0.5) * 0.25;
        const z = row * 1.4 + (Math.random() - 0.5) * 0.25;
        if (Math.hypot(x, z) < 5.4) {
          herb.add(buildCassava(x, z));
        }
      }
    }

    // Interspersed maize
    const maizePos: [number, number][] = [[-1.2, -1.8], [1.2, 0.2], [-1.2, 1.8], [1.2, -1.8], [0, 0.8], [-2.5, 0.5], [2.5, -0.5]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    // Pigeon pea windbreak
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0x16a34a, 1.4));
    }

    fauna.add(buildChicken(0.5, 1.5));
    fauna.add(buildChicken(0.9, 1.2));
  }

  private buildOfadaRiceAquaculture(herb: THREE.Group, _shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    // Flooded central paddy with glistening water
    herb.add(buildPaddyWater(0, 0, 7.5, 7.5));

    // Deep peripheral fish trench (circular moat)
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

    // Rice tufts on bank
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 1.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x65a30d, 0.55));
    }

    fauna.add(buildChicken(3.5, 2.5));
  }

  private buildOilPalmSilvopasture(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group, fauna: THREE.Group) {
    // Majestic oil palms in triangular grid
    const palmPos: [number, number][] = [[-3.0, -3.0], [0, -3.5], [3.0, -3.0], [-3.2, 0], [0, 0], [3.2, 0], [-3.0, 3.0], [0, 3.5], [3.0, 3.0]];
    palmPos.forEach(([x, z]) => canopy.add(buildOilPalm(x, z)));

    // Pineapple contour rows between palms
    for (let row = -2; row <= 2; row++) {
      for (let col = -3.5; col <= 3.5; col += 0.9) {
        const x = col;
        const z = row * 1.8;
        if (Math.hypot(x, z) < 5.2 && Math.random() > 0.3) {
          herb.add(buildPineapple(x, z));
        }
      }
    }

    // Ginger & sweet potato understory
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x15803d, 0.38));
    }

    // Grazing Dwarf Goats under palm canopy
    fauna.add(buildGoat(-1.5, 1.2));
    fauna.add(buildGoat(1.8, -1.5));
  }

  private buildMandalaMarketGarden(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    // Outer concentric ring — Scent leaf & Bitter leaf aromatic shield
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

    // Middle ring — Scotch bonnet peppers & Okra
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 3.4;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x22c55e, 0.65, 0xdc2626));
    }

    // Inner ring — Tomatoes & leafy greens
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const r = 1.8;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x16a34a, 0.55, 0xea580c));
    }

    // Centerpiece: Pumpkin / Waterleaf bed
    herb.add(buildShrub(0, 0, 0x15803d, 0.8));

    fauna.add(buildChicken(2.4, 0.8));
  }

  private buildSavannaCerealBelt(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, fauna: THREE.Group) {
    // Sorghum and pearl millet rows
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

    // Groundnut / cowpea low groundcover
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 4.8;
      shrub.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x65a30d, 0.5));
    }

    fauna.add(buildGoat(-2.0, 1.8));
    fauna.add(buildGoat(2.2, -1.2));
  }

  private buildAquaponicsSnailery(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group, _fauna: THREE.Group) {
    // Large deep blue fish tank
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

    // Glistening water surface
    const waterSurf = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.05, transparent: true, opacity: 0.9 })
    );
    waterSurf.rotation.x = -Math.PI / 2;
    waterSurf.position.set(-1.8, 0.54, 0);
    herb.add(waterSurf);

    // Floating DWC raft bed
    const raft = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.06, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    raft.position.set(2.4, 0.45, 0);
    herb.add(raft);

    // DWC hydroponic greens
    for (let i = 0; i < 14; i++) {
      const gx = 1.3 + Math.random() * 2.2;
      const gz = -0.8 + Math.random() * 1.6;
      herb.add(buildShrub(gx, gz, 0x22c55e, 0.32 + Math.random() * 0.15));
    }

    // Biofilter module
    const biofilter = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.1, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
    );
    biofilter.position.set(0.2, 0.55, 1.8);
    herb.add(biofilter);

    // Pawpaw tree
    shrub.add(buildTree(2.2, -2.8, 0x451a03, 0x16a34a, 2.8, 1.4));
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
