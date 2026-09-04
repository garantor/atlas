import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { sqliteFarmStoragePlugin } from './server/viteSqlitePlugin.ts';

export default defineConfig({
  plugins: [
    react(),
    sqliteFarmStoragePlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
