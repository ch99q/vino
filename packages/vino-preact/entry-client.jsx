// deno-lint-ignore-file no-window
import { h, hydrate } from 'preact';
import { HeadContext } from "./context.jsx";

export default function render(component) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root');

  hydrate(
    h(HeadContext.Provider, { value: { meta: metadata, head: [] } },
      h(component, {})
    ),
    root
  )
}
