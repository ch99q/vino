import { useState } from "react";
import { Head } from "./jsx/context";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Head>
        <title>React App</title>
        <meta name="description" content="A simple React application." />
        <link as="style" rel="preload" href="/style.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/style.css" crossOrigin="anonymous" />
      </Head>

      <h1>Hello, React!</h1>
      <p>This is a simple React application.</p>

      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}