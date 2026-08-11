import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

import { sdmHmrPlugin } from './src/.sdm/sdmHmrPlugin';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

const DEV_BANNER_SCRIPT = '/@replit/vite-plugin-dev-banner/banner-script.js';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    sdmHmrPlugin(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          {
            name: 'replit-dev-banner-base-path',
            enforce: 'pre' as const,
            configureServer(server) {
              server.middlewares.use((req, _res, next) => {
                const prefixedScript = `${basePath}${DEV_BANNER_SCRIPT.slice(1)}`;
                if (req.url === prefixedScript) {
                  req.url = DEV_BANNER_SCRIPT;
                }
                next();
              });
            },
            transformIndexHtml: {
              order: 'post' as const,
              handler(html: string) {
                return html.replace(
                  `src="${DEV_BANNER_SCRIPT}"`,
                  `src="${basePath}${DEV_BANNER_SCRIPT.slice(1)}"`,
                );
              },
            },
          },
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
