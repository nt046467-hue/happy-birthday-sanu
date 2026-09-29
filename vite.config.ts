import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt'],
      manifest: {
        name: 'Happy Birthday Karu 💖',
        short_name: 'Karu 💖',
        description: 'A magical birthday celebration crafted with all my love, just for you, Karu.',
        theme_color: '#0d0010',
        background_color: '#0d0010',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2,ogg,mp3}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
