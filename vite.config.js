import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Şimdi "@/..." importları çalışır
    },
  },
  optimizeDeps: {
    include: ['@stellar/stellar-sdk'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
