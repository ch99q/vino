import { useState } from "preact/hooks";
import { Head } from "./jsx/context";

import style from "./style.css?url";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Head>
        <title>Preact App</title>
        <meta name="description" content="A simple Preact application." />
        <link as="style" rel="preload" href={style} crossOrigin="anonymous" />
        <link rel="stylesheet" href={style} crossOrigin="anonymous" />
      </Head>

      <h1>Hello, Preact!</h1>
      <p>This is a simple Preact application.</p>

      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}