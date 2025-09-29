import { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { Document } from './document';
import { Context } from "./context";

declare global {
  interface Window {
    __PAGE_DATA__: Record<string, any>;
  }
}

export default function render(Component: ComponentType<any>) {
  const data: Record<string, any> = window.__PAGE_DATA__ || {};
  const root = document.getElementById('root')!;

  if (root) {
    hydrateRoot(
      root,
      <Context.Provider value={data as any}>
        <Document>
          <Component />
        </Document>
      </Context.Provider>
    )
  }
}