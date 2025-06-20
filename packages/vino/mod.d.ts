import type { Plugin } from "vite";
import type { Assets } from "./assets.d.ts";

declare const assets: Assets;
export { assets };

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
  };
}

/**
 * A Vite plugin for building and serving full-stack applications.
 * @param config The plugin configuration.
 * @returns The Vite plugin.
 */
export function vino(config: Config): Plugin;

export default vino; 