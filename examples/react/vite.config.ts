import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import vino from "@ch99q/vino";

import deno from "@deno/vite-plugin";
import hono from "@hono/vite-dev-server";

export default defineConfig({
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
        /^\/\.well-known\//
      ],
    }),
    react(),
    vino({
      adapter: import.meta.resolve("@ch99q/vino-react"),
    })
  ],
  build: {
    lib: {
      entry: "./mod.ts",
      formats: ['es'],
      fileName: 'mod',
    },
    ssr: true,
    cssCodeSplit: true, // Prevents CSS from being bundled with the server code.
    target: "deno" + Deno.version.deno,
  },
});