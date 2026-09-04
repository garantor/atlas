/**
 * Farm Atlas — Zustand State Store
 */

import { create } from 'zustand';
import type { AtlasState, IntercroppingResult, ViewState, Season, BiomeZone, SavedFarmConfig } from '../data/types';
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
  farmerAdvisories: [],
};

const SAVED_FARMS_KEY = 'atlas_saved_farms_v1';

const getInitialSavedFarms = (): SavedFarmConfig[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_FARMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedFarmConfig[];
  } catch {
    return [];
  }
};

const persistSavedFarms = (configs: SavedFarmConfig[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_FARMS_KEY, JSON.stringify(configs));
  } catch (err) {
    console.warn('Failed to persist saved farms:', err);
  }
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
  setDisplayMode: (mode: 'farm' | 'sandbox') => void;
  setSearchOpen: (open: boolean) => void;
  setLessonOpen: (open: boolean) => void;
  setQuizOpen: (open: boolean) => void;
  setCardDetail: (id: string | null) => void;
  setBiomeFilter: (biome: BiomeZone | 'all') => void;
  setFarmShape: (shape: 'square' | 'circle') => void;
  setFarmAcreage: (acres: number) => void;
  toggleInfrastructure: (key: keyof import('../data/types').FarmInfrastructure) => void;
  setInfrastructure: (infra: Partial<import('../data/types').FarmInfrastructure>) => void;
  saveFarmConfig: (name: string, description?: string) => SavedFarmConfig;
  loadSavedFarmConfig: (configId: string) => void;
  deleteSavedFarmConfig: (configId: string) => void;
  setSaveModalOpen: (open: boolean) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
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
  activeDisplayMode: 'farm',
  farmShape: 'square',
  farmAcreage: 2.47, // 1 Hectare default
  infrastructure: {
    roads: true,
    farmhouse: true,
    cctv: true,
    waterTower: true,
    solarArray: true,
    perimeterFence: true,
    dryingPatio: true,
  },
  savedFarmConfigs: getInitialSavedFarms(),
  loadedSavedConfigId: null,
  saveModalOpen: false,
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
  leftPanelOpen: true,
  rightPanelOpen: true,
  layerFilters: {
    canopy: true,
    shrub: true,
    herbaceous: true,
    roots: true,
    fauna: true,
    particles: true,
  },

  // ─── Actions ───────────────────────────────────────────────────────────────
  selectFarm: (id) => set({ selectedFarmId: id, activeDisplayMode: 'farm', activeHotspotId: null, loadedSavedConfigId: null }),

  setDisplayMode: (mode) => set({ activeDisplayMode: mode }),

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
    set({ sandboxCropIds: newCropIds, simulationResult: result, activeDisplayMode: 'sandbox' });
  },

  removeSandboxCrop: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    const newCropIds = sandboxCropIds.filter(c => c !== id);
    const result = simulateIntercropping(newCropIds, sandboxLivestockIds);
    set({ sandboxCropIds: newCropIds, simulationResult: result, activeDisplayMode: 'sandbox' });
  },

  addSandboxLivestock: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    if (sandboxLivestockIds.includes(id)) return;
    const newLivestockIds = [...sandboxLivestockIds, id];
    const result = simulateIntercropping(sandboxCropIds, newLivestockIds);
    set({ sandboxLivestockIds: newLivestockIds, simulationResult: result, activeDisplayMode: 'sandbox' });
  },

  removeSandboxLivestock: (id) => {
    const { sandboxCropIds, sandboxLivestockIds } = get();
    const newLivestockIds = sandboxLivestockIds.filter(l => l !== id);
    const result = simulateIntercropping(sandboxCropIds, newLivestockIds);
    set({ sandboxLivestockIds: newLivestockIds, simulationResult: result, activeDisplayMode: 'sandbox' });
  },

  clearSandbox: () => set({
    sandboxCropIds: [],
    sandboxLivestockIds: [],
    simulationResult: DEFAULT_SIMULATION,
    activeDisplayMode: 'farm',
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
      activeDisplayMode: 'sandbox',
    });
  },

  setSearchOpen: (open) => set({ searchOpen: open }),
  setLessonOpen: (open) => set({ lessonOpen: open }),
  setQuizOpen: (open) => set({ quizOpen: open }),
  setCardDetail: (id) => set({ cardDetailId: id }),
  setBiomeFilter: (biome) => set({ biomeFilter: biome }),
  setFarmShape: (shape) => set({ farmShape: shape }),
  setFarmAcreage: (acres) => set({ farmAcreage: Math.max(0.1, acres) }),
  toggleInfrastructure: (key) =>
    set((state) => ({
      infrastructure: {
        ...state.infrastructure,
        [key]: !state.infrastructure[key],
      },
    })),
  setInfrastructure: (infra) =>
    set((state) => ({
      infrastructure: {
        ...state.infrastructure,
        ...infra,
      },
    })),

  saveFarmConfig: (name, description) => {
    const {
      selectedFarmId, activeDisplayMode, farmShape, farmAcreage, infrastructure,
      sandboxCropIds, sandboxLivestockIds
    } = get();

    let cropIds: string[] = [];
    let livestockIds: string[] = [];
    let biome: BiomeZone | undefined = undefined;

    if (activeDisplayMode === 'sandbox') {
      cropIds = [...sandboxCropIds];
      livestockIds = [...sandboxLivestockIds];
    } else {
      const farm = FARMS.find(f => f.id === selectedFarmId);
      if (farm) {
        cropIds = [...farm.cropIds];
        livestockIds = [...farm.livestockIds];
        biome = farm.biome;
      }
    }

    const newConfig: SavedFarmConfig = {
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'Custom Farm Configuration',
      description: description?.trim(),
      createdAt: Date.now(),
      baseFarmId: selectedFarmId,
      cropIds,
      livestockIds,
      farmAcreage,
      infrastructure: { ...infrastructure },
      farmShape,
      biome,
    };

    const updated = [newConfig, ...get().savedFarmConfigs];
    persistSavedFarms(updated);
    set({ savedFarmConfigs: updated, saveModalOpen: false, loadedSavedConfigId: newConfig.id });
    return newConfig;
  },

  loadSavedFarmConfig: (configId) => {
    const config = get().savedFarmConfigs.find(c => c.id === configId);
    if (!config) return;

    const sim = simulateIntercropping(config.cropIds, config.livestockIds);
    set({
      selectedFarmId: config.baseFarmId || null,
      loadedSavedConfigId: config.id,
      farmAcreage: config.farmAcreage,
      infrastructure: { ...config.infrastructure },
      farmShape: config.farmShape,
      sandboxCropIds: config.cropIds,
      sandboxLivestockIds: config.livestockIds,
      simulationResult: sim,
      activeDisplayMode: 'sandbox', // Use sandbox mode to render exact saved species
    });
  },

  deleteSavedFarmConfig: (configId) => {
    const updated = get().savedFarmConfigs.filter(c => c.id !== configId);
    persistSavedFarms(updated);
    set(state => ({
      savedFarmConfigs: updated,
      loadedSavedConfigId: state.loadedSavedConfigId === configId ? null : state.loadedSavedConfigId,
    }));
  },

  setSaveModalOpen: (open) => set({ saveModalOpen: open }),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  toggleLeftPanel: () => set(state => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () => set(state => ({ rightPanelOpen: !state.rightPanelOpen })),

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

export const useLoadedSavedFarm = () => {
  const loadedId = useAtlas(s => s.loadedSavedConfigId);
  const configs = useAtlas(s => s.savedFarmConfigs);
  if (!loadedId) return null;
  return configs.find(c => c.id === loadedId) ?? null;
};
