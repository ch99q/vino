import { createElement } from "react";
import type { JSX } from "react";

export async function island(path: string, module: () => JSX.Element) {
  const { hydrateRoot } = await import("react-dom/client");
  const elements = document.querySelectorAll(`[data-island="${path}"]`);
  for (const element of Array.from(elements)) {
    const props = JSON.parse(element.getAttribute("data-island-props") || "{}");
    const component = createElement(module, props);
    hydrateRoot(element, component);
  }
}

export default function render(component: () => void) {
  // Return the component to be bundled.
  return component;
}