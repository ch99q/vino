import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import vino from "@ch99q/vino-island";

import hono from "@hono/vite-dev-server";
import inspect from "vite-plugin-inspect";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    hono({
      entry: "./mod.ts",
      // Allow serving static files from hono.
      exclude: [
        /^\/@.+$/,
        /\?t\=\d+$/,
        /^\/node_modules\/.*/,
        /^\/\_\_inspect\/.*/,
        /^\/\.well-known\//,
        /^\/\.vite\//
      ],
    }),
    react(),
    vino({
      base: "/assets/",
      island: true,
      entry: {
        client: "./jsx/entry-client.tsx",
        server: "./jsx/entry-server.tsx"
      }
    }),
    tailwindcss(),
    inspect()
  ],
  build: {
    rollupOptions: {
      input: "./mod.ts",
      output: {
        entryFileNames: `[name].mjs`,
        compact: true,
        manualChunks(id) {
          if (id.includes('node_modules'))
            return "vendor";
        }
      },
      treeshake: "smallest"
    },
    target: "esnext",
    copyPublicDir: false,
    ssr: true,
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            entryFileNames: `[name]-[hash].mjs`,
            chunkFileNames: `[name]-[hash].mjs`,
            assetFileNames: `[name]-[hash].[ext]`,
          }
        },
        ssr: false,
      }
    }
  }
});