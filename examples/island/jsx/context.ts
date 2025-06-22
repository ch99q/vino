import { createContext, useContext } from 'react';

export const MetaContext = createContext<{ head: React.ReactNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: React.ReactNode | React.ReactNode[] }) {
  const head = useContext(MetaContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(MetaContext);
  return head?.meta ?? {};
}