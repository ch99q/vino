import { createContext, useContext } from 'react';

export const HeadContext = createContext<{ head: React.ReactNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: React.ReactNode }) {
  if (!import.meta.env.SSR) return null;
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}