/**
 * Farm Atlas — Intercropping Simulation & Farmer Advisory Engine
 * Real-time calculation of Land Equivalent Ratio, N₂ fixation, weed suppression,
 * pest resistance, canopy PAR, water efficiency, and actionable agronomic/livestock implications.
 */

import type { Crop, LivestockSpecies, IntercroppingResult, FarmerAdvisory } from './types';
import { getCropsByIds } from './cropsDatabase';
import { getLivestockByIds } from './livestockDatabase';

// ─── Comprehensive Farmer Advisory Knowledge Base ────────────────────────────
interface RuleDefinition {
  id: string;
  trigger: (cropIds: string[], livestockIds: string[], crops: Crop[], livestock: LivestockSpecies[]) => boolean;
  advisory: (cropIds: string[], livestockIds: string[], crops: Crop[], livestock: LivestockSpecies[]) => FarmerAdvisory;
}

const ADVISORY_RULES: RuleDefinition[] = [
  // ─── Livestock / Small Ruminants (Goats, Sheep) ───
  {
    id: 'goats-tuber-hazard',
    trigger: (cIds, lIds) => (lIds.includes('wad-goats') || lIds.includes('wad-sheep')) &&
      cIds.some(c => ['cassava', 'white-yam', 'water-yam', 'sweet-potato', 'cocoyam'].includes(c)),
    advisory: () => ({
      id: 'goats-tuber-hazard',
      type: 'warning',
      title: '🚨 Critical: Unfenced Goats & Young Root/Tuber Crops',
      speciesInvolved: ['wad-goats', 'cassava', 'white-yam'],
      description: 'West African Dwarf Goats are voracious browsers. If allowed into newly planted cassava, yam, or sweet potato fields, they will consume young shoots and tender vine tips, causing >75% tuber yield loss or total crop failure.',
      actionableTip: 'Enforce paddock fencing or tethering during the first 4 months of crop growth. Practice cut-and-carry feeding using Pigeon Pea (Cajanus cajan) or Leucaena boundary hedges instead of direct grazing.',
    }),
  },
  {
    id: 'goats-silvopasture-synergy',
    trigger: (cIds, lIds) => (lIds.includes('wad-goats') || lIds.includes('wad-sheep')) &&
      cIds.some(c => ['oil-palm', 'plantain', 'cashew', 'mango'].includes(c)),
    advisory: () => ({
      id: 'goats-silvopasture-synergy',
      type: 'synergy',
      title: '✨ High-Value Silvopasture: Tree Canopy + Small Ruminants',
      speciesInvolved: ['wad-goats', 'oil-palm', 'plantain'],
      description: 'Established mature tree orchards (Oil Palm, Plantain, Mango) provide excellent shade for small ruminants, while goats graze aggressive ground weeds without damaging high tree crowns.',
      actionableTip: 'Reduces manual undergrowth brushing labour by 60%. Rotate goats through tree alleys in 7–10 day paddocks to allow grass regrowth and prevent soil compaction.',
    }),
  },
  {
    id: 'goats-vegetable-damage',
    trigger: (cIds, lIds) => (lIds.includes('wad-goats') || lIds.includes('wad-sheep')) &&
      cIds.some(c => ['hot-pepper', 'tomato', 'okra', 'waterleaf', 'pumpkin'].includes(c)),
    advisory: () => ({
      id: 'goats-vegetable-damage',
      type: 'warning',
      title: '⚠ Livestock Exclusion Required for Market Vegetables',
      speciesInvolved: ['wad-goats', 'tomato', 'hot-pepper'],
      description: 'Small ruminants will strip flowers and tender leaves from nightshades, okra, and leafy greens within hours.',
      actionableTip: 'Erect live thorny hedges (such as Jatropha or dense Bitter Leaf) around vegetable plots, and direct goat grazing exclusively to grass-fallow paddocks.',
    }),
  },

  // ─── Poultry (Chickens, Guinea Fowl) ───
  {
    id: 'chickens-seedling-scratch',
    trigger: (cIds, lIds) => (lIds.includes('chickens') || lIds.includes('guinea-fowl')) &&
      cIds.some(c => ['tomato', 'hot-pepper', 'waterleaf', 'scent-leaf'].includes(c)),
    advisory: () => ({
      id: 'chickens-seedling-scratch',
      type: 'warning',
      title: '⚠ Seedbed Disturbance Risk: Free-Range Poultry',
      speciesInvolved: ['chickens', 'tomato', 'waterleaf'],
      description: 'Chickens foraging vigorously can scratch up shallow root systems and dislodge young vegetable seedlings in the nursery or early transplanting phase.',
      actionableTip: 'Keep nursery beds protected with wire cloches or net tunnels during the first 3 weeks. Introduce poultry only after crops develop sturdy stems (>25cm height).',
    }),
  },
  {
    id: 'chickens-cocoa-orchard-synergy',
    trigger: (cIds, lIds) => (lIds.includes('chickens') || lIds.includes('guinea-fowl')) &&
      cIds.some(c => ['cocoa', 'oil-palm', 'cashew', 'kola-nut'].includes(c)),
    advisory: () => ({
      id: 'chickens-cocoa-orchard-synergy',
      type: 'synergy',
      title: '✨ Natural Pest Sanitation: Poultry in Plantation Understory',
      speciesInvolved: ['chickens', 'cocoa'],
      description: 'Free-range chickens actively scratch tree leaf litter, devouring fallen pod borer pupae (Characoma stictigrapta), mirid nymphs, and armyworms before they migrate up the trunks.',
      actionableTip: 'Poultry manure deposits 120–160 kg N/ha of fast-mineralizing nitrogen directly to the shallow root zone of cocoa trees, significantly boosting annual pod yield.',
    }),
  },

  // ─── Wetland Aquaculture (Catfish, Tilapia) + Rice ───
  {
    id: 'aquaculture-rice-wetland',
    trigger: (cIds, lIds) => (lIds.includes('catfish') || lIds.includes('tilapia')) && cIds.includes('ofada-rice'),
    advisory: () => ({
      id: 'aquaculture-rice-wetland',
      type: 'synergy',
      title: '✨ Integrated Rice-Fish Bio-Economy (Ofada Wetland)',
      speciesInvolved: ['ofada-rice', 'catfish', 'tilapia'],
      description: 'Tilapia and catfish in paddy peripheral trenches eat aquatic weeds, stem borer larvae, and mosquito vectors, while fish waste provides 40–55% of the crop’s required nitrogen and phosphorus.',
      actionableTip: 'Maintain a 50cm deep perimeter trench around the flooded rice basin. Drain water slightly before harvest to concentrate fish into harvest sumps.',
    }),
  },

  // ─── Apiculture (Honeybees) ───
  {
    id: 'honeybee-pollination-boost',
    trigger: (cIds, lIds) => lIds.includes('honeybee') &&
      cIds.some(c => ['cocoa', 'cashew', 'mango', 'cowpea', 'pigeon-pea', 'okra', 'tomato'].includes(c)),
    advisory: () => ({
      id: 'honeybee-pollination-boost',
      type: 'synergy',
      title: '✨ Pollination Multiplier: Honeybees with Flowering Agroforest',
      speciesInvolved: ['honeybee', 'cashew', 'cocoa', 'cowpea'],
      description: 'Targeted bee foraging increases cross-pollination efficiency, raising fruit and seed set by 30–50% in cashew nuts, cocoa pods, and cowpea pods, while delivering secondary honey harvests.',
      actionableTip: 'Position beehives 30m away from human pathways and livestock enclosures, under dappled shade (e.g. under Plantain or Neem trees). Avoid broad-spectrum chemical sprays during morning flight hours.',
    }),
  },

  // ─── Heliciculture (Land Snails) ───
  {
    id: 'snail-plantain-pawpaw-synergy',
    trigger: (cIds, lIds) => lIds.includes('land-snail') &&
      cIds.some(c => ['plantain', 'pawpaw', 'bitter-leaf', 'cocoyam'].includes(c)),
    advisory: () => ({
      id: 'snail-plantain-pawpaw-synergy',
      type: 'synergy',
      title: '✨ Closed-Loop Snail Feed & Microclimate System',
      speciesInvolved: ['land-snail', 'pawpaw', 'plantain'],
      description: 'Archachatina marginata giant snails thrive under the high humidity and shade of plantain/cocoyam groves. Overripe pawpaw fruit, plantain leaves, and bitter leaf provide calcium- and protein-rich organic feed at zero cash cost.',
      actionableTip: 'Collect snail pen castings (rich in calcium carbonate and beneficial microbes) to fertilize vegetable seedling nursery trays.',
    }),
  },

  // ─── Agronomic Crop-Crop Interactions (Allelopathy & Staggering) ───
  {
    id: 'sorghum-allelopathy-warning',
    trigger: (cIds) => cIds.includes('sorghum') && cIds.some(c => ['cowpea', 'white-yam', 'water-yam'].includes(c)),
    advisory: () => ({
      id: 'sorghum-allelopathy-warning',
      type: 'warning',
      title: '🚨 Allelopathic Root Chemical Conflict: Sorghum & Broadleaf Crops',
      speciesInvolved: ['sorghum', 'cowpea', 'white-yam'],
      description: 'Sorghum root hairs exude Sorgoleone, a potent natural benzoquinone bio-herbicide that stunts the early radicle development of Cowpea and Yam feeder roots if planted in the exact same soil drill.',
      actionableTip: 'Maintain a minimum 1.5m row spacing buffer between sorghum rows and companion yam/legumes, or use sorghum as a post-harvest stubble mulch rather than direct concurrent intercrop.',
    }),
  },
  {
    id: 'cassava-maize-relay-management',
    trigger: (cIds) => cIds.includes('cassava') && cIds.includes('maize'),
    advisory: () => ({
      id: 'cassava-maize-relay-management',
      type: 'calendar',
      title: '📅 Staggered Planting Schedule: Cassava-Maize Relay',
      speciesInvolved: ['cassava', 'maize'],
      description: 'Maize grows rapidly and reaches maturity in 90–100 days before cassava develops a dense branching canopy. If timed correctly, both crops yield at 100% monoculture potential on the same land parcel (LER 1.65).',
      actionableTip: 'Sow maize and plant cassava stem cuttings simultaneously at the first steady rains. Harvest maize ears at day 95; the remaining cassava crop expands into the canopy space from month 4 to 12.',
    }),
  },
  {
    id: 'yam-maize-living-trellis',
    trigger: (cIds) => cIds.some(c => c.includes('yam')) && cIds.includes('maize'),
    advisory: () => ({
      id: 'yam-maize-living-trellis',
      type: 'management',
      title: '💡 Structural Living Trellis: Maize Stalks for Climbing Yam Vines',
      speciesInvolved: ['white-yam', 'maize'],
      description: 'Sturdy maize stalks serve as natural climbing stakes for yam vines, eliminating the heavy cost and deforestation associated with cutting wild mangrove/bamboo stakes.',
      actionableTip: 'After harvesting maize ears, break the maize tassel top at 1.8m height but leave the rooted stalk standing to support the heavy yam leaf biomass until dry season harvest.',
    }),
  },
  {
    id: 'egusi-living-mulch-weed-control',
    trigger: (cIds) => cIds.includes('egusi') && cIds.some(c => ['maize', 'white-yam', 'cassava'].includes(c)),
    advisory: () => ({
      id: 'egusi-living-mulch-weed-control',
      type: 'synergy',
      title: '✨ 90% Weed Suppression: Egusi Melon Living Mulch',
      speciesInvolved: ['egusi', 'maize', 'white-yam'],
      description: 'Egusi melon vines rapidly produce broad prostrate leaves that form a dense, living ground blanket within 21 days of sowing, cutting weeding labour by >80% and preventing soil moisture evaporation.',
      actionableTip: 'Plant egusi seeds 2 weeks after yam or maize emergence. Egusi vine senesces naturally at day 80, leaving organic mulch behind as maize finishes filling cobs.',
    }),
  },
  {
    id: 'scent-leaf-nematode-pest-barrier',
    trigger: (cIds) => (cIds.includes('scent-leaf') || cIds.includes('bitter-leaf')) &&
      cIds.some(c => ['tomato', 'hot-pepper', 'okra'].includes(c)),
    advisory: () => ({
      id: 'scent-leaf-nematode-pest-barrier',
      type: 'synergy',
      title: '🛡️ Botanical Bio-Shield: Scent Leaf (Efinrin) & Solanaceae',
      speciesInvolved: ['scent-leaf', 'tomato', 'hot-pepper'],
      description: 'Scent Leaf (Ocimum gratissimum) volatile essential oils (eugenol, thymol) repel whiteflies, aphids, and fruit borers, while root exudates suppress root-knot nematodes (Meloidogyne spp.) in tomato and pepper beds.',
      actionableTip: 'Plant 1 row of Scent Leaf for every 3 rows of tomatoes or peppers along the windward perimeter of the plot.',
    }),
  },
  {
    id: 'solanaceae-consecutive-risk',
    trigger: (cIds) => cIds.includes('tomato') && cIds.includes('hot-pepper'),
    advisory: () => ({
      id: 'solanaceae-consecutive-risk',
      type: 'warning',
      title: '⚠ Solanaceae Pathogen Concentration Risk',
      speciesInvolved: ['tomato', 'hot-pepper'],
      description: 'Both crops share vulnerability to Bacterial Wilt (Ralstonia solanacearum) and Early Blight. Monoculture grouping without bio-fumigant borders accelerates disease transmission across beds.',
      actionableTip: 'Interleave rows with alliums, bitter leaf, or ginger to interrupt pathogen pathways and soil fungal spores.',
    }),
  },
  {
    id: 'legume-nitrogen-transfer',
    trigger: (cIds) => cIds.some(c => ['cowpea', 'pigeon-pea', 'soybean', 'groundnut'].includes(c)) &&
      cIds.some(c => ['maize', 'sorghum', 'cassava', 'white-yam'].includes(c)),
    advisory: () => ({
      id: 'legume-nitrogen-transfer',
      type: 'synergy',
      title: '🌱 Rhizobial Nitrogen Fixation Transfer',
      speciesInvolved: ['cowpea', 'maize'],
      description: 'Legume nodules convert atmospheric N₂ into bioavailable ammonium (40–120 kg N/ha). Companion cereal and tuber roots take up residual nitrogen, enhancing plant vigor and protein grain content.',
      actionableTip: 'Do not apply heavy synthetic nitrogen fertilizer, as high soil nitrate inhibits nodulation. Apply single superphosphate (SSP) to stimulate root nodule formation.',
    }),
  },
];

// ─── LER Calculation ──────────────────────────────────────────────────────────
function calculateLER(crops: Crop[], livestock: LivestockSpecies[]): number {
  if (crops.length === 0) return 0;
  if (crops.length === 1 && livestock.length === 0) return 1.0;

  let totalLER = 0;

  crops.forEach(crop => {
    let partialLER = crop.lerContribution;

    const nFixers = crops.filter(c => c.nitrogenFixation > 0);
    const isFeeder = crop.nutrientRole === 'feeder';
    if (isFeeder && nFixers.length > 0) {
      const nBoost = Math.min(nFixers.reduce((s, f) => s + f.nitrogenFixation, 0) / 100, 0.4);
      partialLER += nBoost;
    }

    const canopyTrees = crops.filter(c =>
      c.canopyTier === 'emergent' || c.canopyTier === 'subcanopy'
    );
    if (crop.shadeTolerancePct > 50 && canopyTrees.length > 0) {
      partialLER += 0.15;
    }

    if (crop.weedSuppression > 0.7) {
      partialLER += 0.1;
    }

    const totalManure = livestock.reduce((s, l) => s + l.manureOutputKgHa, 0);
    if (totalManure > 1000) {
      partialLER += Math.min(totalManure / 20000, 0.2);
    }

    const hasBees = livestock.some(l => l.id === 'honeybee');
    if (hasBees && ['fruit', 'tree-cash', 'vegetable'].includes(crop.category)) {
      partialLER += 0.12;
    }

    totalLER += Math.max(0.1, partialLER);
  });

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

// ─── Main Simulation & Farmer Advisory Engine ────────────────────────────────
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

  // Generate real-world farmer advisories from active combinations
  const farmerAdvisories: FarmerAdvisory[] = [];
  ADVISORY_RULES.forEach(rule => {
    if (rule.trigger(cropIds, livestockIds, crops, livestock)) {
      farmerAdvisories.push(rule.advisory(cropIds, livestockIds, crops, livestock));
    }
  });

  const compatibilityWarnings = farmerAdvisories
    .filter(a => a.type === 'warning')
    .map(a => `${a.title}: ${a.description}`);

  const synergies = farmerAdvisories
    .filter(a => a.type === 'synergy')
    .map(a => `${a.title}: ${a.description}`);

  return {
    ler,
    nitrogenDelta,
    weedSuppression,
    pestResistance,
    canopyPAR,
    waterEfficiency,
    compatibilityWarnings,
    synergies,
    farmerAdvisories,
  };
}

export function lerLabel(ler: number): { label: string; status: 'good' | 'warn' | 'bad' } {
  if (ler >= 1.3) return { label: 'High Synergy System', status: 'good' };
  if (ler >= 1.0) return { label: 'Intercrop Beneficial', status: 'good' };
  if (ler >= 0.8) return { label: 'Marginal Return', status: 'warn' };
  return { label: 'Monoculture Better', status: 'bad' };
}
