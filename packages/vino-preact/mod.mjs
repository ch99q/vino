/* @ts-self-types="./mod.d.ts" */
import { vino as vinoBase } from "@ch99q/vino";

export const vino = (config) => vinoBase({
  ...config,
  entry: {
    server: import.meta.resolve("./entry-server.jsx"),
    client: import.meta.resolve("./entry-client.jsx"),
  },
});

export default vino; 