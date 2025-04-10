import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Goals PWA App',
        short_name: 'GoalsApp',
        description: 'My Awesome Goal Tracking PWA',
        theme_color: '#1F2C3A',
        background_color: '#1C2833',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    headers: {
      // Keep COOP for Google Sign-In popup functionality
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      // Change COEP to allow loading resources without CORP headers
      'Cross-Origin-Embedder-Policy': 'unsafe-none', // <<<<< CHANGE HERE
    }
  },
  preview: {
     headers: {
       'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
       'Cross-Origin-Embedder-Policy': 'unsafe-none', // <<<<< CHANGE HERE TOO
     }
  }
})