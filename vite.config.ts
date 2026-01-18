import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante compatibilidade para o process.env usado no código
    'process.env': process.env
  }
});