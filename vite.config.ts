import path from 'path';
// FIX: Explicitly import `process` to ensure correct type definitions for `process.cwd()`, resolving the TypeScript error.
import process from 'process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: `__dirname` is not defined in ES module scope. 
          // `process.cwd()` will resolve to the project root where vite is run.
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});