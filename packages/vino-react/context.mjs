/* @ts-self-types="./context.d.ts" */
import { createContext, useContext } from 'react';

export const HeadContext = createContext(null);

export function Head(props) {
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return null;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}