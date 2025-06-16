// deno-lint-ignore-file no-explicit-any
import type { Component } from "@ch99q/vino/client";

import React from "react";
import { renderToString } from "react-dom/server.edge";

import { ContextProvider } from "./context.tsx";

function buildAssets(base: string, metadata: Record<string, any>, assets: string[], styles: string[]) {
  const meta: [string, Record<string, unknown>][] = [];
  const links: [string, Record<string, unknown>][] = [];
  const scripts: [string, Record<string, unknown>][] = [];

  assets.forEach((asset: string) => {
    const ext = asset.split('.').pop() || '';
    asset = base + asset;
    if (["woff", "woff2", "ttf", "otf"].includes(ext)) {
      links.push(["link", { rel: "preload", href: asset, as: "font", type: `font/${ext}`, crossorigin: "anonymous" }]);
    } else if (["mjs", "js"].includes(ext)) {
      links.push(["link", { rel: "modulepreload", href: asset }]);
    } else {
      links.push(["link", { rel: "preload", href: asset, as: "fetch" }]);
    }
  });

  styles.forEach((style: string) => {
    style = base + style;
    links.push(["link", { rel: "stylesheet", href: style }]);
    links.push(["link", { rel: "preload", href: style, as: "style" }]);
  });

  scripts.push(["script", {
    type: "module", dangerouslySetInnerHTML: {
      __html: `globalThis.__PAGE_CONTEXT__ = ${JSON.stringify({
        meta: meta ?? [],
        links: links ?? [],
        scripts: scripts ?? [],
        metadata: metadata ?? {}
      })};`
    }
  }]);

  return {
    meta,
    links,
    scripts
  };
}

export function render(base: string, component: Component, metadata: Record<string, any> = {}) {
  if(!component.entrypoint) return renderToString(React.createElement(component, metadata));
  const { meta, links, scripts } = buildAssets(base, metadata, component?.entrypoint?.assets ?? [], component?.entrypoint?.styles ?? []);

  scripts.push(["script", {
    type: "module", src: base + component.entrypoint.fileName
  }]);
  
  const Component = component?.module;
  if(!Component) throw new Error("Component does not have a default export.");
  return renderToString(
    <ContextProvider.Provider value={{ meta, links, scripts, metadata }}>
      <Component {...metadata} />
    </ContextProvider.Provider>
  );
}