/**
 * Farm Atlas — Agronomic Planting Densities & Livestock Stocking Rates
 * Based on FAO, ICRAF (World Agroforestry), and Nigerian agricultural extension standards
 */

export interface AgronomicDensitySpec {
  id: string;
  name: string;
  category: 'canopy-tree' | 'sub-canopy' | 'arable-crop' | 'cover-crop' | 'livestock' | 'poultry' | 'aquaculture' | 'apiary';
  densityPerHa: number;          // Standard agricultural density per hectare
  densityPerAcre: number;        // Equivalent density per acre
  spacingLabel: string;          // Field spacing (e.g. "9m × 9m Triangular")
  unitNoun: string;              // e.g. "palms", "trees", "stands", "birds", "head"
  typicalYieldPerHa: string;     // Yield expectation
  intercropFactor: number;       // Density coefficient when intercropped in multi-tier agroforest (0.5 to 1.0)
  managementTip: string;         // Field advisory note
}

export const AGRONOMIC_SPECIES_SPECS: Record<string, AgronomicDensitySpec> = {
  // ─── Canopy & Perennial Tree Crops ──────────────────────────────────────────
  'oil-palm': {
    id: 'oil-palm',
    name: 'Oil Palm',
    category: 'canopy-tree',
    densityPerHa: 143,
    densityPerAcre: 58,
    spacingLabel: '9m × 9m Triangular Spacing',
    unitNoun: 'palms',
    typicalYieldPerHa: '15–22 tonnes FFB / ha / yr',
    intercropFactor: 0.85,
    managementTip: 'Optimal triangular geometry allows maximum PAR light penetration for leguminous groundcovers or understory food crops.',
  },
  'cocoa': {
    id: 'cocoa',
    name: 'Cocoa',
    category: 'sub-canopy',
    densityPerHa: 1111,
    densityPerAcre: 450,
    spacingLabel: '3m × 3m under shade',
    unitNoun: 'trees',
    typicalYieldPerHa: '750–1,100 kg dry beans / ha / yr',
    intercropFactor: 0.80,
    managementTip: 'Requires 30–40% partial shade canopy (plantain/moringa) to prevent cherelle wilt and sunburn during dry seasons.',
  },
  'plantain': {
    id: 'plantain',
    name: 'Plantain / Banana',
    category: 'sub-canopy',
    densityPerHa: 1100,
    densityPerAcre: 445,
    spacingLabel: '3m × 3m companion grid',
    unitNoun: 'mats / stems',
    typicalYieldPerHa: '12–18 tonnes bunches / ha / yr',
    intercropFactor: 0.75,
    managementTip: 'Fast-growing pseudo-stem serves as primary nurse shade for young cocoa while providing early commercial cashflow.',
  },
  'cashew': {
    id: 'cashew',
    name: 'Cashew',
    category: 'canopy-tree',
    densityPerHa: 100,
    densityPerAcre: 40,
    spacingLabel: '10m × 10m grid',
    unitNoun: 'trees',
    typicalYieldPerHa: '900–1,400 kg raw nuts / ha / yr',
    intercropFactor: 0.85,
    managementTip: 'Drought-hardy deep root system forms an ideal firebreak and wind barrier on estate perimeters.',
  },
  'mango': {
    id: 'mango',
    name: 'Mango',
    category: 'canopy-tree',
    densityPerHa: 100,
    densityPerAcre: 40,
    spacingLabel: '10m × 10m orchard grid',
    unitNoun: 'trees',
    typicalYieldPerHa: '12–18 tonnes fruit / ha / yr',
    intercropFactor: 0.80,
    managementTip: 'Dense flowering panicles provide high-volume nectar for honeybee apiaries during dry season blooming.',
  },
  'kola-nut': {
    id: 'kola-nut',
    name: 'Kola Nut',
    category: 'canopy-tree',
    densityPerHa: 120,
    densityPerAcre: 48,
    spacingLabel: '9m × 9m spacing',
    unitNoun: 'trees',
    typicalYieldPerHa: '1.5–2.5 tonnes nuts / ha / yr',
    intercropFactor: 0.75,
    managementTip: 'Centuries-long perennial emergent tree cycling deep phosphorus and potassium into leaf litter.',
  },
  'pawpaw': {
    id: 'pawpaw',
    name: 'Pawpaw / Papaya',
    category: 'sub-canopy',
    densityPerHa: 1600,
    densityPerAcre: 648,
    spacingLabel: '2.5m × 2.5m grid',
    unitNoun: 'trees',
    typicalYieldPerHa: '30–45 tonnes fruit / ha / yr',
    intercropFactor: 0.70,
    managementTip: 'Begins fruiting within 8–9 months, maximizing vertical space utilization between slower-growing cash crop trees.',
  },

  // ─── Arable Staples & Root Tubers ──────────────────────────────────────────
  'cassava': {
    id: 'cassava',
    name: 'Cassava',
    category: 'arable-crop',
    densityPerHa: 10000,
    densityPerAcre: 4048,
    spacingLabel: '1m × 1m mounds / ridges',
    unitNoun: 'stands',
    typicalYieldPerHa: '18–28 tonnes tubers / ha',
    intercropFactor: 0.60,
    managementTip: 'Tolerant of nutrient-poor soils; intercrops cleanly with maize or legumes on contour ridges.',
  },
  'maize': {
    id: 'maize',
    name: 'Maize',
    category: 'arable-crop',
    densityPerHa: 40000,
    densityPerAcre: 16194,
    spacingLabel: '75cm × 25cm single stands',
    unitNoun: 'plants',
    typicalYieldPerHa: '3.0–5.0 tonnes grain / ha',
    intercropFactor: 0.55,
    managementTip: 'High nitrogen feeder; pair with cowpea or pigeon pea relay to maintain soil organic fertility.',
  },
  'white-yam': {
    id: 'white-yam',
    name: 'White Yam',
    category: 'arable-crop',
    densityPerHa: 10000,
    densityPerAcre: 4048,
    spacingLabel: '1m × 1m staked mounds',
    unitNoun: 'mounds',
    typicalYieldPerHa: '12–18 tonnes tubers / ha',
    intercropFactor: 0.60,
    managementTip: 'High-value premium tuber; mounds mulched with leaf biomass conserve moisture and suppress weeds.',
  },
  'water-yam': {
    id: 'water-yam',
    name: 'Water Yam',
    category: 'arable-crop',
    densityPerHa: 10000,
    densityPerAcre: 4048,
    spacingLabel: '1m × 1m mounds',
    unitNoun: 'mounds',
    typicalYieldPerHa: '14–20 tonnes tubers / ha',
    intercropFactor: 0.60,
    managementTip: 'Thrives in higher moisture zones; extensive vine foliage provides substantial ground shade.',
  },
  'pineapple': {
    id: 'pineapple',
    name: 'Pineapple',
    category: 'cover-crop',
    densityPerHa: 30000,
    densityPerAcre: 12145,
    spacingLabel: '90cm × 30cm double row strips',
    unitNoun: 'plants',
    typicalYieldPerHa: '45–65 tonnes fruit / ha',
    intercropFactor: 0.50,
    managementTip: 'Acts as biological terracing on slope contours to trap water runoff and retain organic topsoil.',
  },
  'ofada-rice': {
    id: 'ofada-rice',
    name: 'Ofada Rice',
    category: 'arable-crop',
    densityPerHa: 160000,
    densityPerAcre: 64770,
    spacingLabel: '20cm × 20cm hills',
    unitNoun: 'hills',
    typicalYieldPerHa: '2.5–3.8 tonnes paddy / ha',
    intercropFactor: 0.80,
    managementTip: 'Indigenous lowland aromatic rice variety with high premium market value in West Africa.',
  },
  'cowpea': {
    id: 'cowpea',
    name: 'Cowpea',
    category: 'cover-crop',
    densityPerHa: 80000,
    densityPerAcre: 32388,
    spacingLabel: '50cm × 25cm inter-row',
    unitNoun: 'plants',
    typicalYieldPerHa: '1.2–2.0 tonnes grain + 75 kg N/ha',
    intercropFactor: 0.50,
    managementTip: 'Nodules fix up to 80 kg of atmospheric nitrogen per hectare, fertilizing adjacent cereal and tree crops.',
  },
  'pigeon-pea': {
    id: 'pigeon-pea',
    name: 'Pigeon Pea',
    category: 'cover-crop',
    densityPerHa: 20000,
    densityPerAcre: 8097,
    spacingLabel: '1m × 50cm hedge rows',
    unitNoun: 'shrubs',
    typicalYieldPerHa: '1.5–2.5 tonnes seed + 90 kg N/ha',
    intercropFactor: 0.60,
    managementTip: 'Deep woody taproot breaks compacted subsoil plough pans, drawing subterranean minerals to the surface.',
  },
  'hot-pepper': {
    id: 'hot-pepper',
    name: 'Hot Pepper',
    category: 'arable-crop',
    densityPerHa: 25000,
    densityPerAcre: 10121,
    spacingLabel: '60cm × 40cm beds',
    unitNoun: 'stands',
    typicalYieldPerHa: '10–16 tonnes fresh peppers / ha',
    intercropFactor: 0.50,
    managementTip: 'Capsaicin scent acts as natural insect pest repellent for companion vegetables.',
  },
  'tomato': {
    id: 'tomato',
    name: 'Tomato',
    category: 'arable-crop',
    densityPerHa: 22000,
    densityPerAcre: 8907,
    spacingLabel: '60cm × 45cm staked beds',
    unitNoun: 'stands',
    typicalYieldPerHa: '15–25 tonnes fruit / ha',
    intercropFactor: 0.50,
    managementTip: 'Requires reliable drip irrigation and good aeration to prevent early fungal blight.',
  },
  'okra': {
    id: 'okra',
    name: 'Okra',
    category: 'arable-crop',
    densityPerHa: 30000,
    densityPerAcre: 12145,
    spacingLabel: '60cm × 30cm',
    unitNoun: 'stands',
    typicalYieldPerHa: '8–14 tonnes pods / ha',
    intercropFactor: 0.50,
    managementTip: 'Continuous weekly harvest stimulating prolonged production throughout the wet season.',
  },
  'egusi': {
    id: 'egusi',
    name: 'Egusi Melon',
    category: 'cover-crop',
    densityPerHa: 10000,
    densityPerAcre: 4048,
    spacingLabel: '1m × 1m trailing groundcover',
    unitNoun: 'vines',
    typicalYieldPerHa: '700–1,200 kg dry seeds / ha',
    intercropFactor: 0.60,
    managementTip: 'Dense vegetative carpet completely smothers weed seeds, cutting labor weeding costs by up to 60%.',
  },
  'ginger': {
    id: 'ginger',
    name: 'Ginger',
    category: 'arable-crop',
    densityPerHa: 50000,
    densityPerAcre: 20242,
    spacingLabel: '30cm × 20cm shaded beds',
    unitNoun: 'stands',
    typicalYieldPerHa: '12–18 tonnes fresh rhizomes / ha',
    intercropFactor: 0.50,
    managementTip: 'Thrives under partial understory shade with high export value for essential oils and confectionery.',
  },

  // ─── Fauna & Livestock Carrying Capacities ─────────────────────────────────
  'chickens': {
    id: 'chickens',
    name: 'Free-Range Poultry (Local & Kuroiler)',
    category: 'poultry',
    densityPerHa: 180,
    densityPerAcre: 73,
    spacingLabel: 'Rotational agroforest grazing',
    unitNoun: 'free-range birds',
    typicalYieldPerHa: '28,000 organic eggs + 250 kg meat / yr',
    intercropFactor: 1.0,
    managementTip: 'Birds forage on fallen fruit, weed seeds, and pest insect larvae, reducing pesticide requirements by 80%.',
  },
  'guinea-fowl': {
    id: 'guinea-fowl',
    name: 'Guinea Fowl',
    category: 'poultry',
    densityPerHa: 140,
    densityPerAcre: 57,
    spacingLabel: 'Agroforestry open range',
    unitNoun: 'birds',
    typicalYieldPerHa: '18,000 eggs + 200 kg premium meat / yr',
    intercropFactor: 1.0,
    managementTip: 'Voracious predators of ticks, grasshoppers, and beetles; alerts farm workers to perimeter intruders.',
  },
  'wad-goats': {
    id: 'wad-goats',
    name: 'West African Dwarf Goats',
    category: 'livestock',
    densityPerHa: 12,
    densityPerAcre: 5,
    spacingLabel: 'Silvopasture browse paddock',
    unitNoun: 'head (breeding herd)',
    typicalYieldPerHa: '240 kg liveweight meat + organic manure / yr',
    intercropFactor: 1.0,
    managementTip: 'Rotated across oil palm and cashew rows; control weeds while generating phosphorus-rich pellet manure.',
  },
  'wad-sheep': {
    id: 'wad-sheep',
    name: 'West African Dwarf Sheep',
    category: 'livestock',
    densityPerHa: 10,
    densityPerAcre: 4,
    spacingLabel: 'Understory grass pasture',
    unitNoun: 'head',
    typicalYieldPerHa: '200 kg organic mutton / yr',
    intercropFactor: 1.0,
    managementTip: 'Docile natural lawnmowers that graze low grasses without browsing or damaging young tree bark.',
  },
  'land-snail': {
    id: 'land-snail',
    name: 'Giant African Land Snails (Archachatina)',
    category: 'livestock',
    densityPerHa: 2500,
    densityPerAcre: 1012,
    spacingLabel: 'Shaded understory snailery pens',
    unitNoun: 'breeding snails',
    typicalYieldPerHa: '1,400 kg organic snail meat / yr',
    intercropFactor: 1.0,
    managementTip: 'Utilizes high humidity under cocoa/plantain shade; feeds on surplus farm fruits, leaves, and limestone.',
  },
  'honeybee': {
    id: 'honeybee',
    name: 'Honeybees (Apis mellifera adansonii)',
    category: 'apiary',
    densityPerHa: 3,
    densityPerAcre: 1.2,
    spacingLabel: 'Perimeter apiary stations',
    unitNoun: 'active Top-Bar hives',
    typicalYieldPerHa: '45–70 litres raw honey + beeswax / yr',
    intercropFactor: 1.0,
    managementTip: 'Boosts pollination and fruit set in cocoa, cashew, and mango by 30–45% while providing defensive perimeter security.',
  },
  'catfish': {
    id: 'catfish',
    name: 'African Sharptooth Catfish (Clarias)',
    category: 'aquaculture',
    densityPerHa: 8000,
    densityPerAcre: 3238,
    spacingLabel: 'Integrated earthen retention ponds',
    unitNoun: 'table-size fish',
    typicalYieldPerHa: '6.5–9.0 tonnes fresh fish / yr',
    intercropFactor: 1.0,
    managementTip: 'Pond drain water provides ammonia/nitrate-rich organic liquid fertilizer for gravity-fed crop irrigation.',
  },
  'tilapia': {
    id: 'tilapia',
    name: 'Nile Tilapia (Oreochromis niloticus)',
    category: 'aquaculture',
    densityPerHa: 7000,
    densityPerAcre: 2833,
    spacingLabel: 'Flow-through aquaculture ponds',
    unitNoun: 'table-size fish',
    typicalYieldPerHa: '5.0–7.5 tonnes fish / yr',
    intercropFactor: 1.0,
    managementTip: 'Herbivorous species feeding on duckweed and phytoplankton, cycling pond algae into high-grade protein.',
  },
};

/**
 * Calculates optimal population count for a given species and farm acreage
 */
export function calculateSpeciesPopulation(
  speciesId: string,
  acreage: number,
  isIntercropped = true
): {
  count: number;
  countFormatted: string;
  densityPerHa: number;
  densityPerAcre: number;
  spacing: string;
  unit: string;
  expectedYield: string;
  managementTip: string;
} {
  const spec = AGRONOMIC_SPECIES_SPECS[speciesId] || {
    id: speciesId,
    name: speciesId,
    category: 'arable-crop',
    densityPerHa: 1000,
    densityPerAcre: 405,
    spacingLabel: 'Standard Agroforestry Spacing',
    unitNoun: 'stands',
    typicalYieldPerHa: 'Varies with management',
    intercropFactor: 0.75,
    managementTip: 'Maintain balanced spatial distribution across agro-ecological tiers.',
  };

  const hectares = Math.max(0.1, acreage) / 2.471;
  const factor = isIntercropped ? spec.intercropFactor : 1.0;
  const rawCount = Math.max(1, Math.round(spec.densityPerHa * hectares * factor));

  let countFormatted = '';
  if (rawCount >= 1_000_000) {
    countFormatted = `${(rawCount / 1_000_000).toFixed(2)}M`;
  } else if (rawCount >= 100_000) {
    countFormatted = `${(rawCount / 1_000).toFixed(0)}k`;
  } else if (rawCount >= 10_000) {
    countFormatted = `${(rawCount / 1_000).toFixed(1)}k`;
  } else {
    countFormatted = rawCount.toLocaleString();
  }

  return {
    count: rawCount,
    countFormatted,
    densityPerHa: Math.round(spec.densityPerHa * factor),
    densityPerAcre: Math.round(spec.densityPerAcre * factor),
    spacing: spec.spacingLabel,
    unit: spec.unitNoun,
    expectedYield: spec.typicalYieldPerHa,
    managementTip: spec.managementTip,
  };
}
