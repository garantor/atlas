import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, 'atlas.sqlite');

export interface DbSavedFarm {
  id: string;
  name: string;
  description: string;
  acreage: number;
  crop_ids: string; // JSON
  livestock_ids: string; // JSON
  infrastructure: string; // JSON
  base_farm_id: string | null;
  farm_shape: string;
  biome: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FarmPayload {
  id: string;
  name: string;
  description?: string;
  farmAcreage: number;
  cropIds: string[];
  livestockIds: string[];
  infrastructure: Record<string, boolean>;
  baseFarmId?: string | null;
  farmShape?: string;
  biome?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // WAL mode for fast concurrent operations
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS saved_farms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      acreage REAL NOT NULL,
      crop_ids TEXT NOT NULL,
      livestock_ids TEXT NOT NULL,
      infrastructure TEXT NOT NULL,
      base_farm_id TEXT,
      farm_shape TEXT DEFAULT 'square',
      biome TEXT DEFAULT 'rainforest',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_saved_farms_created_at ON saved_farms(created_at DESC);
  `);

  seedDefaultFarmsIfEmpty(db);
}

function seedDefaultFarmsIfEmpty(db: DatabaseSync) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM saved_farms').get() as { count: number };
  if (countRow && countRow.count > 0) return;

  const now = new Date().toISOString();
  const seedFarms: FarmPayload[] = [
    {
      id: 'sqlite-seed-ondo-cocoa',
      name: 'Ondo Valley 100-Acre Cocoa & Solar Estate',
      description: 'Commercial 100-acre shaded cocoa and plantain agroforestry concession powered by dedicated solar borehole irrigation.',
      farmAcreage: 100,
      cropIds: ['cocoa', 'plantain', 'oil-palm', 'moringa', 'cassava'],
      livestockIds: ['chicken', 'bee', 'snail'],
      infrastructure: {
        roads: true,
        farmhouse: true,
        cctv: true,
        water: true,
        solar: true,
        drying: true,
        fence: true,
      },
      baseFarmId: 'farm-1',
      farmShape: 'square',
      biome: 'rainforest',
      notes: 'Calibrated for 40,469 cocoa trees under oil palm shade with integrated honeybee apiary stands and free-range poultry.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sqlite-seed-edo-silvopasture',
      name: 'Edo 30-Acre Oil Palm & Silvopasture Ranch',
      description: 'Intensive 30-acre oil palm plantation intercropped with cassava and grazed by West African Dwarf goats and sheep.',
      farmAcreage: 30,
      cropIds: ['oil-palm', 'cassava', 'cowpea', 'plantain'],
      livestockIds: ['wad-goat', 'wad-sheep', 'chicken'],
      infrastructure: {
        roads: true,
        farmhouse: true,
        cctv: true,
        water: true,
        solar: true,
        drying: false,
        fence: true,
      },
      baseFarmId: 'farm-2',
      farmShape: 'square',
      biome: 'derived-savanna',
      notes: '1,735 oil palms at 9m triangular spacing supporting 146 goats and 2,185 foraging chickens.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO saved_farms (
      id, name, description, acreage, crop_ids, livestock_ids, infrastructure,
      base_farm_id, farm_shape, biome, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of seedFarms) {
    stmt.run(
      f.id,
      f.name,
      f.description || '',
      f.farmAcreage,
      JSON.stringify(f.cropIds),
      JSON.stringify(f.livestockIds),
      JSON.stringify(f.infrastructure),
      f.baseFarmId || null,
      f.farmShape || 'square',
      f.biome || 'rainforest',
      f.notes || '',
      f.createdAt || now,
      f.updatedAt || now
    );
  }
}

export function getAllSavedFarms(): FarmPayload[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM saved_farms ORDER BY created_at DESC').all() as unknown as DbSavedFarm[];
  return rows.map(formatRowToFarm);
}

export function getSavedFarmById(id: string): FarmPayload | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM saved_farms WHERE id = ?').get(id) as unknown as DbSavedFarm | undefined;
  if (!row) return null;
  return formatRowToFarm(row);
}

export function upsertSavedFarm(farm: FarmPayload): FarmPayload {
  const db = getDb();
  const now = new Date().toISOString();
  const createdAt = farm.createdAt || now;
  const updatedAt = now;

  const stmt = db.prepare(`
    INSERT INTO saved_farms (
      id, name, description, acreage, crop_ids, livestock_ids, infrastructure,
      base_farm_id, farm_shape, biome, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      acreage = excluded.acreage,
      crop_ids = excluded.crop_ids,
      livestock_ids = excluded.livestock_ids,
      infrastructure = excluded.infrastructure,
      base_farm_id = excluded.base_farm_id,
      farm_shape = excluded.farm_shape,
      biome = excluded.biome,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    farm.id,
    farm.name,
    farm.description || '',
    farm.farmAcreage,
    JSON.stringify(farm.cropIds || []),
    JSON.stringify(farm.livestockIds || []),
    JSON.stringify(farm.infrastructure || {}),
    farm.baseFarmId || null,
    farm.farmShape || 'square',
    farm.biome || 'rainforest',
    farm.notes || '',
    createdAt,
    updatedAt
  );

  return {
    ...farm,
    createdAt,
    updatedAt,
  };
}

export function deleteSavedFarm(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM saved_farms WHERE id = ?');
  const res = stmt.run(id);
  return Number(res.changes) > 0;
}

function formatRowToFarm(row: DbSavedFarm): FarmPayload {
  let cropIds: string[] = [];
  let livestockIds: string[] = [];
  let infrastructure: Record<string, boolean> = {};

  try {
    cropIds = JSON.parse(row.crop_ids);
  } catch {
    cropIds = [];
  }

  try {
    livestockIds = JSON.parse(row.livestock_ids);
  } catch {
    livestockIds = [];
  }

  try {
    infrastructure = JSON.parse(row.infrastructure);
  } catch {
    infrastructure = {};
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    farmAcreage: Number(row.acreage),
    cropIds,
    livestockIds,
    infrastructure,
    baseFarmId: row.base_farm_id,
    farmShape: row.farm_shape,
    biome: row.biome,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
