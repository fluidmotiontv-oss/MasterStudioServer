import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        infinityFlow: resolve(__dirname, 'infinity-flow/index.html'),
        store: resolve(__dirname, 'infinity-flow/store.html'),
        mediaFactory: resolve(__dirname, 'media-factory/index.html'),
        smartAsset: resolve(__dirname, 'smart-asset/index.html')
      }
    },
    chunkSizeWarningLimit: 700
  }
});
