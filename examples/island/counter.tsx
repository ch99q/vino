import { useState } from "react";

export default function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}