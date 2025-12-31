import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    // Stringify the env vars, defaulting to empty string if undefined to avoid build-time crashes or 'undefined' string literals
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ""),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ""),
  }
});