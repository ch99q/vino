import { renderToString } from 'preact-render-to-string';
import { Fragment, h } from 'preact';

import { Document } from './document.jsx';
import { HeadContext } from './context.jsx';

export default function render({ client }, component, metadata) {
  const helmet = [];

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