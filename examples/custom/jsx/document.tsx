import { useMeta } from "./context.tsx";
import type { JSX } from "hono/jsx/jsx-runtime";

export function Document({ client, children }: { client: string, children?: JSX.Element | JSX.Element[] }) {
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
        <script type="module">
          {`
          window.__PAGE_META__ = ${JSON.stringify(meta)};
          `}
        </script>
        <script type="module" src={client}></script>
      </body>
    </html>
  );
}