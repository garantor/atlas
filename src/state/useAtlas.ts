/**
 * Farm Atlas — Zustand State Store
 */

import { create } from 'zustand';
import type { AtlasState, IntercroppingResult, ViewState, Season, BiomeZone } from '../data/types';
import { simulateIntercropping } from '../data/intercroppingRules';
import { FARMS } from '../data/farms/index';

const DEFAULT_SIMULATION: IntercroppingResult = {
  ler: 0,
  nitrogenDelta: 0,
  weedSuppression: 0,
  pestResistance: 0,
  canopyPAR: 0,
  waterEfficiency: 0,
  compatibilityWarnings: [],
  synergies: [],
};

interface AtlasActions {
  selectFarm: (id: string | null) => void;
  setViewState: (state: ViewState) => void;
  setActiveHotspot: (id: string | null) => void;
  setSeason: (season: Season) => void;
  setTimeOfDay: (hour: number) => void;
  toggleTheme: () => void;
  addSandboxCrop: (id: string) => void;
  removeSandboxCrop: (id: string) => void;
  addSandboxLivestock: (id: string) => void;
  removeSandboxLivestock: (id: string) => void;
  clearSandbox: () => void;
  loadFarmIntoSandbox: () => void;
  setSearchOpen: (open: boolean) => void;
  setLessonOpen: (open: boolean) => void;
  setQuizOpen: (open: boolean) => void;
  setCardDetail: (id: string | null) => void;
  setBiomeFilter: (biome: BiomeZone | 'all') => void;
  toggleLayer: (layer: keyof AtlasState['layerFilters']) => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
  }
  return 'dark';
};

export const useAtlas = create<AtlasState & AtlasActions>((set, get) => ({
  // ─── State ─────────────────────────────────────────────────────────────────
  selectedFarmId: 'cocoa-agroforest',
  viewState: 'macro',
  activeHotspotId: null,
  season: 'wet',
  timeOfDay: 10,
  theme: getInitialTheme(),
  sandboxCropIds: [],
  sandboxLivestockIds: [],
  simulationResult: DEFAULT_SIMULATION,
  searchOpen: false,
  lessonOpen: false,
  quizOpen: false,
  cardDetailId: null,
  biomeFilter: 'all',
  layerFilters: {
    canopy: true,
    shrub: true,
    herbaceous: true,
    roots: true,
    fauna: true,
    particles: true,
  },

  // ─── Actions ───────────────────────────────────────────────────────────────
  selectFarm: (id) => set({ selectedFarmId: id, activeHotspotId: null }),

  setViewState: (state) => set({ viewState: state }),

  setActiveHotspot: (id) => set({ activeHotspotId: id }),

  setSeason: (season) => set({ season }),

  setTimeOfDay: (hour) => set({ timeOfDay: hour }),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },

  addSandboxCrop: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    if (sandboxCropIds.includes(id)) return;
    const newCropIds = [...sandboxCropIds, id];
    const result = simulateIntercropping(newCropIds, sandboxLivestockIds);
    set({ sandboxCropIds: newCropIds, simulationResult: result });
  },

  removeSandboxCrop: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    const newCropIds = sandboxCropIds.filter(c => c !== id);
    const result = simulateIntercropping(newCropIds, sandboxLivestockIds);
    set({ sandboxCropIds: newCropIds, simulationResult: result });
  },

  addSandboxLivestock: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    if (sandboxLivestockIds.includes(id)) return;
    const newLivestockIds = [...sandboxLivestockIds, id];
    const result = simulateIntercropping(sandboxCropIds, newLivestockIds);
    set({ sandboxLivestockIds: newLivestockIds, simulationResult: result });
  },

  removeSandboxLivestock: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    const newLivestockIds = sandboxLivestockIds.filter(l => l !== id);
    const result = simulateIntercropping(sandboxCropIds, newLivestockIds);
    set({ sandboxLivestockIds: newLivestockIds, simulationResult: result });
  },

  clearSandbox: () => set({
    sandboxCropIds: [],
    sandboxLivestockIds: [],
    simulationResult: DEFAULT_SIMULATION,
  }),

  loadFarmIntoSandbox: () => {
    const { selectedFarmId } = get();
    const farm = FARMS.find(f => f.id === selectedFarmId);
    if (!farm) return;
    const result = simulateIntercropping(farm.cropIds, farm.livestockIds);
    set({
      sandboxCropIds: farm.cropIds,
      sandboxLivestockIds: farm.livestockIds,
      simulationResult: result,
    });
  },

  setSearchOpen: (open) => set({ searchOpen: open }),
  setLessonOpen: (open) => set({ lessonOpen: open }),
  setQuizOpen: (open) => set({ quizOpen: open }),
  setCardDetail: (id) => set({ cardDetailId: id }),
  setBiomeFilter: (biome) => set({ biomeFilter: biome }),

  toggleLayer: (layer) =>
    set(state => ({
      layerFilters: {
        ...state.layerFilters,
        [layer]: !state.layerFilters[layer],
      },
    })),
}));

// Convenience selectors
export const useSelectedFarm = () => {
  const farmId = useAtlas(s => s.selectedFarmId);
  return FARMS.find(f => f.id === farmId) ?? null;
};
