

import { useState } from "react";
import { Head, useLoaderData } from "../jsx/context";

import styles from "../style.css?url";

import { api } from "../api";

export async function loader() {
  const data = await api.random.$get().then(res => res.json());
  await api.random.$get().then(res => res.json());
  return data;
}

export default function IndexPage() {
  const initialData = useLoaderData<typeof loader>();
  const [count, setCount] = useState(initialData?.number || 0);

  function randomize() {
    api.random.$get().then(res => res.json()).then(data => {
      setCount(data.number);
    });
  }

  return (
    <div>
      <Head>
        <title>React App</title>
        <meta name="description" content="A simple React application." />
        <link as="style" rel="preload" href={styles} crossOrigin="anonymous" />
        <link rel="stylesheet" href={styles} crossOrigin="anonymous" />
      </Head>

      <h1>Hello, React!</h1>
      <p>This is a simple React application.</p>

      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>

      <button type="button" onClick={randomize}>
        Randomize (API)
      </button>
    </div>
  );
}
