import type { ReactNode, Context } from 'react';

export const HeadContext: Context<{ head: ReactNode, meta: Record<string, unknown> }>;

export function Head(props: { children?: ReactNode }): null;

export function useMeta(): Record<string, unknown>; 