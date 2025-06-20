import type { Plugin } from "vite";
import type { Config } from "@ch99q/vino";

export declare const vino: (config: Omit<Config, "entry">) => Plugin;

export default vino; 