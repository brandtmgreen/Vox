import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'suppress-hmr-ws-error',
        enforce: 'post',
        transform(code: string, id: string) {
          if (id.includes('client.mjs') || id.includes('vite/dist/client') || id.includes('bundledDevClient.mjs')) {
            return code
              .replace(/reject\(\/\* @__PURE__ \*\/ new Error\("WebSocket closed without opened\."\)\);/g, 'resolve();')
              .replace(/reject\(new Error\("WebSocket closed without opened\."\)\);/g, 'resolve();')
              .replace(/console\.error\(`\[vite\] failed to connect to websocket\.[^`]*`\);/g, '')
              .replace(/console\.error\(`\[vite\] failed to connect to websocket \(\$\{e\}\)\. `\);/g, '')
              .replace(/console\.error\(`\[vite\] failed to connect to websocket[^`]*`\);/g, '')
              .replace(/throw e;/g, 'return;');
          }
          return null;
        },
      },
      {
        name: 'html-error-suppressor',
        transformIndexHtml: {
          order: 'pre',
          handler() {
            return [
              {
                tag: 'script',
                children: `window.addEventListener('unhandledrejection',function(e){if(e&&e.reason&&(String(e.reason.message||e.reason).includes('WebSocket')||String(e.reason.message||e.reason).includes('vite'))){e.preventDefault();e.stopImmediatePropagation();}},true);window.addEventListener('error',function(e){if(e&&(String(e.message||'').includes('WebSocket')||String(e.filename||'').includes('client'))){e.preventDefault();e.stopImmediatePropagation();}},true);`,
                injectTo: 'head-prepend',
              },
            ];
          },
        },
      },
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'GreenTree ArborLink - Voice AI & CRM Operations',
          short_name: 'ArborLink',
          description: 'GreenTree Arboriculture AI voice receptionist, ANSI Z133 tree safety triage, and real-time CRM dispatcher powered by Arb-E.',
          theme_color: '#064e3b',
          background_color: '#064e3b',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['business', 'productivity', 'utilities'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Answer Call with Arb-E',
              short_name: 'Answer Call',
              description: 'Launch AI voice receptionist HUD',
              url: '/?action=livecall',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Operations Dispatch',
              short_name: 'Dispatch',
              description: 'View CRM job queue & triage',
              url: '/?tab=leads',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Hazard & ANSI Safety',
              short_name: 'Hazards',
              description: 'ANSI Z133 Electrical & Fall Hazard Alerts',
              url: '/?tab=hazards',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

