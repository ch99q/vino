import { useState } from "react";

import { Head } from "./jsx/context";

import Counter from "./counter?island";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col">
      <Head>
        <title>React App</title>
        <meta name="description" content="A simple React application." />
      </Head>

      <h1 className="text-green-500">Hello, React!</h1>
      <p>This is a simple React application.</p>

      <Counter initial={5} />
      <Counter initial={10} />

      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times (static)
      </button>
    </div>
  );
}