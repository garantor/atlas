/**
 * Farm Atlas — 8 Core Farm Ecosystems
 * Each farm has: crops, livestock, hotspots, educational cards, lesson steps, quiz questions
 */

import type { FarmEcosystem } from '../types';

export const FARMS: FarmEcosystem[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Cocoa-Plantain Multi-Strata Agroforest
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cocoa-agroforest',
    name: 'Cocoa-Plantain Agroforest',
    subtitle: 'Multi-Strata Rainforest Farm',
    biome: 'rainforest',
    region: 'Ondo / Osun Rainforest Belt',
    accentColor: '#4a2010',
    accentColor2: '#2d6a2f',
    icon: '🍫',
    cropIds: ['cocoa', 'plantain', 'kola-nut', 'cocoyam', 'ginger', 'bitter-leaf', 'scent-leaf'],
    livestockIds: ['chickens', 'honeybee'],
    lerBaseline: 1.78,
    nitrogenDelta: 35,
    weedSuppressionPct: 82,
    pestResistancePct: 71,
    canopyParPct: 88,
    description: 'The historic economic backbone of Southwest Nigeria. Cocoa trees grow as understory cauliflorous shrubs beneath a protective canopy of plantain, kola nut, and avocado. This three-tiered agroforest mimics natural rainforest structure — each layer harvests a different PAR band.',
    highlights: [
      'Cocoa pods bursting from main trunks under broad plantain leaves',
      'Chickens scratching around root bases, consuming cocoa mirid bugs',
      'Bee flight paths from log hives to flowering cocoa and cashew',
      'Canopy light shafts breaking through plantain leaves',
    ],
    hotspots: [
      {
        id: 'hs-cocoa-pod',
        label: 'Cocoa Pod',
        scientificName: 'Theobroma cacao',
        description: 'Cauliflorous pods grow directly from the main trunk — a unique adaptation that allows heavy pods to be supported by woody tissue rather than thin branches.',
        position3d: [0.8, 1.2, 0.3],
        color: '#ff6b35',
      },
      {
        id: 'hs-plantain-shade',
        label: 'Plantain Nurse Canopy',
        scientificName: 'Musa paradisiaca',
        description: 'Plantain provides 60–70% shade — critical for juvenile cocoa establishment. The large paddle leaves intercept rainfall and channel it as stem flow, reducing splash erosion.',
        position3d: [-0.5, 2.8, 0.2],
        color: '#f0c830',
      },
      {
        id: 'hs-mirid-control',
        label: 'Chicken Pest Control',
        scientificName: 'Gallus gallus domesticus',
        description: 'Free-range chickens consume cocoa mirid bugs (Distantiella theobroma) that fall from the canopy, reducing chemical pesticide dependency by up to 60%.',
        position3d: [-1.2, 0.3, 0.8],
        color: '#ff8c42',
      },
      {
        id: 'hs-bee-hive',
        label: 'African Honeybee Log Hive',
        scientificName: 'Apis mellifera adansonii',
        description: 'Log hives placed at 100m intervals. Bee pollination increases cocoa pod set by 35–50%, significantly boosting economic yield of the agroforest.',
        position3d: [1.5, 0.8, -0.5],
        color: '#f5a623',
      },
    ],
    educationalCards: [
      {
        id: 'ec-cauliflory',
        category: 'botany',
        title: 'Cauliflory: The Trunk-Bearing Strategy',
        icon: '🌿',
        excerpt: 'Why do cocoa pods grow on the main trunk rather than on branches? This unusual strategy evolved for a remarkable reason.',
        body: 'Cauliflory — fruiting from the main trunk or primary branches — evolved in tropical understorey trees as an adaptation to low-light environments. The thick woody trunk provides the structural support necessary for large, heavy fruit that thin terminal branches could not bear. Additionally, trunk-borne fruits are more accessible to the large mammals (originally peccaries and squirrels in their native Central America) that dispersed the seeds. In West African agroforests, the same accessibility allows cocoa farmers to harvest pods by hand without ladders, and allows chickens to consume fallen pod husks and the insects that congregate around them.',
        relatedCropIds: ['cocoa', 'breadfruit', 'kola-nut'],
        dataTable: {
          headers: ['Property', 'Value'],
          rows: [
            ['Max pod weight', '400–600 g'],
            ['Seeds per pod', '20–50'],
            ['Fermentation time', '5–7 days'],
            ['Shade requirement (juvenile)', '60–70%'],
            ['Productive lifespan', '25–40 years'],
          ],
        },
      },
      {
        id: 'ec-ler-agroforest',
        category: 'soil',
        title: 'Land Equivalent Ratio: Measuring Polyculture Efficiency',
        icon: '📊',
        excerpt: 'The LER of 1.78 means this agroforest produces 78% more output per hectare than equivalent monocultures of each crop.',
        body: 'The Land Equivalent Ratio (LER) is the definitive metric for intercrop efficiency. For this cocoa-plantain system: LER_cocoa = 0.82 (cocoa yield in intercrop ÷ cocoa monoculture yield) and LER_plantain = 0.96 (plantain yield in intercrop ÷ monoculture). LER = 0.82 + 0.96 = 1.78. Since LER > 1.0, you would need 1.78 hectares of pure monocultures to produce what this one hectare of agroforest produces. The primary drivers: temporal complementarity (crops peak at different times), vertical light stratification (each layer captures different wavelengths), and biological N fixation.',
        relatedCropIds: ['cocoa', 'plantain', 'kola-nut'],
        formula: 'LER = Σ(Y_inter_i / Y_mono_i) = 0.82 + 0.96 = 1.78',
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'The Rainforest Blueprint',
        body: 'Natural tropical rainforests have 5–7 distinct canopy layers. This agroforest mimics those layers with economic crops: emergent oil palms, subcanopy cocoa, shrub-layer plantain, and ground-cover ginger. Each layer harvests light that the layer above does not use.',
        illustration: '🌴🍫🍌🫚',
        cameraPreset: 'overview',
      },
      {
        stepNum: 2,
        title: 'Cocoa: The Understory Specialist',
        body: 'Zoom into the cocoa tree. Notice the pods growing directly from the main trunk (cauliflory). The bark of the trunk is darker and rougher than the branches. The large, glossy leaves are adapted to capture the 30–40% of light that filters through the plantain canopy above.',
        illustration: '🍫',
        cameraPreset: 'cocoa-closeup',
      },
      {
        stepNum: 3,
        title: 'The Nitrogen Web',
        body: 'Now look underground at the root network. The deep plantain roots (60–120cm) draw water from the subsoil. Shallow ginger rhizomes (10–30cm) access surface nutrients. The mycelial network of mycorrhizal fungi connects all root systems, sharing nutrients across species.',
        illustration: '🌱🕸️',
        cameraPreset: 'subterranean',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-cocoa',
        question: 'What is the primary biological reason why cocoa pods grow on the main trunk (cauliflory)?',
        options: [
          'The trunk has more water and nutrients than branches',
          'Large heavy pods need the structural support of the woody main trunk',
          'Insects cannot reach the trunk to damage pods',
          'The trunk receives more sunlight than branches',
        ],
        correctIndex: 1,
        explanation: 'Cauliflory evolved so that large, heavy fruits can be supported by the strong woody trunk rather than thin terminal branches. It also originally evolved for seed dispersal by large mammals.',
      },
      {
        id: 'q2-cocoa',
        question: 'What LER value indicates that intercropping is MORE efficient than monoculture?',
        options: ['LER < 0.5', 'LER = 1.0', 'LER > 1.0', 'LER = 0.0'],
        correctIndex: 2,
        explanation: 'LER > 1.0 means intercropping uses land more efficiently than the equivalent monocultures. An LER of 1.78 means you would need 1.78 hectares of monocultures to match one hectare of this agroforest.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Yam Mound & Egusi-Cowpea Complex
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'yam-egusi-mound',
    name: 'Yam Mound & Egusi Complex',
    subtitle: 'Traditional Yam & Living Mulch System',
    biome: 'derived-savanna',
    region: 'Oyo / Ekiti Farm Belts',
    accentColor: '#8b6f2a',
    accentColor2: '#4a8f2a',
    icon: '🥔',
    cropIds: ['white-yam', 'maize', 'egusi', 'cowpea', 'pigeon-pea'],
    livestockIds: ['chickens', 'wad-goats'],
    lerBaseline: 1.72,
    nitrogenDelta: 62,
    weedSuppressionPct: 87,
    pestResistancePct: 58,
    canopyParPct: 76,
    description: 'The quintessential West African polyculture. Yams on 1-metre conical earthen mounds with maize stalks as living stakes, egusi melon vines as ground cover to smother weeds, and cowpea fixing nitrogen between the rows. A system refined over 3,000 years of continuous cultivation.',
    highlights: [
      'Deep mound cross-section showing giant tuber expansion',
      'Maize stalks guiding yam tendrils upward',
      'Broad egusi leaves sealing moisture in the topsoil',
      'Cowpea root nodules glowing with Bradyrhizobium activity',
    ],
    hotspots: [
      {
        id: 'hs-yam-mound',
        label: 'Earthen Mound Architecture',
        description: 'The 1-metre conical mound creates loose, well-aerated growing medium. Roots expand laterally through friable soil. The peak-to-valley design channels rainwater away from the developing tuber zone.',
        position3d: [0, 0.5, 0],
        color: '#8b6f2a',
      },
      {
        id: 'hs-rhizobium',
        label: 'Nitrogen Nodule Network',
        scientificName: 'Bradyrhizobium japonicum',
        description: 'Pink root nodules on cowpea roots harbour millions of nitrogen-fixing bacteria. Each nodule produces leghemoglobin — the same protein family as human haemoglobin — to protect nitrogenase from oxygen.',
        position3d: [-0.8, -0.3, 0.5],
        color: '#ff6b6b',
      },
      {
        id: 'hs-egusi-mulch',
        label: 'Egusi Living Mulch',
        scientificName: 'Citrullus colocynthis',
        description: 'The dense hairy egusi leaf canopy covers 85–95% of the soil surface between mounds, reducing soil surface temperature by 4–8°C, preventing moisture evaporation, and suppressing weed germination.',
        position3d: [1.2, 0.1, 0.3],
        color: '#8fb860',
      },
    ],
    educationalCards: [
      {
        id: 'ec-mound-engineering',
        category: 'soil',
        title: 'The Engineering of the Yam Mound',
        icon: '⛰️',
        excerpt: 'The conical earthen mound is one of humanity\'s oldest soil engineering innovations — designed with precise drainage, aeration, and structural logic.',
        body: 'The traditional yam mound (ìgúsùù in Yoruba) is 60–100cm high and 90–120cm in diameter at the base. Its engineering achieves several simultaneous goals: the loose, friable soil profile allows tubers to expand laterally without encountering compaction resistance; the apex drains water away from the developing tuber neck, preventing crown rot; the mound elevation raises root zone temperature by 2–4°C, accelerating microbial decomposition and nutrient release; and the slope creates a root-aeration gradient — wetter at base, drier at apex — mimicking natural well-drained hillside conditions.',
        relatedCropIds: ['white-yam', 'water-yam'],
        dataTable: {
          headers: ['Parameter', 'Value'],
          rows: [
            ['Mound height', '60–100 cm'],
            ['Base diameter', '90–120 cm'],
            ['Mound spacing', '0.9–1.2 m'],
            ['Mounds per hectare', '5,000–8,000'],
            ['Tuber weight', '2–8 kg each'],
          ],
        },
      },
      {
        id: 'ec-n2-fixation',
        category: 'soil',
        title: 'Nitrogen Fixation: Nature\'s Fertiliser Factory',
        icon: '⚗️',
        excerpt: 'Cowpea root nodules convert atmospheric N₂ gas into plant-available NH₄⁺ — supplying 40–80 kg N/ha for free.',
        body: 'The symbiosis between Vigna unguiculata (cowpea) and Bradyrhizobium japonicum bacteria represents one of the most elegant nitrogen cycles in agriculture. Bacteria infect root hair cells, triggering nodule formation. Inside the nodule, nitrogenase enzyme converts N₂ to NH₃ (requiring 16 ATP per molecule). Leghemoglobin protein maintains micro-aerobic conditions for the oxygen-sensitive nitrogenase while the pink colour indicates active fixation. Fixed N is exported as asparagine to the plant, and when roots decompose, N is released to the rhizosphere — available to companion maize and yam.',
        relatedCropIds: ['cowpea', 'pigeon-pea', 'african-yam-bean', 'soybean'],
        formula: 'N₂ + 8H⁺ + 8e⁻ + 16 ATP → 2NH₃ + H₂ + 16 ADP',
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'The Mound System',
        body: 'The yam mound is the physical heart of this farming system. Each mound concentrates organic matter, creates aeration, and drains water — all the conditions a yam tuber needs to expand freely underground.',
        illustration: '⛰️',
        cameraPreset: 'overview',
      },
      {
        stepNum: 2,
        title: 'The Three-Species Ground Layer',
        body: 'Between the mounds, cowpea fixes nitrogen in the top 30cm. Egusi melon vines creep across the soil surface, blocking sun and preventing weed germination. Maize stakes guide yam tendrils vertically — maximising light capture.',
        illustration: '🌽🫘🍈',
        cameraPreset: 'ground-layer',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-yam',
        question: 'What protein inside cowpea root nodules protects the nitrogen-fixing enzyme from oxygen?',
        options: ['Nitrogenase', 'Leghemoglobin', 'Asparagine', 'Bradyrhizobium'],
        correctIndex: 1,
        explanation: 'Leghemoglobin is a pinkish protein — in the same family as human haemoglobin — that maintains micro-aerobic conditions inside the nodule, protecting the oxygen-sensitive nitrogenase enzyme while allowing energy-generating respiration.',
      },
      {
        id: 'q2-yam',
        question: 'Why are yams grown on raised earthen mounds rather than flat soil?',
        options: [
          'Mounds make harvesting the tubers easier',
          'Mounds increase rainfall collection',
          'Loose mound soil allows tubers to expand freely, prevents rot, and improves drainage',
          'Mounds protect from flooding in lowland areas',
        ],
        correctIndex: 2,
        explanation: 'The mound\'s loose, friable structure allows the expanding tuber to develop without compaction resistance. The elevated position drains water away from the tuber crown, preventing crown rot, while the slope creates the aeration gradient yam roots prefer.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Cassava-Maize Relay Agroecosystem
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cassava-maize-relay',
    name: 'Cassava-Maize Relay System',
    subtitle: 'Sequential Intercrop with Nitrogen Cycling',
    biome: 'derived-savanna',
    region: 'Ogun / Ondo / Cross River',
    accentColor: '#c8a96e',
    accentColor2: '#f5c842',
    icon: '🌿',
    cropIds: ['cassava', 'maize', 'african-yam-bean', 'pigeon-pea', 'sweet-potato'],
    livestockIds: ['chickens', 'wad-goats'],
    lerBaseline: 1.65,
    nitrogenDelta: 48,
    weedSuppressionPct: 74,
    pestResistancePct: 55,
    canopyParPct: 72,
    description: 'The relay system plants maize first (fast-maturing 90 days), then establishes cassava before maize is harvested. African Yam Bean climbs the maize stalk as its trellis. After maize harvest, pigeon pea fills the gap with deep taproot phosphorus mining while cassava develops its storage tubers.',
    highlights: [
      'Sequential harvest timeline showing staggered crop layers',
      'Deep pigeon pea taproots breaking subsoil clay at 2 metres',
      'African yam bean vines climbing maize stalks',
      'Cassava tubers developing in topsoil after maize clearance',
    ],
    hotspots: [
      {
        id: 'hs-relay-sequence',
        label: 'Relay Planting Timeline',
        description: 'Maize is planted first (Month 0), cassava at Month 1.5, African yam bean at Month 2. When maize is harvested at Month 3, its dry stalks remain as stakes for the climbing bean. Cassava continues for 12–18 months.',
        position3d: [0, 1.5, 0],
        color: '#f5c842',
      },
      {
        id: 'hs-pigeon-taproot',
        label: 'Hardpan-Breaking Taproot',
        scientificName: 'Cajanus cajan',
        description: 'Pigeon pea\'s 2-metre taproot physically cracks subsoil hardpan layers (iron-pan or laterite) that restrict water infiltration and root penetration for annual crops.',
        position3d: [0.5, -1.5, 0.3],
        color: '#8faf5a',
      },
    ],
    educationalCards: [
      {
        id: 'ec-relay-planting',
        category: 'botany',
        title: 'Relay Intercropping: The Temporal Jigsaw',
        icon: '⏱️',
        excerpt: 'Relay intercropping staggers crops in time so each occupies the same space at different growth stages — maximising resource use without competition.',
        body: 'Relay intercropping differs from simultaneous intercropping in that crops are planted at different times so their peak demands never coincide. In the cassava-maize relay: Maize (C4 cereal, 90 days) is established first and captures maximum sunlight. Cassava is planted 6 weeks later while maize is in vegetative growth — low competition. African Yam Bean is planted at the base of maize stalks and uses them as a trellis throughout its 120-day growth. When maize is harvested at 90 days, its dry stalks remain standing for 2–3 more months as natural stakes. Cassava then dominates the plot for the remaining 10–18 months, benefiting from the N legacy of the legumes.',
        relatedCropIds: ['cassava', 'maize', 'african-yam-bean'],
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'Relay Planting Logic',
        body: 'The relay system is a time-based optimization. Instead of cramming all crops together, stagger them so each crop peaks when it has the most resources. Maize first, then cassava, then legumes fill the gaps.',
        illustration: '⏱️🌽🌿🫘',
        cameraPreset: 'overview',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-relay',
        question: 'What is the key advantage of relay intercropping compared to simultaneous intercropping?',
        options: [
          'Relay systems use less water overall',
          'Relay systems avoid direct competition by staggering crop establishment times',
          'Relay systems produce higher yields of every individual crop',
          'Relay systems require less labour for planting',
        ],
        correctIndex: 1,
        explanation: 'In relay intercropping, crops are planted at different times so their peak growth and resource demand periods do not overlap. This avoids the direct competition that occurs in simultaneous intercropping, while still using the same land area productively throughout the season.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Ofada Rice-Fish-Duck Integrated Wetland
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ofada-rice-aquaculture',
    name: 'Ofada Rice-Fish-Duck Wetland',
    subtitle: 'Integrated Rice-Fish-Poultry System',
    biome: 'swamp-forest',
    region: 'Ogun River Basin / Ogun / Lagos Border',
    accentColor: '#1565c0',
    accentColor2: '#2e7d32',
    icon: '🌾',
    cropIds: ['ofada-rice'],
    livestockIds: ['catfish', 'tilapia', 'chickens'],
    lerBaseline: 1.88,
    nitrogenDelta: 72,
    weedSuppressionPct: 78,
    pestResistancePct: 68,
    canopyParPct: 65,
    description: 'The most productive integrated system per unit of water and land. Flooded paddy rice creates habitat for fish in deep peripheral trenches. Fish waste (ammonium-rich effluent) provides 40–60% of the paddy\'s N requirement, replacing synthetic fertiliser. Ducks patrol the water surface consuming snails and aquatic insects.',
    highlights: [
      'Flooded terrace with swimming fish beneath rice stems',
      'Ducks filtering snails from paddy water',
      'Azolla green carpet on water surface fixing atmospheric nitrogen',
      'Fish effluent plumes rising to rice root zone',
    ],
    hotspots: [
      {
        id: 'hs-paddy-trench',
        label: 'Deep Peripheral Fish Trench',
        description: 'A 60–90cm deep trench surrounds the paddy. During harvest, when water is drained, fish concentrate in the trench for easy capture. During the growing season, fish move freely through the paddy feeding on pests.',
        position3d: [1.8, -0.2, 0],
        color: '#1976d2',
      },
      {
        id: 'hs-rice-fish-synergy',
        label: 'N-Cycling Flow',
        description: 'Fish consume insects and algae → excrete ammonium (NH₄⁺) → rice roots absorb NH₄⁺ directly → rice growth feeds more leaf litter and algae → algae feed fish. A closed nutrient cycle.',
        position3d: [0, 0.5, 1.2],
        color: '#69f0ae',
      },
    ],
    educationalCards: [
      {
        id: 'ec-rice-fish-cycle',
        category: 'water',
        title: 'The Rice-Fish Nutrient Loop',
        icon: '💧',
        excerpt: 'Fish and rice create one of agriculture\'s most elegant nutrient cycles — each species producing what the other needs.',
        body: 'The integrated rice-fish system is a masterpiece of ecological engineering. Fish consume aquatic weeds, fallen rice plant material, insects, and algae. They excrete ammonium (NH₄⁺) as metabolic waste — the same form of nitrogen that rice roots preferentially absorb. The NH₄⁺ concentration in fish-cultivated paddies is 40–60% higher than un-stocked paddies, directly reducing the need for synthetic urea fertiliser. Meanwhile, rice plants shade the water, reducing algae blooms that would deplete dissolved oxygen for the fish. Tilapia additionally control submerged aquatic weeds by 50–70%, reducing manual weeding labour.',
        relatedCropIds: ['ofada-rice'],
        dataTable: {
          headers: ['Metric', 'Fish-Free Paddy', 'Rice-Fish System'],
          rows: [
            ['N fertiliser needed', '80 kg/ha', '30–45 kg/ha'],
            ['Weed control cost', '₦35,000/ha', '₦12,000/ha'],
            ['Total protein output', 'Rice only', 'Rice + 300–600 kg fish/ha'],
            ['Water productivity', '100%', '165%'],
          ],
        },
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'The Paddy as an Ecosystem',
        body: 'The flooded paddy is not just a field — it\'s a managed wetland ecosystem. The water layer creates habitat for fish, algae, and insects. Each organism in this water ecosystem contributes to the rice crop above.',
        illustration: '💧🌾🐟',
        cameraPreset: 'overview',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-ricefish',
        question: 'What form of nitrogen do fish excrete that rice roots absorb most readily?',
        options: ['Nitrate (NO₃⁻)', 'Ammonium (NH₄⁺)', 'Atmospheric N₂', 'Organic protein-N'],
        correctIndex: 1,
        explanation: 'Fish excrete ammonium (NH₄⁺) as their primary nitrogenous waste. Rice roots can directly absorb NH₄⁺ from the water, making this the most efficient form of N transfer in the rice-fish system. This reduces the need for synthetic urea by 40–60%.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Oil Palm-Pineapple-Ginger Silvopasture
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'oil-palm-silvopasture',
    name: 'Oil Palm Silvopasture',
    subtitle: 'Palm-Pineapple-Ginger & Goat Orchard',
    biome: 'derived-savanna',
    region: 'Ondo / Delta / Rivers State',
    accentColor: '#ff6d00',
    accentColor2: '#2e7d32',
    icon: '🌴',
    cropIds: ['oil-palm', 'pineapple', 'ginger', 'sweet-potato', 'bitter-leaf'],
    livestockIds: ['wad-goats', 'wad-sheep', 'honeybee'],
    lerBaseline: 1.82,
    nitrogenDelta: 28,
    weedSuppressionPct: 79,
    pestResistancePct: 64,
    canopyParPct: 83,
    description: 'Mature oil palm provides a structured canopy that filters intense tropical sun. Pineapple planted along contour lines arrests slope erosion. Ginger thrives in the 70% shade below palm fronds. WAD Goats graze understory grass, their manure fertilising the system — completing a silvopasture that is both highly productive and erosion-resistant.',
    highlights: [
      'Sunlight filtered through palm fronds onto ginger rhizomes',
      'Pineapple erosion hedges along contour terraces on slopes',
      'Goats grazing understory grass between palm rows',
      'Honey bee hives at forest edge, pollinating oil palm flowers',
    ],
    hotspots: [
      {
        id: 'hs-palm-canopy',
        label: 'Oil Palm Canopy Architecture',
        scientificName: 'Elaeis guineensis',
        description: 'The crown of 30–40 feather-compound fronds creates 60–80% canopy closure. The interfrond gaps create a dappled light pattern ideal for shade-tolerant understory crops like ginger (70% shade tolerance).',
        position3d: [0, 4, 0],
        color: '#ff8c00',
      },
      {
        id: 'hs-pineapple-contour',
        label: 'Contour Pineapple Anti-Erosion Hedge',
        description: 'Pineapple rosettes planted along slope contours at 50–60cm spacing create a physical barrier that slows overland water flow, causing sediment deposition upslope and preventing rill erosion.',
        position3d: [1.5, 0.2, 0.8],
        color: '#ffdb58',
      },
    ],
    educationalCards: [
      {
        id: 'ec-silvopasture',
        category: 'economics',
        title: 'Silvopasture: Trees + Pasture + Animals',
        icon: '🌳',
        excerpt: 'Silvopasture integrates trees, livestock, and forage in the same system — creating multiple income streams and ecological services from a single land area.',
        body: 'Silvopasture is one of the most ecologically and economically efficient land use systems known. In this oil palm silvopasture: The oil palm provides the highest-yielding vegetable oil on earth (3–6 t/ha). WAD Goats grazing understory weeds reduce herbicide costs and convert biomass into 2,400 kg/ha of high-N manure that fertilises the palms. Pineapple on contour terraces generates a second income stream while preventing erosion. Ginger under palm shade is a premium-price commodity with no additional land cost. The system produces 4 income streams (palm oil, goat meat/milk, pineapple, ginger) from one hectare.',
        relatedCropIds: ['oil-palm', 'pineapple', 'ginger'],
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'The Canopy as Infrastructure',
        body: 'The oil palm canopy is farm infrastructure. Just as a greenhouse controls light and climate, the palm canopy creates a modified microclimate below — cooler, more humid, and filtered — that enables crops that cannot grow in direct tropical sun.',
        illustration: '🌴☀️🫚',
        cameraPreset: 'overview',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-palm',
        question: 'What is the primary ecological role of pineapple planted on slope contours?',
        options: [
          'Pineapple shades the soil to reduce water evaporation',
          'Pineapple roots fix nitrogen for the oil palms',
          'Pineapple rosettes physically intercept overland water flow, preventing soil erosion',
          'Pineapple attracts pollinators for oil palm flowers',
        ],
        correctIndex: 2,
        explanation: 'Pineapple rosettes planted along slope contours create physical barriers (contour hedgerows) that intercept overland runoff, slowing water velocity and causing sediment to deposit upslope. This prevents rill and sheet erosion on sloped oil palm plantations.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Mandala Market Garden
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'mandala-market-garden',
    name: 'Mandala Market Garden',
    subtitle: 'Indigenous Greens, Peppers & Pest Barrier Garden',
    biome: 'rainforest',
    region: 'Peri-Urban Southwest Nigeria',
    accentColor: '#2e7d32',
    accentColor2: '#c62828',
    icon: '🌶️',
    cropIds: ['pumpkin', 'okra', 'hot-pepper', 'tomato', 'waterleaf', 'scent-leaf', 'bitter-leaf', 'ginger'],
    livestockIds: ['chickens', 'land-snail'],
    lerBaseline: 1.61,
    nitrogenDelta: 22,
    weedSuppressionPct: 81,
    pestResistancePct: 82,
    canopyParPct: 68,
    description: 'A concentric bed design inspired by permaculture mandala gardens. The outer ring of scent leaf and bitter leaf creates an aromatic chemical shield. Inner rings of pumpkin, okra, and tomato benefit from reduced aphid, whitefly, and nematode pressure. The design maximises edge effect — every plant is near a beneficial neighbour.',
    highlights: [
      'Concentric bed design viewed from above',
      'Aromatic vapor halos showing pest repulsion around Efinrin / Bitter Leaf',
      'Lush multi-colored foliage: deep purple Celosia, bright orange peppers, dark green pumpkin',
      'Chicken scratching for beetles at garden margins',
    ],
    hotspots: [
      {
        id: 'hs-efinrin-shield',
        label: 'Aromatic Pest Shield — Efinrin',
        scientificName: 'Ocimum gratissimum',
        description: 'Volatile terpenoids (eugenol, thymol, linalool) from scent leaf diffuse up to 20–30m in still air. They disrupt the olfactory chemoreceptors of aphids and whiteflies, preventing them from locating host plants.',
        position3d: [1.5, 0.5, 1.5],
        color: '#2e7d32',
      },
      {
        id: 'hs-bitter-hedge',
        label: 'Bitter Leaf Boundary Hedge',
        scientificName: 'Vernonia amygdalina',
        description: 'Planted as a 2–3m tall living fence around the market garden. Sesquiterpene lactones in leaves have proven antifungal activity against Fusarium, Pythium, and powdery mildew fungi that attack tomatoes and garden eggs.',
        position3d: [-1.8, 1.2, 0],
        color: '#1b5e20',
      },
    ],
    educationalCards: [
      {
        id: 'ec-aromatic-shield',
        category: 'pest',
        title: 'Botanical Pest Control: The Chemistry of Aromatics',
        icon: '🌿',
        excerpt: 'Scent leaf (Efinrin) produces volatile terpenoids that disrupt insect chemoreception — a natural, zero-residue pesticide shield.',
        body: 'Ocimum gratissimum (scent leaf / efinrin) produces a complex blend of volatile terpenoids: eugenol (40–55%), thymol (15–20%), and linalool (8–12%). These compounds diffuse into the surrounding air and soil. For aphids and whiteflies, whose host location relies on olfactory detection of plant volatiles (particularly green leaf volatiles like (E)-2-hexenal), the high concentration of eugenol acts as a sensory mask — disrupting their ability to locate host tomato, pepper, and garden egg plants. At the soil level, eugenol diffuses through the root zone, disrupting the chemosensory pores (amphids) of root-knot nematode (Meloidogyne spp.) juveniles, reducing their ability to locate and infect roots. Field studies report 40–55% reduction in nematode gall counts when scent leaf is interplanted with tomato.',
        relatedCropIds: ['scent-leaf', 'bitter-leaf', 'tomato', 'hot-pepper'],
        formula: 'Eugenol C₁₀H₁₂O₂ — Thymol C₁₀H₁₄O — Linalool C₁₀H₁₈O',
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'The Mandala Design Principle',
        body: 'The circular mandala garden maximises beneficial adjacency. Every plant borders at least two other species. The outer ring protects the inner. The design puts the most pest-prone crops (tomato, garden egg) furthest from the garden edge where pest pressure is highest.',
        illustration: '⭕🌶️🍅',
        cameraPreset: 'top-down',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-mandala',
        question: 'How does Scent Leaf (Efinrin) protect companion tomato plants from aphids?',
        options: [
          'Efinrin releases sugars that attract aphid predators (ladybirds)',
          'Efinrin volatile terpenoids disrupt aphids\' olfactory ability to locate host plants',
          'Efinrin physically blocks aphids with its hairy leaves',
          'Efinrin makes tomato leaves too bitter for aphids to eat',
        ],
        correctIndex: 1,
        explanation: 'Scent leaf produces volatile terpenoids (eugenol, thymol) that diffuse into the surrounding air. These chemicals disrupt the olfactory chemoreceptors aphids use to locate host plants by their volatiles — effectively hiding the tomato from aphid detection.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Guinea Savanna Cereal Belt
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'savanna-cereal-belt',
    name: 'Guinea Savanna Cereal Belt',
    subtitle: 'Drought-Hardy Grains, Groundnuts & Rotational Grazing',
    biome: 'guinea-savanna',
    region: 'Kwara / Kogi / Niger / Benue States',
    accentColor: '#f9a825',
    accentColor2: '#6d4c41',
    icon: '🌾',
    cropIds: ['sorghum', 'pearl-millet', 'bambara-groundnut', 'groundnut', 'sweet-potato', 'cowpea'],
    livestockIds: ['wad-goats', 'wad-sheep', 'chickens'],
    lerBaseline: 1.58,
    nitrogenDelta: 55,
    weedSuppressionPct: 67,
    pestResistancePct: 52,
    canopyParPct: 62,
    description: 'The resilience-first farming system of the Guinea Savanna. Drought-hardy sorghum and pearl millet dominate, intercropped with bambara groundnut and cowpea to fix nitrogen in the poor laterite soils. Livestock graze crop residues after harvest and cycle organic matter through dung — maintaining SOM in an environment where decomposition is seasonally limited.',
    highlights: [
      'Deep drought-hardy root systems penetrating laterite subsoil',
      'Subterranean bambara groundnut pods developing underground',
      'Dry-season residue grazing by goats and sheep',
      'Dung beetles cycling livestock manure into soil',
    ],
    hotspots: [
      {
        id: 'hs-sorghum-allelopathy',
        label: 'Sorghum Allelopathic Zone',
        scientificName: 'Sorghum bicolor',
        description: 'Sorghum root exudates (sorgoleone, a hydrophobic quinone) suppress germination of broadleaf weeds in the surrounding 15–20cm of soil. This natural herbicide effect reduces weed control labour by 40–60%.',
        position3d: [0, -0.4, 0],
        color: '#c48a2a',
      },
      {
        id: 'hs-bambara-underground',
        label: 'Bambara Groundnut Underground Pods',
        scientificName: 'Vigna subterranea',
        description: 'Bambara thrives where no other pulse survives — the peg-bearing lateral roots grow downward and the pods develop underground in phosphorus-poor laterite soils, using P-mobilising exudates to access what other crops cannot.',
        position3d: [1, -0.5, 0.5],
        color: '#b87a3a',
      },
    ],
    educationalCards: [
      {
        id: 'ec-residue-grazing',
        category: 'culture',
        title: 'Crop Residue Grazing: Closing the Loop',
        icon: '🐐',
        excerpt: 'After cereal harvest, livestock graze the standing residues — converting fibrous straw into N-rich manure while clearing the field for the next planting season.',
        body: 'Post-harvest residue grazing is one of the oldest and most efficient nutrient recycling strategies in African agriculture. After sorghum and millet harvest, the standing stubble and leaf material contains 40–60% of the crop\'s remaining nitrogen, phosphorus, and potassium in organic form. When WAD Goats and sheep graze this material, their gut microbiome partially decomposes it, and the nitrogen is mineralised and excreted as urea and ammonium in dung and urine — directly available to the subsequent crop\'s root zone. Goats also trample the soil between their hoofbeats, incorporating surface residue into the top 2–5cm — a natural light cultivation effect. The combination of grazing + manure deposition typically increases the following season\'s cereal yield by 15–25% compared to no residue management.',
        relatedCropIds: ['sorghum', 'pearl-millet', 'bambara-groundnut'],
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'Farming at the Climate Edge',
        body: 'The Guinea Savanna receives 900–1200mm of rain, but all in a single wet season of 5–6 months. The other 6 months are completely dry. Every crop and practice here is designed for resilience — storing energy (in seeds, tubers, and dung) for the dry season ahead.',
        illustration: '☀️🌾🐐',
        cameraPreset: 'overview',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-savanna',
        question: 'What chemical compound from sorghum roots naturally suppresses weed germination?',
        options: ['Allelopathic sorgoleone — a hydrophobic quinone', 'Cytokinin', 'Auxin', 'Abscisic acid'],
        correctIndex: 0,
        explanation: 'Sorghum produces sorgoleone — a hydrophobic quinone compound — from root exudates. Sorgoleone inhibits photosynthesis and germination in broadleaf weeds in the surrounding 15–20cm soil zone, providing natural weed suppression for 40–60% reduction in weeding labour.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Zero-Waste Bio-Dome: Aquaponics + Snailery
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'aquaponics-snailery',
    name: 'Zero-Waste Bio-Dome',
    subtitle: 'Aquaponics + Snailery + DWC Greens',
    biome: 'aquatic',
    region: 'Urban / Peri-Urban Nigeria',
    accentColor: '#0277bd',
    accentColor2: '#1b5e20',
    icon: '🐟',
    cropIds: ['waterleaf', 'okra', 'pawpaw'],
    livestockIds: ['catfish', 'tilapia', 'land-snail'],
    lerBaseline: 1.95,
    nitrogenDelta: 88,
    weedSuppressionPct: 92,
    pestResistancePct: 74,
    canopyParPct: 71,
    description: 'The highest-productivity, zero-waste system in the atlas. African Catfish tanks produce ammonium-rich water that feeds Deep Water Culture (DWC) floating beds of waterleaf and okra. Solid fish waste is composted and fed to Giant African Snails in shaded humid enclosures. Snail faeces and uneaten feed enrich a biodigestor that returns nutrient-dense liquid back to the fish tanks. Zero external inputs after startup.',
    highlights: [
      'Recirculating water bio-filter loops showing ammonium conversion to nitrate',
      'Snail humid incubation boxes with pawpaw leaf feed',
      'Floating DWC raft root systems suspended in nutrient-dense water',
      'Biofilter media colonised by nitrifying bacteria (Nitrosomonas, Nitrobacter)',
    ],
    hotspots: [
      {
        id: 'hs-biofilter',
        label: 'Nitrification Biofilter',
        scientificName: 'Nitrosomonas + Nitrobacter',
        description: 'The biofilter converts fish-excreted ammonium (toxic to fish at >1 mg/L) first to nitrite (Nitrosomonas bacteria), then to nitrate (Nitrobacter bacteria). Nitrate is plant-available and non-toxic — the key to aquaponic chemistry.',
        position3d: [0.8, 0.3, 0.8],
        color: '#4fc3f7',
      },
      {
        id: 'hs-dwc-roots',
        label: 'DWC Floating Root Mats',
        description: 'Plant roots hang directly into nitrate-rich water (no soil required). The roots absorb N, P, K, Ca, Mg and micronutrients directly. Dissolved oxygen must be maintained at >6 mg/L for root respiration — achieved with air stones.',
        position3d: [-0.5, 0.6, -0.3],
        color: '#81c784',
      },
    ],
    educationalCards: [
      {
        id: 'ec-nitrification',
        category: 'water',
        title: 'Nitrification: The Chemistry of Aquaponics',
        icon: '🧪',
        excerpt: 'Two groups of bacteria convert fish waste into plant fertiliser through a two-step chemical process called nitrification.',
        body: 'Aquaponics depends on the nitrogen cycle and specifically on two bacterial guilds in the biofilter. Fish excrete ammonium (NH₄⁺) which is toxic to fish at concentrations > 1–2 mg/L. Step 1: Nitrosomonas bacteria oxidise NH₄⁺ to nitrite (NO₂⁻): NH₄⁺ + 1.5O₂ → NO₂⁻ + 2H⁺ + H₂O. Nitrite is even more toxic than ammonium. Step 2: Nitrobacter bacteria oxidise NO₂⁻ to nitrate (NO₃⁻): NO₂⁻ + 0.5O₂ → NO₃⁻. Nitrate is both non-toxic to fish (tolerated up to 200+ mg/L) and the primary nitrogen form for plant roots. The biofilter maintains both bacterial communities in a thin biofilm on plastic or ceramic media. Establishing this biofilm (cycling the system) takes 3–6 weeks. The entire system\'s productivity depends on this invisible microbial workforce.',
        relatedCropIds: ['waterleaf', 'okra'],
        formula: 'NH₄⁺ → NO₂⁻ → NO₃⁻ (Nitrification pathway)',
        dataTable: {
          headers: ['Parameter', 'Optimal Range'],
          rows: [
            ['Temperature', '22–28°C'],
            ['pH', '6.8–7.2'],
            ['Dissolved O₂', '>6 mg/L'],
            ['NH₄⁺ (safe)', '<1 mg/L'],
            ['NO₃⁻ (plant N)', '50–150 mg/L'],
          ],
        },
      },
    ],
    lessonSteps: [
      {
        stepNum: 1,
        title: 'Zero-Waste Design Thinking',
        body: 'In nature, there is no "waste" — every output from one organism is an input for another. This bio-dome mimics that principle: fish waste → plant nutrient → plant trim → snail feed → snail frass → biodigestor → fish feed supplement. Nothing leaves the system.',
        illustration: '🐟💧🥬🐌🔄',
        cameraPreset: 'overview',
      },
    ],
    quizQuestions: [
      {
        id: 'q1-aqua',
        question: 'In the aquaponic nitrification cycle, which bacteria converts ammonium (NH₄⁺) to nitrite (NO₂⁻)?',
        options: ['Nitrobacter', 'Nitrosomonas', 'Bradyrhizobium', 'Azotobacter'],
        correctIndex: 1,
        explanation: 'Nitrosomonas bacteria perform the first step of nitrification: oxidising ammonium (NH₄⁺) to nitrite (NO₂⁻). The second step (NO₂⁻ → NO₃⁻) is performed by Nitrobacter. Both are essential for converting toxic fish waste into plant-available nitrate.',
      },
    ],
  },
];

export const getFarmById = (id: string): FarmEcosystem | undefined =>
  FARMS.find(f => f.id === id);
