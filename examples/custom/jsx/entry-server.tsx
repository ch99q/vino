import type { JSX } from 'hono/jsx/jsx-runtime';

import { Document } from './document.tsx';
import { HeadContext } from './context.tsx';

export default function render({ client }: { client: string }, component: () => JSX.Element, metadata: Record<string, unknown>) {
  const helmet: JSX.Element[] = [];

  const document = HeadContext.Provider({
    value: { head: helmet, meta: metadata },
    children: [
      Document({
        client,
        children: [component()]
      })]
  })!.toString();

  // Extract the head content from the helmet.
  const head = helmet.reverse().map(h => h.toString()).join('');

  // Create the full HTML document by inserting the head into the document.
  const html = "<!DOCTYPE html>" + document.replace(
    '</head>',
    `${head}</head>`
  );

  // Return the rendered HTML.
  return html;
}