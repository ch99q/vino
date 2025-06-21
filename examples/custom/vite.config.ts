import { defineConfig } from 'vite';

import vino from "@ch99q/vino";
import hono from "@hono/vite-dev-server";

import inspect from "vite-plugin-inspect";

export default defineConfig(({ isSsrBuild }) => ({
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
    vino({
      base: "/assets/",
      entry: {
        client: "./jsx/entry-client.tsx",
        server: "./jsx/entry-server.tsx"
      }
    }),
    inspect()
  ],
  esbuild: {
    jsxInject: 'import { jsx } from "hono/jsx";',
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxImportSource: isSsrBuild ? 'hono/jsx' : 'hono/jsx/dom'
  },
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
      }
    },
    minify: false,
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
}));