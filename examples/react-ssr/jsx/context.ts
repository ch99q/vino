import { createContext, useContext } from 'react';

export const Context = createContext<{ 
  head: React.ReactNode[], 
  metadata: Record<string, unknown>,
  loader: Record<string, any>
}>(null!);

export function useMetadata() {
  const context = useContext(Context);
  return context?.metadata ?? {};
}

export function Head(props: { children?: React.ReactNode | React.ReactNode[] }) {
  const data = useContext(Context);
  data.head = data.head || [];
  if (data && props.children) data.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

type SerializeFrom<T> = T extends (...args: any) => Promise<infer U> ? U : T extends (...args: any) => infer U ? U : never;

export function useLoaderData<T = any>(): SerializeFrom<T> {
  const context = useContext(Context);
  return context.loader as any ?? {};
}