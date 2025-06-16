// deno-lint-ignore-file no-explicit-any
import { createContext, createElement, use } from "react";
import type { Context as ReactContext, ReactNode } from "react";

type MetaItem = [string, Record<string, unknown>];
type LinkItem = [string, Record<string, unknown>];
type ScriptItem = [string, Record<string, unknown>];

export type Context = {
  meta: Array<MetaItem>,
  links: Array<LinkItem>,
  scripts: Array<ScriptItem>,
  metadata: Record<string, unknown>,
}

export const ContextProvider: ReactContext<Context> = createContext<Context>({
  links: [],
  scripts: [],
  meta: [],
  metadata: {},
})

export function Meta(): ReactNode[] {
  const { meta } = use(ContextProvider);
  return meta.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}
export function Links(): ReactNode[] {
  const { links } = use(ContextProvider);
  return links.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}
export function Scripts(): ReactNode[] {
  const { scripts } = use(ContextProvider);
  return scripts.map(([tag, attributes], i) => createElement(tag, (attributes.key = i, attributes)));
}

export function useMetadata<T extends Record<string, any>>(): T {
  const { metadata } = use(ContextProvider);
  return metadata as T;
}