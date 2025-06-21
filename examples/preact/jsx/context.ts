import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { VNode } from 'preact';

export const HeadContext = createContext<{ head: VNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: VNode | VNode[] }) {
  const context = useContext(HeadContext);
  if (context && props.children) context.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}