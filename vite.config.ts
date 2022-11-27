import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Enable "Absolute Imports"
    // https://github.com/aleclarson/vite-tsconfig-paths
    tsconfigPaths(),
  ],
});
