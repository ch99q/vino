/* @ts-self-types="./context.d.ts" */
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const HeadContext = createContext(null);

export function Head(props) {
  const head = useContext(HeadContext);
  if (head && props.children) head.head.push(...Array.isArray(props.children) ? props.children : [props.children]);
  return;
}

export function useMeta() {
  const head = useContext(HeadContext);
  return head?.meta ?? {};
}