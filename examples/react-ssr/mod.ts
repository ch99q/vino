import { Hono } from 'hono';
import { mimes } from "hono/utils/mime";

import assets from "@ch99q/vino/assets";
import api from './api';

import { timing } from 'hono/timing'

const web = new Hono()
  .use("*", timing());

web.route('api', api);

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

import index from "./pages/index.tsx?client";
web.get('/', (c) => c.html(index({lol: true}, c)));

import about from "./pages/about.tsx?client";
web.get('/about', (c) => c.html(about({}, c)));

import notFound from "./pages/404.tsx?client";
web.get('*', (c) => c.html(notFound({}, c), 404));

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