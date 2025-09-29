import { renderToString } from 'react-dom/server.edge';
import { ComponentType, ReactNode } from 'react';

import { Document } from './document';
import { Context } from './context';

import type { Context as HonoContext } from 'hono';
import { startTime, endTime } from 'hono/timing';

declare global {
  var context: HonoContext;
}

export default async function render({ client, exports }: { client: string; exports: Record<string, unknown> }, Component: ComponentType<any>, metadata: Record<string, unknown>, context: HonoContext) {
  const helmet: React.ReactNode[] = [];

  // Expose the context to the global window object for access in other modules.
  globalThis.context = context;

  if (import.meta.env.DEV)
    startTime(context, 'loading', 'Loading page data');

  // Render the loader data if the component has a loader function.
  const PAGE_DATA = {
    metadata,
    loader: await (exports.loader ? (exports.loader as () => Promise<Record<string, any>>)() : {}) as Record<string, any>,
  }

  if (import.meta.env.DEV) {
    endTime(context, 'loading');
    startTime(context, 'rendering', 'Rendering content');
  }

  // Render the React component to a string.
  const document = renderToString(
    <Context.Provider value={{ head: helmet, ...PAGE_DATA }}>
      <Document>
        <Component />
      </Document>
    </Context.Provider>
  );

  // Extract the head content from the helmet.
  const head = renderToString(helmet);

  // Create the full HTML document by inserting the head into the document.
  let html = "<!DOCTYPE html>" + document.replace(
    '</head>',
    `${head}</head>`
  );

  // Inject the page data and client script before the closing body tag.
  html = html.replace(
    '</body>',
    `<script>window.__PAGE_DATA__ = ${JSON.stringify(PAGE_DATA)};</script>
    <script type="module" src="${client}"></script>
    </body>`
  );

  if (import.meta.env.DEV)
    endTime(context, 'rendering');

  // Return the rendered HTML.
  return html;
}