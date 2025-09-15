import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'react-native', replacement: 'react-native-web' },
      { find: /^react-native-vector-icons(\/.*)?$/, replacement: '/src/shims/vectorIcons.tsx' },
      { find: /^@expo\/vector-icons(\/.*)?$/, replacement: '/src/shims/vectorIcons.tsx' },
      { find: /^@react-native-community\/netinfo(\/.*)?$/, replacement: '/src/shims/netinfo.ts' },
      { find: /^react-native-safe-area-context(\/.*)?$/, replacement: '/src/shims/safearea.tsx' },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      external: [/^react-native-reanimated(\/.*)?$/],
      output: { manualChunks: undefined },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
