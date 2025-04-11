import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Flashcard App',
        short_name: 'Flashcard',
        description: 'A flashcard app for learning words',
        theme_color: '#F0F9F6',
        background_color: '#F0F9F6',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  // server: {
  //   port: 3000,
  //   open: true,
  // },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});