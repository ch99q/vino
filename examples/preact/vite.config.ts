import { defineConfig } from 'vite';

import preact from '@preact/preset-vite';
import vino from "@ch99q/vino-preact";

import deno from "@deno/vite-plugin";
import hono from "@hono/vite-dev-server";

import inspect from "vite-plugin-inspect";

export default defineConfig({
  resolve: {
    alias: {
      // We only do this in the example, because of the workspace setup.
      // Don't do this in your own projects.
      "@ch99q/vino-preact/context": "../../packages/vino-preact/context.jsx"
    }
  },
  plugins: [
    deno(),
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
    preact(),
    vino({
      base: "/assets/",
    }),
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
    target: "deno" + Deno.version.deno,
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