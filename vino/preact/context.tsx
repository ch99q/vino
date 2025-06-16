// deno-lint-ignore-file no-explicit-any
import { createContext, createElement } from "preact";
import { useContext } from "preact/hooks";

type MetaItem = [string, Record<string, unknown>];
type LinkItem = [string, Record<string, unknown>];
type ScriptItem = [string, Record<string, unknown>];

export type Context = {
  meta: Array<MetaItem>,
  links: Array<LinkItem>,
  scripts: Array<ScriptItem>,
  metadata: Record<string, unknown>,
}

export const ContextProvider = createContext<Context>({
  links: [],
  scripts: [],
  meta: [],
  metadata: {},
})

export function Meta() {
  const { meta } = useContext(ContextProvider);
  return meta.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}
export function Links() {
  const { links } = useContext(ContextProvider);
  return links.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}
export function Scripts() {
  const { scripts } = useContext(ContextProvider);
  return scripts.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}

export function useMetadata<T extends Record<string, any>>(): T {
  const { metadata } = useContext(ContextProvider);
  return metadata as T;
}