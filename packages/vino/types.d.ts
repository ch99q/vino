import type { Plugin } from "vite";

/**
 * The configuration for the Vino plugin.
 */
export interface Config {
  /**
   * The base path for the client-side assets.
   * @default "/"
   */
  base?: string;
  /**
   * The entry points for the client and server.
   */
  entry: {
    /**
     * The path to the server-side entry point.
     */
    server: string;
    /**
     * The path to the client-side entry point.
     */
    client: string;
  }
}

declare module "*?client" {
  const content: (...args: unknown[]) => string;
  export default content;
}

/**
 * A Vite plugin for building and serving full-stack applications.
 * @param config The plugin configuration.
 * @returns The Vite plugin.
 */
export function vino(config: Config): Plugin;
export default vino;