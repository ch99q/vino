import type { ComponentChildren, Context } from 'preact';

export const HeadContext: Context<{ head: ComponentChildren, meta: Record<string, unknown> }>;

export function Head(props: { children?: ComponentChildren }): null;

export function useMeta(): Record<string, unknown>;