import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  server: {
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
}); 