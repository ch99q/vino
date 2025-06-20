// deno-lint-ignore-file no-window
import { render as hydrate } from 'hono/jsx/dom'
import type { JSX } from 'hono/jsx/jsx-runtime';

import { HeadContext } from "./context.tsx";

declare global {
  interface Window {
    __PAGE_META__: Record<string, unknown>;
  }
}

export default function render(Component: () => JSX.Element) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root')!;

  hydrate(
    <HeadContext.Provider value={{ meta: metadata, head: [] }}>
      <Component />
    </HeadContext.Provider>,
    root
  )
}
