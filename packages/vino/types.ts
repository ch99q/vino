
export type Adapter = (base: string, component: any, metadata?: Record<string, unknown>) => string;

export interface Entrypoint {
  fileName: string;
  styles: string[];
  assets: string[];
}

export interface Bundle {
  entrypoints: Entrypoint[];
  assets: Record<string, string | Uint8Array>;
}