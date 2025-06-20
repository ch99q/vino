import { createContext, useContext } from 'react';
import type { Context } from 'react';

export const HeadContext: Context<{ head: React.ReactNode[], meta: Record<string, unknown> }> = createContext<{ head: React.ReactNode[], meta: Record<string, unknown> }>(null!);

export function Head(props: { children?: React.ReactNode }): void {
  if (!import.meta.env.SSR) return;
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return;
}

export function useMeta(): Record<string, unknown> {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}