import { renderToString } from 'react-dom/server.edge';

import { createElement } from 'react';

import { Document } from './document.jsx';
import { HeadContext } from './context.jsx';

export default function render({ client }, component, metadata) {
  const helmet = [];

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