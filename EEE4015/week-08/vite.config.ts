import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (id.includes('/node_modules/lucide-react/')) return 'icons';
          if (/\/node_modules\/motion(?:\/|-)/.test(id)) return 'motion';
          if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
        },
      },
    },
  },
});
