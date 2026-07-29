import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths, so the same build works on GitHub Pages under any repo
  // name, inside a Tistory iframe, and when opened straight from disk.
  base: './',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
