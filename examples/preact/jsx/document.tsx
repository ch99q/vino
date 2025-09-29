import { useMeta } from "./context";
import type { VNode } from "preact";

export function Document({ client, children }: { client: string, children: VNode | VNode[] }) {
  const meta = useMeta();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <script type="module" dangerouslySetInnerHTML={{ __html: `
          window.__PAGE_META__ = ${JSON.stringify(meta)};
        ` }}></script>
        <script type="module" src={client}></script>
      </body>
    </html>
  );
}