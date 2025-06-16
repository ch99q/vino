import { Scripts, Meta, Links } from "@ch99q/vino/react";
import { useState } from "react";

import "./style.css";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <html>
      <head>
        <title>React App</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hello, React!</h1>
        <p>This is a simple React application.</p>
        
        <button type="button" onClick={() => setCount(count + 1)}>
          Clicked {count} times
        </button>

        <Scripts />
      </body>
    </html>
  );
}