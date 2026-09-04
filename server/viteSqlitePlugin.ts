import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getAllSavedFarms, getSavedFarmById, upsertSavedFarm, deleteSavedFarm, DB_PATH, FarmPayload } from './db.ts';

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : ({} as T));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

function registerApiMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Only handle /api/ requests
    if (!url.startsWith('/api/')) {
      return next();
    }

    const method = req.method?.toUpperCase() || 'GET';
    const cleanUrl = url.split('?')[0];

    try {
      // GET /api/health
      if (cleanUrl === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'ok',
          engine: 'SQLite (node:sqlite)',
          dbPath: DB_PATH,
          timestamp: new Date().toISOString(),
        });
      }

      // GET /api/farms
      if (cleanUrl === '/api/farms' && method === 'GET') {
        const farms = getAllSavedFarms();
        return sendJson(res, 200, farms);
      }

      // POST /api/farms
      if (cleanUrl === '/api/farms' && method === 'POST') {
        const payload = await parseJsonBody<FarmPayload>(req);
        if (!payload || !payload.id || !payload.name) {
          return sendJson(res, 400, { error: 'Missing required farm id or name' });
        }
        const saved = upsertSavedFarm(payload);
        return sendJson(res, 201, saved);
      }

      // /api/farms/:id routes
      const matchFarmId = cleanUrl.match(/^\/api\/farms\/([a-zA-Z0-9_-]+)$/);
      if (matchFarmId) {
        const farmId = matchFarmId[1];

        // GET /api/farms/:id
        if (method === 'GET') {
          const farm = getSavedFarmById(farmId);
          if (!farm) {
            return sendJson(res, 404, { error: 'Farm not found' });
          }
          return sendJson(res, 200, farm);
        }

        // DELETE /api/farms/:id
        if (method === 'DELETE') {
          const deleted = deleteSavedFarm(farmId);
          return sendJson(res, 200, { success: deleted, id: farmId });
        }
      }

      // Route not found
      return sendJson(res, 404, { error: 'API endpoint not found' });
    } catch (err) {
      console.error('[SQLite API Error]', err);
      return sendJson(res, 500, { error: 'Internal database error', details: String(err) });
    }
  });
}

export function sqliteFarmStoragePlugin(): Plugin {
  return {
    name: 'atlas-sqlite-farm-storage',
    configureServer(server) {
      registerApiMiddleware(server);
    },
    configurePreviewServer(server) {
      registerApiMiddleware(server);
    },
  };
}
