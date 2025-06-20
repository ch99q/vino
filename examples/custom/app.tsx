import { useState } from "hono/jsx";
import { Head } from "./jsx/context.tsx";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Head>
        <title>Hono JSX App</title>
        <meta name="description" content="A simple Hono JSX application." />
        <link as="style" rel="preload" href="/style.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/style.css" crossOrigin="anonymous" />
      </Head>

      <h1>Hello, Hono JSX!</h1>
      <p>This is a simple Hono JSX application.</p>

      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}