import type { SavedFarmConfig } from '@/data/types';

const API_BASE = '/api/farms';

interface RawDbFarm {
  id: string;
  name: string;
  description?: string;
  farmAcreage: number;
  cropIds: string[];
  livestockIds: string[];
  infrastructure: Record<string, boolean>;
  baseFarmId?: string | null;
  farmShape?: 'square' | 'circle';
  biome?: any;
  notes?: string;
  createdAt: string | number;
  updatedAt?: string | number;
}

function normalizeDbFarm(raw: RawDbFarm): SavedFarmConfig {
  const createdAtNum = typeof raw.createdAt === 'number' ? raw.createdAt : new Date(raw.createdAt).getTime();
  const updatedAtNum = raw.updatedAt
    ? typeof raw.updatedAt === 'number'
      ? raw.updatedAt
      : new Date(raw.updatedAt).getTime()
    : createdAtNum;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    createdAt: isNaN(createdAtNum) ? Date.now() : createdAtNum,
    updatedAt: isNaN(updatedAtNum) ? Date.now() : updatedAtNum,
    baseFarmId: raw.baseFarmId || null,
    cropIds: raw.cropIds || [],
    livestockIds: raw.livestockIds || [],
    farmAcreage: Number(raw.farmAcreage) || 2.47,
    infrastructure: {
      roads: Boolean(raw.infrastructure?.roads),
      farmhouse: Boolean(raw.infrastructure?.farmhouse),
      cctv: Boolean(raw.infrastructure?.cctv),
      waterTower: Boolean(raw.infrastructure?.waterTower || raw.infrastructure?.water),
      solarArray: Boolean(raw.infrastructure?.solarArray || raw.infrastructure?.solar),
      perimeterFence: Boolean(raw.infrastructure?.perimeterFence || raw.infrastructure?.fence),
      dryingPatio: Boolean(raw.infrastructure?.dryingPatio || raw.infrastructure?.drying),
    },
    farmShape: (raw.farmShape === 'circle' ? 'circle' : 'square') as 'square' | 'circle',
    biome: raw.biome || 'rainforest',
  };
}

export const sqliteFarmService = {
  /**
   * Fetch all saved farm configurations from the SQLite database.
   */
  async getAll(): Promise<SavedFarmConfig[]> {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error(`Failed to fetch farms from SQLite: ${res.statusText}`);
      }
      const rawList = (await res.json()) as RawDbFarm[];
      return rawList.map(normalizeDbFarm);
    } catch (err) {
      console.error('[SQLite Service] Error fetching farms:', err);
      return [];
    }
  },

  /**
   * Fetch a single farm configuration by ID from SQLite.
   */
  async getById(id: string): Promise<SavedFarmConfig | null> {
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch farm ${id}: ${res.statusText}`);
      }
      const raw = (await res.json()) as RawDbFarm;
      return normalizeDbFarm(raw);
    } catch (err) {
      console.error(`[SQLite Service] Error fetching farm ${id}:`, err);
      return null;
    }
  },

  /**
   * Save (insert or update) a farm configuration in the SQLite database.
   */
  async save(farm: SavedFarmConfig): Promise<SavedFarmConfig> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farm),
    });

    if (!res.ok) {
      throw new Error(`Failed to save farm to SQLite: ${res.statusText}`);
    }

    const raw = (await res.json()) as RawDbFarm;
    return normalizeDbFarm(raw);
  },

  /**
   * Delete a farm configuration by ID from the SQLite database.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete farm from SQLite: ${res.statusText}`);
      }

      const data = await res.json();
      return Boolean(data.success);
    } catch (err) {
      console.error(`[SQLite Service] Error deleting farm ${id}:`, err);
      return false;
    }
  },
};
