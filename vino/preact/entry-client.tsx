import { hydrate } from 'preact';
import { type Context, ContextProvider } from "./context.tsx";
import type { ComponentType } from 'preact';

export function render(Component: ComponentType, context: Context) {
  const root = globalThis.document.documentElement;
  // WIP: Apprently, Preact does not support SSR hydration with document.documentElement.
  hydrate(
    <ContextProvider.Provider value={context}>
      <Component />
    </ContextProvider.Provider>,
    root
  );
}