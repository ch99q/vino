import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { VNode } from 'preact';

export const HeadContext = createContext<{ head: VNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: VNode | VNode[] }) {
  if (!import.meta.env.SSR) return null;
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}