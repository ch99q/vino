import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

import { type Builder, createBuilder } from "./mod.build.ts";

declare global {
  var __VINO_BUNDLE__: boolean;
}

interface Config {
  adapter: string;
}

export default function vino(config: Config): Plugin {
  if (globalThis.__VINO_BUNDLE__) {
    return {
      name: "vino:ignore",
      enforce: 'pre'
    }
  }

  let resolvedConfig: ResolvedConfig;
  let builder: Builder;

  const refs: string[] = [];
  let watchers: Set<string> = new Set();

  return {
    name: "vite-plugin-vino",
    enforce: 'pre',

    configResolved(conf) {
      resolvedConfig = conf;
      builder = createBuilder(resolvedConfig, new URL(config.adapter).pathname);
    },

    hotUpdate({ file }) {
      if (watchers.has(file)) {
        builder.invalidate();
        this.environment.moduleGraph.urlToModuleMap.values().filter(m =>
          m.url == file ||
          m.url == "file:bundle"
        ).forEach(m => {
          this.environment.reloadModule(m);
          for (const entry of m.importers) {
            this.environment.reloadModule(entry);
          }
        });
      }
    },

    handleHotUpdate({ file, server }) {
      if (watchers.has(file)) {
        server.hot.send({ type: 'full-reload' })
      }
    },

    resolveId(id, importer) {
      if (id === "file:bundle") return id;
      if (id === "file:adapter") return id;
      if (id.endsWith('?client')) {
        id = path.resolve(importer ?? "", "..", id);
        refs.push(id.slice(0, -'?client'.length));
        builder.addEntry(id);
        return id;
      }
    },

    async load(id) {
      if (id === "file:adapter") { return `export { default } from "${config.adapter}";` }
      if (id === "file:bundle") {
        const [assets, watchdog] = await builder.build(refs);
        watchers = watchdog;
        return `export default ${JSON.stringify(assets)};`
      }
      if (id.endsWith('?client')) {
        const absPath = id.slice(0, -'?client'.length);
        if(!refs.includes(absPath)) throw new Error(`Entry point "${absPath}" not found. Make sure to import it in your code.`);
        return `import { default as module } from "${absPath}"; import bundle from "file:bundle"; export default { module, entrypoint: bundle.entrypoints[${refs.indexOf(absPath)}] };`;
      }
      return null;
    }
  }
}