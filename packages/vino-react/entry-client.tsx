// deno-lint-ignore-file no-window
import { createElement } from 'react';
import type { ComponentType } from 'react';

import { hydrateRoot } from 'react-dom/client';

import { HeadContext } from "./context.tsx";

declare global {
  interface Window {
    __PAGE_META__: Record<string, unknown>;
  }
}

export default function render(component: ComponentType<Record<string, unknown>>) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root')!;

  hydrateRoot(
    root,
    createElement(HeadContext.Provider, { value: { meta: metadata, head: [] } },
      createElement(component)
    )
  )
}
