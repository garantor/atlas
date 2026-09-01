/**
 * Farm Atlas — Core TypeScript Type Definitions
 * Complete biological, agronomic, and simulation types
 */

export type CropCategory =
  | 'tuber'
  | 'cereal'
  | 'legume'
  | 'tree-cash'
  | 'fruit'
  | 'vegetable'
  | 'spice';

export type CanopyTier =
  | 'emergent'      // >15m — Oil Palm, Mango, Breadfruit
  | 'subcanopy'     // 5–15m — Cocoa, Kola, Avocado
  | 'shrub'         // 1–5m — Plantain, Banana, Pigeon Pea, Pawpaw
  | 'herbaceous'    // 0.3–1m — Maize, Cassava, Yam, Peppers
  | 'groundcover'   // 0–0.3m — Pineapple, Egusi, Sweet Potato, Waterleaf
  | 'subterranean'; // Roots/Tubers

export type BiomeZone =
  | 'rainforest'
  | 'derived-savanna'
  | 'swamp-forest'
  | 'guinea-savanna'
  | 'aquatic';

export type NutrientRole = 'fixer' | 'feeder' | 'neutral' | 'miner';
export type ViewState = 'macro' | 'subterranean' | 'cycles';
export type Season = 'wet' | 'dry';
export type CardCategory = 'botany' | 'soil' | 'pest' | 'water' | 'economics' | 'culture';
export type FaunaCategory = 'livestock' | 'poultry' | 'aquatic' | 'micro-fauna' | 'pollinator';

export interface Crop {
  id: string;
  name: string;
  localName: string;
  scientificName: string;
  category: CropCategory;
  canopyTier: CanopyTier;
  icon: string;               // emoji icon
  accentColor: string;        // CSS hex for 3D geometry tint

  // Agronomic properties
  rootDepthCm: [number, number];       // [min, max] cm
  nitrogenFixation: number;            // kg N / ha / yr (0 if non-fixer)
  nutrientRole: NutrientRole;
  shadeTolerancePct: number;           // % shade it can tolerate
  waterRequirementMm: number;          // annual mm rainfall

  // Simulation coefficients
  lerContribution: number;             // base LER partial ratio in monoculture
  weedSuppression: number;             // 0–1 ground cover fraction
  pestAttractionScore: number;         // 0–1 (high = more pests)
  aromaticRepellentScore: number;      // 0–1 (high = repels pests)

  // Content
  description: string;
  keyFacts: string[];
  biomeZones: BiomeZone[];
  companionsWith: string[];            // crop ids
  incompatibleWith: string[];          // crop ids (allelopathy etc)
}

export interface LivestockSpecies {
  id: string;
  name: string;
  localName: string;
  scientificName: string;
  category: FaunaCategory;
  icon: string;
  accentColor: string;

  // Ecological services
  manureOutputKgHa: number;           // annual manure contribution
  pestControlScore: number;           // 0–1 (scratching, eating pests)
  pollinationScore: number;           // 0–1
  weedControlScore: number;           // 0–1
  soilAerationScore: number;          // 0–1
  compactionRisk: number;             // 0–1 (high = overgrazing risk)

  description: string;
  keyFacts: string[];
}

export interface Hotspot {
  id: string;
  label: string;
  scientificName?: string;
  description: string;
  position3d: [number, number, number]; // model-space coords
  color?: string;
}

export interface EducationalCard {
  id: string;
  category: CardCategory;
  title: string;
  excerpt: string;
  body: string;                        // full markdown-like text
  icon: string;                        // emoji
  relatedCropIds: string[];
  formula?: string;                    // LaTeX-style formula text
  dataTable?: { headers: string[]; rows: string[][] };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonStep {
  stepNum: number;
  title: string;
  body: string;
  illustration: string;               // emoji or icon char
  cameraPreset?: string;              // named camera position
}

export interface FarmEcosystem {
  id: string;
  name: string;
  subtitle: string;
  biome: BiomeZone;
  region: string;                     // e.g. "Ondo / Osun Rainforest Belt"
  accentColor: string;                // gradient start color
  accentColor2: string;               // gradient end color
  icon: string;

  cropIds: string[];
  livestockIds: string[];

  lerBaseline: number;                // expected LER for this system
  nitrogenDelta: number;              // net N change kg/ha
  weedSuppressionPct: number;
  pestResistancePct: number;
  canopyParPct: number;               // % PAR at understory

  hotspots: Hotspot[];
  educationalCards: EducationalCard[];
  lessonSteps: LessonStep[];
  quizQuestions: QuizQuestion[];

  description: string;
  highlights: string[];               // 3D view highlights
}

export interface IntercroppingResult {
  ler: number;
  nitrogenDelta: number;              // kg N/ha delta
  weedSuppression: number;            // 0–100%
  pestResistance: number;             // 0–100%
  canopyPAR: number;                  // 0–100% PAR efficiency
  waterEfficiency: number;            // 0–100%
  compatibilityWarnings: string[];
  synergies: string[];
}

export interface AtlasState {
  selectedFarmId: string | null;
  viewState: ViewState;
  activeHotspotId: string | null;
  season: Season;
  timeOfDay: number;                  // 0–24
  theme: 'light' | 'dark';
  sandboxCropIds: string[];
  sandboxLivestockIds: string[];
  simulationResult: IntercroppingResult;
  searchOpen: boolean;
  lessonOpen: boolean;
  quizOpen: boolean;
  cardDetailId: string | null;
  biomeFilter: BiomeZone | 'all';
  layerFilters: {
    canopy: boolean;
    shrub: boolean;
    herbaceous: boolean;
    roots: boolean;
    fauna: boolean;
    particles: boolean;
  };
}
