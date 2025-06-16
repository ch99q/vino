declare const Component: unique symbol;
declare const Adapter: unique symbol;

declare interface Entrypoint {
  fileName: string;
  styles: string[];
  assets: string[];
}

declare interface Bundle {
  entrypoints: Entrypoint[];
  assets: Record<string, string | Uint8Array>;
}

declare module "file:assets" {
  const assets: Bundle['assets'];
  export default assets;
}

declare module "file:bundle" {
  export const assets: Bundle['assets'];
  export const entrypoints: Bundle['entrypoints'];
}

declare module "file:adapter" {
  export default function render(base: string, component: typeof Component, metadata?: Record<string, unknown>): string;
}