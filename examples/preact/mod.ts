import { Hono } from 'hono';
import { mimes } from "hono/utils/mime";

// Important ?client suffix to ensure the client-side code is loaded correctly.
import app from "./app.tsx?client";

import assets from "@ch99q/vino/assets";

const web = new Hono();

web.use("*", async (c, next) => {
  await next();
  if (import.meta.env.DEV) {
    // Disable caching during development
    c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    c.header("Pragma", "no-cache");
    c.header("Expires", "0");
  } else {
    // Enable caching in production
    c.header("Cache-Control", "public, max-age=31536000, immutable");
  }
});

// @ts-ignore:
web.get('/', (c) => c.html(app({}, c)));

web.use('/assets/*', async (c, next) => {
  const url = new URL(c.req.url);
  if (url.pathname.startsWith("/assets/")) {
    const assetPath = url.pathname.slice("/assets/".length);
    if (assets?.[assetPath]) {
      const ext = assetPath.split('.').pop() || '';
      const mimeType = mimes[ext] || "application/octet-stream";
      return c.body(assets[assetPath], 200, { "Content-Type": mimeType });
    }
  }
  await next();
});

export default web;