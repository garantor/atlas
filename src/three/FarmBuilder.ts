/**
 * Farm Atlas — FarmBuilder
 * Assembles procedural 3D scenes for each of the 8 farm ecosystems
 */

import * as THREE from 'three';
import type { FarmEcosystem, ViewState } from '../data/types';
import {
  buildCassava, buildYamMound, buildMaize, buildOilPalm, buildPlantain,
  buildCocoa, buildPineapple, buildShrub, buildTree, buildPaddyWater,
  buildMoundTerrain
} from './ProceduralVegetation';
import { buildSubsurface } from './SubsurfaceCrossSection';

type LayerName = 'canopy' | 'shrub' | 'herbaceous' | 'roots' | 'fauna' | 'particles';

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
    const herbaceous = this.layers.get('herbaceous')!;
    const shrub = this.layers.get('shrub')!;
    const canopy = this.layers.get('canopy')!;

    switch (farm.id) {
      case 'cocoa-agroforest':
        this.buildCocoaAgroforest(herbaceous, shrub, canopy);
        break;
      case 'yam-egusi-mound':
        this.buildYamEgusiMound(herbaceous, shrub, canopy);
        break;
      case 'cassava-maize-relay':
        this.buildCassavaMaizeRelay(herbaceous, shrub, canopy);
        break;
      case 'ofada-rice-aquaculture':
        this.buildOfadaRiceAquaculture(herbaceous, shrub, canopy);
        break;
      case 'oil-palm-silvopasture':
        this.buildOilPalmSilvopasture(herbaceous, shrub, canopy);
        break;
      case 'mandala-market-garden':
        this.buildMandalaMarketGarden(herbaceous, shrub, canopy);
        break;
      case 'savanna-cereal-belt':
        this.buildSavannaCerealBelt(herbaceous, shrub, canopy);
        break;
      case 'aquaponics-snailery':
        this.buildAquaponicsSnailery(herbaceous, shrub, canopy);
        break;
      default:
        this.buildGenericFarm(herbaceous, shrub, canopy);
    }
  }

  private buildCocoaAgroforest(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group) {
    // Plantain as upper canopy
    const plantainPositions: [number, number][] = [[-3, -3], [3, 2], [-2, 4], [4, -2], [0, -4], [-4, 1]];
    plantainPositions.forEach(([x, z]) => canopy.add(buildPlantain(x, z)));

    // Cocoa trees as subcanopy
    const cocoaPositions: [number, number][] = [[0, 0], [-2, 1], [2, -1], [-1, -3], [3, 3], [-3, -1], [1, 2]];
    cocoaPositions.forEach(([x, z]) => shrub.add(buildCocoa(x, z)));

    // Ginger understory (small green shrubs)
    for (let i = 0; i < 20; i++) {
      const gx = (Math.random() - 0.5) * 10;
      const gz = (Math.random() - 0.5) * 10;
      herb.add(buildShrub(gx, gz, 0x388e3c, 0.35));
    }

    // Bitter leaf boundary hedge
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const hx = Math.cos(angle) * 5.5;
      const hz = Math.sin(angle) * 5.5;
      shrub.add(buildShrub(hx, hz, 0x1b5e20, 0.9));
    }
  }

  private buildYamEgusiMound(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group) {
    // 6 yam mounds
    const moundTerrain = buildMoundTerrain(6, 4);
    herb.add(moundTerrain);

    // Maize stakes around mounds
    const maizePos: [number, number][] = [[-2, -2], [2, -2], [0, 2], [-2, 2], [2, 2], [0, -3], [3, 0], [-3, 0]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    // Yam vines on mounds
    const yamPos: [number, number][] = [[-3, -3], [3, 2], [0, 0], [-2, 3], [3, -3], [-1, -1]];
    yamPos.forEach(([x, z]) => herb.add(buildYamMound(x, z)));

    // Egusi ground cover (flat green clumps)
    for (let i = 0; i < 30; i++) {
      const gx = (Math.random() - 0.5) * 8;
      const gz = (Math.random() - 0.5) * 8;
      const egusi = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.15, 6, 3),
        new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.9 })
      );
      egusi.scale.set(1.8, 0.15, 1.5);
      egusi.position.set(gx, 0.05, gz);
      egusi.receiveShadow = true;
      herb.add(egusi);
    }

    // Pigeon pea shrubs
    const ppPos: [number, number][] = [[-4, 0], [4, 0], [0, 4], [0, -4]];
    ppPos.forEach(([x, z]) => shrub.add(buildShrub(x, z, 0x4caf50, 1.3)));
  }

  private buildCassavaMaizeRelay(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group) {
    // Cassava rows
    for (let row = -2; row <= 2; row++) {
      for (let col = -3; col <= 3; col++) {
        if (Math.random() > 0.3) {
          herb.add(buildCassava(col * 1.4 + (Math.random() - 0.5) * 0.3, row * 1.6));
        }
      }
    }

    // Maize interspersed
    const maizePos: [number, number][] = [[-1, -2], [1, 0], [-1, 2], [1, -2], [0, 1]];
    maizePos.forEach(([x, z]) => herb.add(buildMaize(x, z)));

    // Pigeon pea boundary
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5, Math.sin(angle) * 5, 0x4caf50, 1.5));
    }
  }

  private buildOfadaRiceAquaculture(herb: THREE.Group, _shrub: THREE.Group, _canopy: THREE.Group) {
    // Flooded paddy
    herb.add(buildPaddyWater(0, 0, 9, 9));

    // Fish trench around perimeter (blue ring)
    const trenchGeo = new THREE.RingGeometry(4.5, 5.2, 32);
    const trenchMat = new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      roughness: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.rotation.x = -Math.PI / 2;
    trench.position.y = 0.01;
    herb.add(trench);

    // Additional rice stems around paddy
    for (let i = 0; i < 20; i++) {
      const rx = (Math.random() - 0.5) * 7;
      const rz = (Math.random() - 0.5) * 7;
      herb.add(buildShrub(rx, rz, 0x8db04a, 0.55));
    }
  }

  private buildOilPalmSilvopasture(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group) {
    // Oil palm grid
    const palmPos: [number, number][] = [[-4, -4], [0, -4], [4, -4], [-4, 0], [0, 0], [4, 0], [-4, 4], [0, 4], [4, 4]];
    palmPos.forEach(([x, z]) => canopy.add(buildOilPalm(x, z)));

    // Pineapple contour rows
    for (let row = -2; row <= 2; row++) {
      for (let col = -4; col <= 4; col += 0.8) {
        if (Math.random() > 0.4) {
          herb.add(buildPineapple(col, row * 2));
        }
      }
    }

    // Ginger understory
    for (let i = 0; i < 25; i++) {
      const gx = (Math.random() - 0.5) * 8;
      const gz = (Math.random() - 0.5) * 8;
      herb.add(buildShrub(gx, gz, 0x388e3c, 0.4));
    }

    // Bitter leaf hedge
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      shrub.add(buildShrub(Math.cos(angle) * 5.5, Math.sin(angle) * 5.5, 0x1b5e20, 1.0));
    }
  }

  private buildMandalaMarketGarden(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group) {
    // Outer ring — bitter leaf + scent leaf
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = 5.0;
      const isScent = i % 2 === 0;
      shrub.add(buildShrub(
        Math.cos(angle) * r, Math.sin(angle) * r,
        isScent ? 0x2e7d32 : 0x1b5e20,
        isScent ? 0.7 : 1.0
      ));
    }

    // Middle ring — peppers, okra
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = 3.2;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x4caf50, 0.6, 0xe53935));
    }

    // Inner ring — tomatoes, leafy greens
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = 1.6;
      herb.add(buildShrub(Math.cos(angle) * r, Math.sin(angle) * r, 0x388e3c, 0.5, 0xe53935));
    }

    // Centre — pumpkin
    herb.add(buildShrub(0, 0, 0x2d7a2f, 0.7));
  }

  private buildSavannaCerealBelt(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group) {
    // Sorghum and millet in rows
    for (let row = -3; row <= 3; row++) {
      for (let col = -4; col <= 4; col++) {
        if (Math.random() > 0.25) {
          // Tall sorghum or millet
          const isMillet = Math.random() > 0.5;
          const h = isMillet ? 1.2 : 2.0;
          herb.add(buildShrub(
            col + (Math.random() - 0.5) * 0.3,
            row * 1.2 + (Math.random() - 0.5) * 0.3,
            isMillet ? 0xd4a54a : 0xc48a2a,
            h
          ));
        }
      }
    }

    // Pigeon pea / cowpea between rows
    for (let i = 0; i < 10; i++) {
      const gx = (Math.random() - 0.5) * 8;
      const gz = (Math.random() - 0.5) * 6;
      shrub.add(buildShrub(gx, gz, 0x8faf5a, 0.8));
    }
  }

  private buildAquaponicsSnailery(herb: THREE.Group, shrub: THREE.Group, _canopy: THREE.Group) {
    // Main fish tank (large blue rectangle)
    const tankGeo = new THREE.BoxGeometry(5, 0.8, 3);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0d47a1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-2, -0.3, 0);
    herb.add(tank);

    // Water surface
    const waterSurf = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 3),
      new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.02, transparent: true, opacity: 0.85 })
    );
    waterSurf.rotation.x = -Math.PI / 2;
    waterSurf.position.set(-2, 0.12, 0);
    herb.add(waterSurf);

    // DWC raft bed
    const raftGeo = new THREE.BoxGeometry(3, 0.05, 2);
    const raftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const raft = new THREE.Mesh(raftGeo, raftMat);
    raft.position.set(2.5, 0.1, 0);
    herb.add(raft);

    // Greens growing in DWC
    for (let i = 0; i < 12; i++) {
      const gx = 1.2 + Math.random() * 2.3;
      const gz = -0.8 + Math.random() * 1.6;
      herb.add(buildShrub(gx, gz, 0x4caf50, 0.3 + Math.random() * 0.2));
    }

    // Biofilter box
    const biofilter = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.0, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.9 })
    );
    biofilter.position.set(-0.2, 0.5, 1.8);
    herb.add(biofilter);

    // Snailery enclosure
    const snailBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9, transparent: true, opacity: 0.6 })
    );
    snailBox.position.set(2.5, 0.25, -2.5);
    herb.add(snailBox);

    // Pawpaw tree as snail feed source
    shrub.add(buildTree(0, -3, 0x4a2810, 0x388e3c, 2.5, 1.2));
  }

  private buildGenericFarm(herb: THREE.Group, shrub: THREE.Group, canopy: THREE.Group) {
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 8;
      canopy.add(buildTree(x, z));
    }
    for (let i = 0; i < 10; i++) {
      herb.add(buildCassava((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));
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
