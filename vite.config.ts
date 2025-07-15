import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Explicitly disable native binary usage to prevent architecture-specific issues
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
    target: 'es2020',
    // Use the JavaScript version of Rollup instead of native binaries
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Force Vite to not use native binaries
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      target: 'es2020',
    },
  },
}));
