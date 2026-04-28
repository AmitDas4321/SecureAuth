import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'mask-icon.svg'
        ],
        manifest: {
          name: `${env.APP_NAME || 'SecureAuth'}`,
          short_name: env.APP_NAME || 'SecureAuth',
          description: 'Secure web-based TOTP authenticator',
          theme_color: '#141414',
          background_color: '#E4E3E0',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/dashboard',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],

    define: {
      'process.env.APP_NAME': JSON.stringify(env.APP_NAME || 'SecureAuth'),
      'process.env.APP_URL': JSON.stringify(env.APP_URL || 'https://example.com')
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true'
    }
  };
});