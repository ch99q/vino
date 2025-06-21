import { renderToString } from 'react-dom/server.edge';
import { ComponentType } from 'react';

import { Document } from './document';
import { HeadContext } from './context';

export default function render({ client }: { client: string }, Component: ComponentType<any>, metadata: Record<string, unknown>) {
  const helmet: React.ReactNode[] = [];

  // Render the React component to a string.
  const document = renderToString(
    <HeadContext.Provider value={{ head: helmet, meta: metadata }}>
      <Document client={client}>
        <Component />
      </Document>
    </HeadContext.Provider>
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