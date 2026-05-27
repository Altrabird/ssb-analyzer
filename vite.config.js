import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/ssb-analyzer/',
        name: 'SSB Analyzer · Laporan Semakan Buku Kerja',
        short_name: 'SSB Analyzer',
        description: 'Visualisasi laporan semakan buku kerja murid dari Google Drive.',
        theme_color: '#3b63ff',
        background_color: '#f8fafc',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        scope: command === 'build' ? '/ssb-analyzer/' : '/',
        start_url: command === 'build' ? '/ssb-analyzer/' : '/',
        lang: 'ms-MY',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,mjs}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB — fits pdf.worker (~1.4MB)
        navigateFallback: command === 'build' ? '/ssb-analyzer/index.html' : '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/google/, /accounts\.google\.com/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Never cache Google Drive/OAuth — auth tokens must stay fresh
            urlPattern: /^https:\/\/(?:apis|content)\.google(?:apis)?\.com\/.*|^https:\/\/accounts\.google\.com\/.*|^https:\/\/www\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false, // keep SW off in dev to avoid stale caches during iteration
      },
    }),
  ],
  base: command === 'build' ? '/ssb-analyzer/' : '/',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
}))
