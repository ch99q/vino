/// <reference types="./mod.d.ts" />

// @ts-check
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

import assets from "@ch99q/vino/assets";
export { assets };

// This prefix is used to identify client-side modules during development.
const URL_PREFIX = '/@client';

// This is the ID of the virtual module for assets.
const ASSETS_ID = "@ch99q/vino/assets";

/**
 * A Vite plugin for building and serving full-stack applications.
 * @param {import('./mod.d.ts').Config} config The plugin configuration.
 * @returns {import('vite').Plugin} The Vite plugin.
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
  /** @type {import('vite').ResolvedConfig} */
  let resolvedConfig;

  // This map stores the client-side entry points for the build.
  /** @type {Map<string, string>} */
  const entries = new Map();

  return {
    name: 'vite-plugin-vino',
    enforce: 'pre',

    sharedDuringBuild: true,

    /**
     * This hook is used to configure the plugin based on the command being run.
     * @param {import('vite').UserConfig} userConfig The user's Vite configuration.
     * @param {import('vite').ConfigEnv} env The environment details.
     */
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

          // We build the SSR environment first.
          await builder.build(builder.environments.ssr);
        }
      } else {
        // @ts-ignore: globalThis is not typed
        (globalThis).__VINO__ = true;
      }
    },

    /**
     * This hook is called after the Vite configuration has been resolved.
     * @param {import('vite').ResolvedConfig} resolved The resolved Vite configuration.
     */
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

    /**
     * This hook is used to resolve module IDs.
     * @param {string} id The module ID to resolve.
     * @param {string | undefined} importer The importer module.
     * @this {import('vite').Rollup.PluginContext}
     */
    resolveId(id, importer) {
      if (resolvedConfig.command === 'serve') {
        // In development, we handle client-side modules with a `?client` suffix.
        if (id.endsWith('?client')) return resolve(importer || '', "..", id);
        if (id.startsWith(URL_PREFIX)) {
          if (id.endsWith('.css?direct')) return id.slice(URL_PREFIX.length);
          return id;
        }
        // We also handle imports from client-side modules.
        // @ts-ignore: this.environment is not typed
        if (this.environment.name === 'client' && importer?.startsWith(URL_PREFIX) && !id.startsWith(URL_PREFIX) && (id.startsWith("/") || id.startsWith("."))) {
          return URL_PREFIX + resolve(resolvedConfig.root, importer.slice(URL_PREFIX.length), "..", id);
        }
      } else {
        // In build mode, we also handle client-side modules.
        if (id.endsWith('?client')) {
          const absPath = resolve(importer || '', "..", id);
          entries.set(absPath, "");
          return absPath;
        }
        // We also handle a virtual module for assets.
        if (id === ASSETS_ID) return "\0virtual:vino-assets";
      }
    },

    /**
     * This hook is used for handling hot module replacement updates.
     * @param {{ file: string; server: import('vite').ViteDevServer }} context The HMR context.
     */
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

    /**
     * This hook is used to load module content.
     * @param {string} id The module ID.
     * @this {import('vite').Rollup.PluginContext}
     */
    async load(id) {
      if (id.endsWith('?client')) {
        const isServe = resolvedConfig.command === 'serve';

        if (isServe && id.startsWith(URL_PREFIX)) {
          id = id.slice(URL_PREFIX.length);
        }

        const absPath = id.slice(0, -'?client'.length);

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

      if (resolvedConfig.command === 'serve') {
        // In development, we load client-side modules from the file system.
        if (id.startsWith(URL_PREFIX)) {
          const url = new URL("file://" + id.slice(URL_PREFIX.length));
          if (!url.pathname.split("/").pop()?.includes(".")) url.pathname += ".js";
          return await readFile(url.pathname, 'utf-8')
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
          /** @type {import('vite').Rollup.RollupOutput} */
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

    /**
     * This hook is used to transform module code.
     * @param {string} code The module code.
     * @this {import('vite').Rollup.PluginContext}
     * @returns {import('vite').Rollup.TransformResult} The transformed code.
     */
    transform(code) {
      // @ts-ignore: this.environment is not typed
      if (resolvedConfig.command === 'serve' && this.environment.name === 'client') {
        // In development, we remove CSS imports from client-side modules to avoid issues with HMR.
        const cssImportRegex = /import\s+['"]([^'"]+\.css)['"]/g;
        return code.replace(cssImportRegex, "");
      }
    },

    /**
     * This hook is called when the bundle is being generated.
     * @param {import('vite').Rollup.OutputOptions} _options
     * @param {import('vite').Rollup.OutputBundle} bundle The bundle being generated.
     */
    generateBundle(_options, bundle) {
      if (resolvedConfig.command !== 'build') return;

      /**
       * @param {string} source
       */
      const replace = (source) => {
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