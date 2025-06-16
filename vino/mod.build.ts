import { resolve } from "node:path";
import { type ResolvedConfig, type Rollup, build, loadConfigFromFile } from "vite";

import type { Bundle } from "./types.d.ts";

export function createBuilder(rootConfig: ResolvedConfig, adapter: string) {
  const entries = new Set<string>();

  let cache: [Bundle, Set<string>] | undefined;

  return {
    addEntry(entry: string) {
      entries.add(entry);
    },

    isEntry(entry: string) {
      return entries.has(entry);
    },

    invalidate() {
      (cache as unknown) = undefined;
    },

    async build(refs: string[]): Promise<[Bundle, Set<string>]> {
      if (cache) return cache;
      if (entries.size === 0) return [undefined, new Set()];
      globalThis.__VINO_BUNDLE__ = true;

      const config = (await loadConfigFromFile({
        command: 'build',
        mode: rootConfig.mode,
      }, rootConfig.configFile, rootConfig.root, "silent", undefined, "bundle"))?.config!;

      const watchers: Set<string> = new Set();

      config.plugins ??= [];
      config.plugins.push({
        name: 'vino:entry',
        enforce: 'pre',
        resolveId(id, importer) {
          if (id.endsWith('?client')) return id;
          if (id.startsWith("./") || id.startsWith("/")) {
            const absPath = resolve(importer ?? "", "..", id);
            watchers.add(absPath);
          }
        },
        load: (id) => {
          if (this.isEntry(id)) {
            const absPath = id.slice(0, -'?client'.length);
            return `import { default as module } from "${absPath}"; import { client as render } from "${adapter}"; (async () => { await render(module, globalThis.__PAGE_CONTEXT__); })();`;
          }
        }
      });

      config.build = {
        ssr: false,
        rollupOptions: {
          input: Array.from(entries),
          output: {
            entryFileNames: `[name]-[hash].mjs`,
            chunkFileNames: `[name]-[hash].mjs`,
            assetFileNames: `[name]-[hash][extname]`,
            compact: true,
          },
          treeshake: "smallest"
        },
        minify: rootConfig.mode === 'production',
        sourcemap: rootConfig.mode !== 'production' ? 'inline' : false,
        cssCodeSplit: true,
        write: false,
      }

      config.mode = rootConfig.mode;

      config.define ??= {};
      config.define['process.env.NODE_ENV'] = JSON.stringify(rootConfig.mode);

      const output = ((await build(config)) as Rollup.RollupOutput[])[0].output;

      console.log("%c", "color: reset")

      const entrypoints: Record<string, {
        fileName: string; styles: string[]; assets: string[]
      }> = {};
      const assets: Record<string, string | Uint8Array> = {};
      for (const chunk of output) {
        assets[chunk.fileName] = chunk.type === 'asset' ? chunk.source : chunk.code;
        if (chunk.type === 'chunk' && chunk.fileName && this.isEntry(chunk.facadeModuleId!)) {
          const styles: Set<string> = new Set(chunk.viteMetadata?.importedCss || []);
          const assets: Set<string> = new Set(chunk.viteMetadata?.importedAssets || []);

          for (const imported of output.filter(i => chunk.imports.includes(i.fileName))) {
            if (imported.type === 'chunk') {
              if (imported.viteMetadata?.importedCss) {
                imported.viteMetadata.importedCss.forEach(style => styles.add(style));
              }
              if (imported.viteMetadata?.importedAssets) {
                imported.viteMetadata.importedAssets.forEach(asset => assets.add(asset));
              }
            }
          }

          const absPath = chunk.facadeModuleId!.slice(0, -'?client'.length);
          refs.push(absPath);

          entrypoints[refs.indexOf(absPath)] = {
            fileName: chunk.fileName,
            styles: Array.from(styles).reverse(),
            assets: Array.from(assets)
          };
        }
      }

      globalThis.__VINO_BUNDLE__ = false;

      cache = {
        entrypoints,
        assets,
        watchers
      } as Bundle;

      return [cache, watchers];
    }
  }
}

export type Builder = ReturnType<typeof createBuilder>;