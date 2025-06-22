/* @ts-self-types="./index.d.ts" */
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

// This prefix is used to identify client-side modules during development.
const URL_PREFIX = '/@client';
const CURRENT_FILE = new URL(import.meta.url).pathname;
const ASSETS_FILE = resolve(CURRENT_FILE, "..", "assets.mjs");

/**
 * A Vite plugin for building and serving full-stack applications.
 * @implements {import('./index.d.ts').vino}
 */
export function vino(config) {
  // In development, we prevent the plugin from being loaded multiple times.
  // @ts-ignore: globalThis is not typed
  if (globalThis.__VINO__) return { name: 'vite-plugin-vino' };

  /** @type {any} */
  let builder;
  /** @type {any} */
  let client;
  /** @type {any} */
  let ssr;
  /** @type {any} */
  let resolvedConfig;
  /** @type {any} */
  let resolver;

  // This map stores the client-side entry points for the build.
  /** @type {Map<string, string>} */
  const entries = new Map();

  return {
    name: 'vite-plugin-vino',
    enforce: 'pre',

    sharedDuringBuild: true,

    config(userConfig, { command }) {
      if (command === 'build') {
        // In build mode, we configure a custom builder to handle the SSR and client builds.
        userConfig.builder = userConfig.builder || {};
        userConfig.builder.buildApp = async function (viteInstance) {
          builder = viteInstance;

          ssr = viteInstance.environments.ssr;
          client = viteInstance.environments.client;
          // We need to ensure that both the client and SSR environments are configured correctly.
          if (!ssr || !client) throw new Error("Failed to create build environments for client or ssr. Make sure the environments are properly configured and run the build with ssr enabled.");
          if (client.config.build.ssr === true) throw new Error("Client build environment should not have SSR enabled. Please check your configuration.");
          if (client.config.build.lib !== false) throw new Error("Client build environment should not have library mode enabled. Please check your configuration.");

          resolver = viteInstance.config.createResolver();

          // We build the SSR environment first.
          await builder.build(builder.environments.ssr);
        }
      } else {
        // @ts-ignore: globalThis is not typed
        (globalThis).__VINO__ = true;
      }
    },

    configResolved(resolved) {
      resolvedConfig = resolved;

      // We resolve the entry points to absolute paths.
      if (config.entry.client && !config.entry.client.startsWith('/')) {
        if (config.entry.client.startsWith('file://')) {
          config.entry.client = config.entry.client.slice('file://'.length);
        } else {
          config.entry.client = resolve(resolvedConfig.root, config.entry.client);
        }
      }
      if (config.entry.server && !config.entry.server.startsWith('/')) {
        if (config.entry.server.startsWith('file://')) {
          config.entry.server = config.entry.server.slice('file://'.length);
        } else {
          config.entry.server = resolve(resolvedConfig.root, config.entry.server);
        }
      }
    },

    async resolveId(id, importer) {
      if (resolvedConfig.command === 'serve') {
        const realImporter = importer?.startsWith(URL_PREFIX) ? importer.slice(URL_PREFIX.length) : importer;
        if (id.startsWith(URL_PREFIX)) {
          const resolved = await this.resolve(id.slice(URL_PREFIX.length), realImporter, { skipSelf: true });
          if (resolved) return URL_PREFIX + resolved.id;
        }
        if (id.endsWith('?url')) {
          const resolved = await this.resolve(id.slice(0, -'?url'.length), realImporter, { skipSelf: true });
          if (resolved) return URL_PREFIX + resolved.id + '?url';
        }
        if (this.environment.name === 'client' && importer?.startsWith(URL_PREFIX) && (id.startsWith("/") || id.startsWith("."))) {
          const resolved = await this.resolve(id, importer.slice(URL_PREFIX.length), { skipSelf: true });
          if (resolved) return URL_PREFIX + resolved.id;
        }
      } else {
        // In build mode, we also handle client-side modules.
        if (id.endsWith('?client')) {
          const absPath = resolve(importer || '', "..", id);
          entries.set(absPath, "");
          return absPath;
        }
        if (config.island && id.endsWith('?island')) {
          const absPath = resolve(importer || '', "..", id);
          entries.set(absPath, "");
          return absPath;
        }
        // We also handle a virtual module for assets.
        if (await resolver(id, importer) === ASSETS_FILE) return "\0virtual:vino-assets";
      }
    },

    hotUpdate({ file, server }) {
      // @ts-ignore: this.environment is not typed
      if (resolvedConfig.command !== 'serve' || this.environment.name !== 'client') return;
      // In development, we reload client-side modules when they are updated.
      const modules = server.moduleGraph.getModulesByFile(URL_PREFIX + file);
      if (modules) {
        for (const mod of modules) {
          server.reloadModule(mod);
        }
      }
    },

    async load(id) {
      if (id.endsWith('?client') || (config.island && id.endsWith('?island'))) {
        const isServe = resolvedConfig.command === 'serve';

        if (isServe && id.startsWith(URL_PREFIX)) {
          id = id.slice(URL_PREFIX.length);
        }

        const absPath = id.slice(0, -'?client'.length);

        if (id.endsWith('?client')) {
          // @ts-ignore: this.environment is not typed
          if (this.environment.name === 'client') {
            const modulePath = isServe ? `${URL_PREFIX}${absPath}` : absPath;
            const renderPath = isServe ? `${URL_PREFIX}${config.entry.client}` : config.entry.client;
            return `import module from '${modulePath}'; import render from '${renderPath}'; (async function() { return render(module); })();`;
          } else {
            const script = (isServe ? URL_PREFIX : (config.base ?? "")) + absPath + '?client';
            return `import module from '${absPath}'; import render from '${config.entry.server}'; export default function(...args) { return render.apply(null, [{ client: ${JSON.stringify(script)} }, module].concat(args)); }`;
          }
        }
        if (config.island) {
          if (this.environment.name === 'client') {
            const renderPath = isServe ? `${URL_PREFIX}${config.entry.client}` : config.entry.client;
            const script = (isServe ? URL_PREFIX : (config.base ?? "")) + absPath + '?island';
            return `export * from "${absPath}"; import { default as module } from "${absPath}"; export default module; import { island } from '${renderPath}'; (async () => { await island(${JSON.stringify(script)}, module); })();`;
          } else {
            const script = (isServe ? URL_PREFIX : (config.base ?? "")) + absPath + '?island';
            return `import module from '${absPath}'; import { island } from '${config.entry.server}'; export default function(...args) { return island("${script}", module, ...args); }`;
          }
        }
      }

      if (resolvedConfig.command === 'serve') {
        if (id.startsWith(URL_PREFIX)) {
          const resolved = await this.resolve(id.slice(URL_PREFIX.length), undefined, { skipSelf: true });
          if (!resolved) return;
          if (id.endsWith("?url")) return `import "${resolved.id.slice(0, -'?url'.length)}"; export default ${JSON.stringify(resolved.id.slice(0, -'?url'.length) + '?direct')}`;
          if (!existsSync(resolved.id)) return await this.environment.fetchModule(resolved.id);
          return await readFile(resolved.id, 'utf-8');
        }
      } else {
        // In build mode, we handle a virtual module for assets.
        if (id === "\0virtual:vino-assets") {
          // @ts-ignore: this.environment is not typed
          if (this.environment.name !== 'ssr') return;

          if (entries.size === 0) {
            return;
          }

          // We build the client with specific options to get the assets.
          client.config.build.lib = false;
          client.config.build.ssr = false;
          client.config.build.write = false;
          client.config.build.assetsDir = '';
          client.config.build.assetsInlineLimit = 0;
          client.config.build.rollupOptions.input = Array.from(entries.keys());

          /** @type {Map<string, string | Uint8Array>} */
          const mapping = new Map();

          // We build the client and create a mapping of the assets.
          /** @type {any} */
          const client_bundle = await builder.build(client);
          for (const chunk of client_bundle.output) {
            if (chunk.type === 'chunk') {
              mapping.set(chunk.fileName, chunk.code);
              if (chunk.isEntry && chunk.facadeModuleId) {
                entries.set(chunk.facadeModuleId, chunk.fileName);
              }
            }
            else mapping.set(chunk.fileName, chunk.source);
          }

          // We return the assets as a JSON object.
          return `export default ${JSON.stringify(Object.fromEntries(mapping))};`;
        }
      }
    },

    generateBundle(_options, bundle) {
      if (resolvedConfig.command !== 'build') return;

      const replace = (/** @type {string} */ source) => {
        // Replace all entry points with the corresponding filename in the mapping.
        for (const [key, value] of entries) {
          source = source.replaceAll(key, value);
        }
        return source;
      }

      for (const entry in bundle) {
        const chunk = bundle[entry];
        if (chunk.type === 'chunk') chunk.code = replace(chunk.code);
        else if (typeof chunk.source === 'string') chunk.source = replace(chunk.source);
      }
    }
  };
}

export default vino; 