import { useMeta } from "./context";

import styles from "../style.css?url";

export function Document({ client, children }: { client: string, children: React.ReactNode }) {
  const meta = useMeta();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link as="style" rel="preload" href={styles} crossOrigin="anonymous" />
        <link rel="stylesheet" href={styles} crossOrigin="anonymous" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        {import.meta.env.DEV && (
          <script type="module">{`
          import RefreshRuntime from '/@react-refresh';
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => { }
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
          `}
          </script>
        )}
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