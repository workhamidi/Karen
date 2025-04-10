import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// تنظیمات هدرهای امنیتی برای همه محیط‌ها
const securityHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
}

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
      // تنظیمات هدرهای امنیتی برای سرویس ورکر
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      workbox: {
        // اضافه کردن هدرهای امنیتی به سرویس ورکر
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/accounts\.google\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-auth',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // یک روز
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              // تنظیمات CORS برای دسترسی به API گوگل
              fetchOptions: {
                mode: 'cors',
                credentials: 'include',
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    headers: securityHeaders, // استفاده از هدرهای امنیتی برای محیط توسعه
  },
  preview: {
    headers: securityHeaders, // استفاده از هدرهای امنیتی برای محیط پیش‌نمایش
  },
  build: {
    // تنظیمات بیلد برای محیط تولید
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          googleApi: ['gapi-script'],
        },
      },
    },
    // اطمینان از اینکه فایل‌های مربوط به احراز هویت گوگل به درستی بارگذاری می‌شوند
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },
})
