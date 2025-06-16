import path from "node:path"

import type { Context, MiddlewareHandler } from "hono";
import { mimes } from "hono/utils/mime";

import bundle from "./virtual/bundle.ts"
import render from "./virtual/adapter.ts";

type Config = {
  base?: string;
}

export class Vino {
  constructor(public config: Config = { base: "/assets/" }) { }

  handler: MiddlewareHandler = async (c, next) => {
    const url = new URL(c.req.url);
    if (url.pathname.startsWith("/assets/")) {
      const assetPath = url.pathname.slice("/assets/".length);
      if (bundle.assets?.[assetPath]) {
        const ext = assetPath.split('.').pop() || '';
        const mimeType = mimes[ext] || "application/octet-stream";
        return c.body(bundle.assets[assetPath], 200, { "Content-Type": mimeType });
      }
    }
    await next();
  }

  render: (context: Context, component: any, metadata: Record<string, unknown>) => Response = (context, component, metadata = {}) => {
    const body = render(this.config.base ?? "/", component, metadata);
    const link = component?.entrypoint?.styles?.map((route: string) => `<${path.join(this.config.base ?? "", route)}>; rel="preload"; as="style"; fetchpriority="high"`).join(", ");
    return context.html(body, 200, { "Link": link ?? "" });
  }
}
