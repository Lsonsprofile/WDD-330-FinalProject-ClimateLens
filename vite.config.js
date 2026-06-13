import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',           // index.html lives in src/
  envDir: '..',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        clothing: resolve(__dirname, 'src/clothing/index.html'),
        hubs: resolve(__dirname, 'src/hubs/index.html'),
        settings: resolve(__dirname, 'src/settings/index.html'),
      },
    },
  },
});