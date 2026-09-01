/**
 * Farm Atlas — Intercropping Simulation Engine
 * Real-time calculation of Land Equivalent Ratio, N₂ fixation, weed suppression,
 * pest resistance, canopy PAR and water efficiency from a custom crop/livestock mix.
 */

import type { Crop, LivestockSpecies, IntercroppingResult } from './types';
import { getCropsByIds } from './cropsDatabase';
import { getLivestockByIds } from './livestockDatabase';

// Allelopathy conflict map — any pairing triggers a warning
const ALLELOPATHY_CONFLICTS: Record<string, string[]> = {
  'sorghum': ['cowpea', 'white-yam'],
  'fennel':  ['tomato', 'hot-pepper'],
};

// Known strong synergies (beyond formula)
const SYNERGY_PAIRS: { a: string; b: string; note: string }[] = [
  { a: 'maize', b: 'cowpea', note: 'Classic "Three Sisters" N-fixation transfer: Cowpea → Maize +40–60 kg N/ha' },
  { a: 'maize', b: 'white-yam', note: 'Maize stalk serves as living yam stake — structural + spatial synergy' },
  { a: 'maize', b: 'egusi', note: 'Egusi ground cover smothers weeds around maize base — LER +0.3' },
  { a: 'cocoa', b: 'plantain', note: 'Plantain nurse shade: 60–70% canopy for juvenile cocoa' },
  { a: 'cocoa', b: 'honeybee', note: 'Bee pollination increases cocoa pod set by 35–50%' },
  { a: 'oil-palm', b: 'pineapple', note: 'Pineapple erosion hedges on slopes between palm rows' },
  { a: 'oil-palm', b: 'ginger', note: 'Oil palm canopy provides 70% shade for ginger rhizomes' },
  { a: 'cassava', b: 'cowpea', note: 'Cowpea N-fixation boosts cassava starch yield 20–35%' },
  { a: 'ofada-rice', b: 'catfish', note: 'Fish effluent provides 40–60% of paddy N requirement' },
  { a: 'ofada-rice', b: 'tilapia', note: 'Tilapia suppress aquatic weeds by 50–70%' },
  { a: 'tomato', b: 'scent-leaf', note: 'Efinrin volatile terpenoids reduce nematode J2 larvae 40%' },
  { a: 'pigeon-pea', b: 'white-yam', note: 'Pigeon pea taproot breaks hardpan, frees P for yam feeder roots' },
  { a: 'cashew', b: 'honeybee', note: 'Bee pollination increases cashew nut yield +35%' },
  { a: 'maize', b: 'african-yam-bean', note: 'Yam bean climbs maize stalk as natural trellis' },
  { a: 'plantain', b: 'ginger', note: 'Plantain drip-water and shade create ideal ginger microclimate' },
];

/**
 * Calculates the Land Equivalent Ratio for a given crop mix.
 * LER = Σ(Y_inter_i / Y_mono_i)
 * When crops compete, partial LERs are penalised; synergies boost them.
 */
function calculateLER(crops: Crop[], livestock: LivestockSpecies[]): number {
  if (crops.length === 0) return 0;
  if (crops.length === 1 && livestock.length === 0) return 1.0;

  let totalLER = 0;

  crops.forEach(crop => {
    let partialLER = crop.lerContribution;

    // Nitrogen benefit: N-fixers improve LER of companion N-feeders
    const nFixers = crops.filter(c => c.nitrogenFixation > 0);
    const isFeeder = crop.nutrientRole === 'feeder';
    if (isFeeder && nFixers.length > 0) {
      const nBoost = Math.min(nFixers.reduce((s, f) => s + f.nitrogenFixation, 0) / 100, 0.4);
      partialLER += nBoost;
    }

    // Shade benefit for shade-tolerant crops under tall canopy trees
    const canopyTrees = crops.filter(c =>
      c.canopyTier === 'emergent' || c.canopyTier === 'subcanopy'
    );
    if (crop.shadeTolerancePct > 50 && canopyTrees.length > 0) {
      partialLER += 0.15;
    }

    // Weed suppression benefit for high-ground-cover crops
    if (crop.weedSuppression > 0.7) {
      partialLER += 0.1;
    }

    // Livestock benefit: manure boosts overall LER
    const totalManure = livestock.reduce((s, l) => s + l.manureOutputKgHa, 0);
    if (totalManure > 1000) {
      partialLER += Math.min(totalManure / 20000, 0.2);
    }

    // Pollinator boost for flowering crops
    const hasBees = livestock.some(l => l.id === 'honeybee');
    if (hasBees && ['fruit', 'tree-cash', 'vegetable'].includes(crop.category)) {
      partialLER += 0.12;
    }

    totalLER += Math.max(0.1, partialLER);
  });

  // Normalise: divide by number of crops, then multiply by species diversity bonus
  const baseLER = totalLER / crops.length;
  const diversityBonus = Math.min((crops.length - 1) * 0.06, 0.35);
  const livestockBonus = livestock.length > 0 ? Math.min(livestock.length * 0.04, 0.15) : 0;

  return Math.min(baseLER + diversityBonus + livestockBonus, 2.5);
}

function calculateNitrogenDelta(crops: Crop[], livestock: LivestockSpecies[]): number {
  const fixation = crops.reduce((sum, c) => sum + c.nitrogenFixation, 0);
  const feederDemand = crops.filter(c => c.nutrientRole === 'feeder').length * 30;
  const manureN = livestock.reduce((sum, l) => sum + l.manureOutputKgHa * 0.04, 0);
  const litterN = crops.filter(c => c.canopyTier === 'emergent' || c.canopyTier === 'subcanopy').length * 15;
  return fixation + manureN + litterN - feederDemand;
}

function calculateWeedSuppression(crops: Crop[], livestock: LivestockSpecies[]): number {
  const coverFraction = crops.reduce((sum, c) => sum + c.weedSuppression, 0) / Math.max(crops.length, 1);
  const weedControlFromLivestock = livestock.reduce((sum, l) => sum + l.weedControlScore, 0) / Math.max(livestock.length, 1);
  const combined = coverFraction * 0.7 + weedControlFromLivestock * 0.3;
  return Math.min(combined * 100, 98);
}

function calculatePestResistance(crops: Crop[], livestock: LivestockSpecies[]): number {
  const aromaticScore = crops.reduce((sum, c) => sum + c.aromaticRepellentScore, 0);
  const pestControlFromLivestock = livestock.reduce((sum, l) => sum + l.pestControlScore, 0);
  const totalAttraction = crops.reduce((sum, c) => sum + c.pestAttractionScore, 0);
  const net = (aromaticScore + pestControlFromLivestock * 0.5) - totalAttraction * 0.3;
  return Math.max(0, Math.min(net * 60 + 20, 95));
}

function calculateCanopyPAR(crops: Crop[]): number {
  const tiers = {
    emergent: crops.filter(c => c.canopyTier === 'emergent').length,
    subcanopy: crops.filter(c => c.canopyTier === 'subcanopy').length,
    shrub: crops.filter(c => c.canopyTier === 'shrub').length,
    herbaceous: crops.filter(c => c.canopyTier === 'herbaceous').length,
    groundcover: crops.filter(c => c.canopyTier === 'groundcover').length,
  };

  const totalTiers = Object.values(tiers).filter(v => v > 0).length;
  // Multi-strata captures more PAR per unit area
  const stratificationBonus = Math.min(totalTiers * 15, 60);
  return Math.min(50 + stratificationBonus, 95);
}

function calculateWaterEfficiency(crops: Crop[], livestock: LivestockSpecies[]): number {
  const coverCrops = crops.filter(c => c.weedSuppression > 0.65);
  const deepRoots = crops.filter(c => c.rootDepthCm[1] > 100);
  const shallowRoots = crops.filter(c => c.rootDepthCm[1] < 40);
  const complementary = Math.min((deepRoots.length * shallowRoots.length) * 8, 30);
  const coverBonus = coverCrops.length * 10;
  return Math.min(50 + complementary + coverBonus, 95);
}

function detectAllelopathyConflicts(crops: Crop[]): string[] {
  const warnings: string[] = [];
  crops.forEach(crop => {
    const conflicts = ALLELOPATHY_CONFLICTS[crop.id] || [];
    conflicts.forEach(conflictId => {
      if (crops.some(c => c.id === conflictId)) {
        warnings.push(
          `⚠ Allelopathy detected: ${crop.name} root exudates inhibit ${getCropsByIds([conflictId])[0]?.name || conflictId}`
        );
      }
    });
  });
  return warnings;
}

function detectOverstocking(livestock: LivestockSpecies[]): string[] {
  const warnings: string[] = [];
  const totalCompaction = livestock.reduce((sum, l) => sum + l.compactionRisk, 0);
  if (totalCompaction > 1.2) {
    warnings.push('⚠ Overgrazing risk: Reduce livestock density or implement rotational paddocking');
  }
  const browsers = livestock.filter(l => l.id === 'wad-goats' || l.id === 'wad-sheep');
  if (browsers.length > 2 && !livestock.some(l => l.id === 'chickens')) {
    warnings.push('⚠ Consider adding chickens to control ectoparasites in grazing areas');
  }
  return warnings;
}

function detectSynergies(crops: Crop[], livestock: LivestockSpecies[]): string[] {
  const synergies: string[] = [];
  const allIds = [...crops.map(c => c.id), ...livestock.map(l => l.id)];

  SYNERGY_PAIRS.forEach(pair => {
    if (allIds.includes(pair.a) && allIds.includes(pair.b)) {
      synergies.push(`✓ ${pair.note}`);
    }
  });

  return synergies;
}

/**
 * Main simulation function — call with arrays of crop & livestock IDs.
 */
export function simulateIntercropping(
  cropIds: string[],
  livestockIds: string[]
): IntercroppingResult {
  const crops = getCropsByIds(cropIds);
  const livestock = getLivestockByIds(livestockIds);

  const ler = calculateLER(crops, livestock);
  const nitrogenDelta = calculateNitrogenDelta(crops, livestock);
  const weedSuppression = calculateWeedSuppression(crops, livestock);
  const pestResistance = calculatePestResistance(crops, livestock);
  const canopyPAR = calculateCanopyPAR(crops);
  const waterEfficiency = calculateWaterEfficiency(crops, livestock);

  const compatibilityWarnings = [
    ...detectAllelopathyConflicts(crops),
    ...detectOverstocking(livestock),
  ];

  const synergies = detectSynergies(crops, livestock);

  return {
    ler,
    nitrogenDelta,
    weedSuppression,
    pestResistance,
    canopyPAR,
    waterEfficiency,
    compatibilityWarnings,
    synergies,
  };
}

export function lerLabel(ler: number): { label: string; status: 'good' | 'warn' | 'bad' } {
  if (ler >= 1.3) return { label: 'High Synergy', status: 'good' };
  if (ler >= 1.0) return { label: 'Intercrop Beneficial', status: 'good' };
  if (ler >= 0.8) return { label: 'Marginal Return', status: 'warn' };
  return { label: 'Monoculture Better', status: 'bad' };
}
