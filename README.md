# Vino

A modern, Deno-first framework for building and benchmarking SSR (Server-Side Rendering) web applications with React and Preact. Vino is intentionally minimal, with a small codebase and little "magic"—designed to be understandable, maintainable, and robust for the next decade of personal and professional projects.

NOTE: This project is in early development. The API and features may change as we refine the framework.

## Philosophy

Vino was created to avoid the complexity and churn of large frameworks. It aims to:
- Stay small and readable—so you can understand and change anything.
- Use modern, stable tools (Deno, Vite, Hono, React, Preact).
- Provide just enough structure for SSR, hydration, and benchmarking, without hiding how things work.
- Be a foundation you can trust for years, not a moving target.

## Features

- **SSR for React & Preact**: Out-of-the-box support for both React and Preact with optimized build and hydration flows.
- **Vite-based Build**: Uses Vite for fast builds and modern DX.
- **Deno Native**: All code and tooling run natively on Deno.
- **Hono Integration**: Uses the Hono web framework for routing and serving.
- **Unified Benchmarking**: Easily benchmark all examples and get structured results.

## Getting Started

### Prerequisites
- [Deno](https://deno.com/) v2.0 or later
- [wrk](https://github.com/wg/wrk) (for benchmarking)

### Build & Run Examples

Each example (React, Preact) is a standalone SSR app. To build and run:

```sh
cd examples/react
# or cd examples/preact

deno task build
# To start the server:
deno task start
# To run in development mode:
deno task dev
```

Visit [http://localhost:8000](http://localhost:8000) to see the app.

### Benchmark All Examples

From the project root:

```sh
deno task bench
```

This will:
- Build all examples
- Start each server and run `wrk` against it
- Collect and write results to `bench/results.json`

Example output:

```json
// Macbook Pro M1 Max, Deno 2.3.6
{
  "timestamp": "2025-06-16T14:22:59.889Z",
  "results": [
    {
      "example": "react",
      "requests_per_sec": 56671.95,
      "transfer_per_sec": "50.59MB",
      "latency": "32.65ms"
    },
    {
      "example": "preact",
      "requests_per_sec": 58308.04,
      "transfer_per_sec": "32.86MB",
      "latency": "31.34ms"
    }
  ]
}
```

## How It Works

- **SSR Adapters**: The `vino/` directory provides SSR adapters for React and Preact, handling both server and client hydration.
- **Build System**: Uses Vite (via Deno) for fast, modern builds. See each example's `vite.config.ts`.
- **Benchmarking**: The `bench/mod.ts` script builds, runs, and benchmarks each example, parsing `wrk` output to JSON.

## Customization

- Add new examples by creating a new folder in `examples/` and updating the `examples` array in `bench/mod.ts`.
- Use your own Vite plugins or modify the SSR adapters as needed.

## Development

- All code is TypeScript and Deno native.
- Uses Deno tasks for build/start/dev/bench.
- See each example's `deno.json` for tasks and dependencies.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
