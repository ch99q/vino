import { renderToString } from 'react-dom/server.edge';

import type { ComponentType } from 'react';
import { createElement } from 'react';

import { Document } from './document.tsx';
import { HeadContext } from './context.tsx';

export default function render({ client }: { client: string }, component: ComponentType<Record<string, unknown>>, metadata: Record<string, unknown>) {
  const helmet: React.ReactNode[][] = [];

  // Render the React component to a string.
  const document = renderToString(
    createElement(HeadContext.Provider, { value: { head: helmet, meta: metadata } },
      createElement(Document, { client },
        createElement(component)
      )
    )
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