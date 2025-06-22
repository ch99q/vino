import { renderToString } from 'react-dom/server.edge';
import { ComponentType, createElement } from 'react';
import type { JSX } from 'react';

import { Document } from './document';
import { MetaContext } from './context';

export function island(path: string, module: () => JSX.Element, props: Record<string, any>) {
  return createElement("island", { "data-island": path, "data-island-props": JSON.stringify(props) }, createElement(module, props));
}

export default function render({ client }: { client: string }, Component: ComponentType<any>, metadata: Record<string, unknown>) {
  const helmet: React.ReactNode[] = [];

  // Render the React component to a string.
  const document = renderToString(
    <MetaContext.Provider value={{ head: helmet, meta: metadata }}>
      <Document client={client}>
        <Component />
      </Document>
    </MetaContext.Provider>
  );

  // Extract the head content from the helmet.
  const head = renderToString(helmet.flat().reverse());

  // Create the full HTML document by inserting the head into the document.
  const html = "<!DOCTYPE html>" + document.replace(
    '</head>',
    `${head}</head>`
  );

  // Return the rendered HTML.
  return html;
}