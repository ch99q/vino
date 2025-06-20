import { createContext, useContext } from 'hono/jsx';
import type { JSX } from "hono/jsx/jsx-runtime";

export const HeadContext = createContext<{ head: JSX.Element[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: JSX.Element | JSX.Element[] }) {
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}