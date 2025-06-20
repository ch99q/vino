// deno-lint-ignore-file no-window
import { createElement } from 'react';

import { hydrateRoot } from 'react-dom/client';

import { HeadContext } from "./context.jsx";

export default function render(component) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root');

  if (root) {
    hydrateRoot(
      root,
      createElement(HeadContext.Provider, { value: { meta: metadata, head: [] } },
        createElement(component)
      )
    )
  }
}
