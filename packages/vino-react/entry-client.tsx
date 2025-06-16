import { hydrateRoot } from 'react-dom/client';
import { type Context, ContextProvider } from "./context.tsx";

export function render(Component: React.ComponentType, context: Context) {
  const root = globalThis.document.documentElement;
  hydrateRoot(root, <ContextProvider.Provider value={context}>
    <Component />
  </ContextProvider.Provider >);
}