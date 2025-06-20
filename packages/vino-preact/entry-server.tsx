import { renderToString } from 'preact-render-to-string';

import type { ComponentType, VNode } from 'preact';
import { Fragment, h } from 'preact';

import { Document } from './document.tsx';
import { HeadContext } from './context.tsx';

export default function render({ client }: { client: string }, component: ComponentType<Record<string, unknown>>, metadata: Record<string, unknown>) {
  const helmet: VNode[] = [];

  // Render the React component to a string.
  const document = renderToString(
    h(HeadContext.Provider, { value: { head: helmet, meta: metadata } },
      h(Document, { client },
        h(component, {})
      )
    )
  );

  // Extract the head content from the helmet.
  const head = renderToString(h(Fragment, {}, helmet.reverse()));

  // Create the full HTML document by inserting the head into the document.
  const html = "<!DOCTYPE html>" + document.replace(
    '</head>',
    `${head}</head>`
  );

  // Return the rendered HTML.
  return html;
}