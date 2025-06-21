import { hydrate, type ComponentType } from 'preact';
import { HeadContext } from "./context";

declare global {
  interface Window {
    __PAGE_META__: Record<string, unknown>;
  }
}

export default function render(Component: ComponentType<any>) {
  const metadata = window.__PAGE_META__ || {};
  const root = document.getElementById('root')!;

  hydrate(
    <HeadContext.Provider value={{ meta: metadata, head: [] }}>
      <Component />
    </HeadContext.Provider>,
    root
  )
}
