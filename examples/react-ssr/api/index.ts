import { Hono } from "hono";
import { hc } from 'hono/client'

const app = new Hono()
  .get("/random", async (c) => {
    // Simulate slow response.
    // await new Promise((resolve) => setTimeout(resolve, 500));

    await api.random2.$get();

    return c.json({ number: Math.round(Math.random() * 100) });
  })
  .get("/random2", async (c) => {
    // Simulate slow response.
    // await new Promise((resolve) => setTimeout(resolve, 250));
    return c.json({ test: "ok" });
  });

export type ApiType = typeof app;
export default app;

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

import { endTime, startTime } from "hono/timing";

// Request wrapper to measure timing of API calls during SSR. (Development only)
const requestWithTiming = (async (input: RequestInfo, init?: RequestInit) => {
  const c = globalThis.context;
  const id = Math.random().toString(16).slice(2, 10);
  const description = `${init?.method || "GET"} ${input.toString()}`;
  startTime(c, id, description);
  const res = await app.request(input, init);
  endTime(c, id);
  return res;
}) as typeof fetch;

export const api = import.meta.env.SSR ? hc<ApiType>('', { fetch: import.meta.env.PROD ? app.request : requestWithTiming }) : hc<ApiType>('/api');