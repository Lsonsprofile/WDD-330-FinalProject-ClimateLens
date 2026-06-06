import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',           // index.html lives in src/
  envDir: '..',          // .env lives in parent (project root)
  base: './',
  build: {
    outDir: '../dist',   // output goes up to project root
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
});