import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { VNode, Context } from 'preact';

export const HeadContext: Context<{ head: VNode[], meta: Record<string, unknown> }> = createContext<{ head: VNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: VNode | VNode[] }): void {
  if (!import.meta.env.SSR) return;
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return;
}

export function useMeta(): Record<string, unknown> {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}