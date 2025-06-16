import { Hono } from 'hono';
import { Vino } from "@ch99q/vino/hono";

// Important ?client suffix to ensure the client-side code is loaded correctly.
import app from "./app.tsx?client";

const vino = new Vino({
  base: "/assets/",
})

const web = new Hono()
  .use(vino.handler);

web.get('/', (c) => vino.render(c, app, {}));

export default web;