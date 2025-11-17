import path from 'path';
// FIX: Explicitly import `process` to ensure correct type definitions for `process.cwd()`, resolving the TypeScript error.
import process from 'process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
    const env = loadEnv(mode, process.cwd(), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Mapeia as variáveis de ambiente para que possam ser acessadas no código do app
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
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
