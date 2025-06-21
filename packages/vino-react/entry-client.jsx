// deno-lint-ignore-file no-window
import { hydrateRoot } from 'react-dom/client';

import { HeadContext } from "./context.mjs";

export default function render(Component) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root');

  if (root) {
    hydrateRoot(
      root,
      <HeadContext.Provider value={{ meta: metadata, head: [] }}>
        <Component />
      </HeadContext.Provider>
    )
  }
}
