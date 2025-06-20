import { vino as vinoBase, type Config } from "@ch99q/vino";

export const vino = (config: Omit<Config, "entry">) => vinoBase({
  ...config,
  entry: {
    server: import.meta.resolve("./entry-server.tsx"),
    client: import.meta.resolve("./entry-client.tsx"),
  },
});

export default vino;