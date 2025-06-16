import { Scripts, Meta, Links } from "@ch99q/vino-preact";
import { useState } from "preact/hooks";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <html>
      <head>
        <title>Preact App</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hello, Preact!</h1>
        <p>This is a simple Preact application.</p>
        
        <button type="button" onClick={() => setCount(count + 1)}>
          Clicked {count} times
        </button>

        <Scripts />
      </body>
    </html>
  );
}