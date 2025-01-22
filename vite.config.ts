import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@mysten/sui.js": "@mysten/sui.js/dist/cjs",
    },
  },


  optimizeDeps: {
    exclude: [
      'move-contracts', 
    ],
  },
});
