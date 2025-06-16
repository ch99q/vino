const root = new URL("..", import.meta.url).pathname;

const examples = [
  "react",
  "preact",
]

type BenchResult = {
  example: string;
  requests_per_sec?: number;
  transfer_per_sec?: string;
  latency?: string;
};

async function buildExample(example: string) {
  console.log(`Building example: ${example} at ${root}examples/${example}`);
  const command = new Deno.Command("deno", {
    args: ["task", "build"],
    cwd: root + "examples/" + example,
    stdout: "piped",
    stderr: "piped",
    env: {
      "NODE_ENV": "production",
      "NODE_DISABLE_COLORS": "1",
    }
  });

  const { code: _code, stdout, stderr } = await command.output();

  console.log(new TextDecoder().decode(stdout));
  console.log(new TextDecoder().decode(stderr));
}

async function benchExample(example: string): Promise<BenchResult> {
  console.log(`\n=== Benchmarking ${example} ===`);
  // Start the example server
  const command = new Deno.Command("deno", {
    args: ["task", "start"],
    cwd: root + `examples/${example}`,
    stdout: "piped",
    stderr: "piped",
    env: {
      "NODE_ENV": "production",
      "NODE_DISABLE_COLORS": "1",
    }
  });
  const child = command.spawn();

  // Wait for server to be ready
  await new Promise((res) => setTimeout(res, 3000));

  // Run benchmark
  const wrk = new Deno.Command("wrk", {
    args: ["-t20", "-c2000", "-d10s", "http://localhost:8000/"],
    cwd: root + "bench",
    stdout: "piped",
    stderr: "piped",
    env: {
      "NODE_ENV": "production",
      "NODE_DISABLE_COLORS": "1",
    }
  });
  const { stdout } = await wrk.output();
  const output = new TextDecoder().decode(stdout);
  console.log(output);

  // Kill the server process
  try {
    child.kill("SIGTERM");
  } catch (e) {
    console.warn("Failed to kill server process", e);
  }

  // Parse wrk output
  const result: BenchResult = { example };
  const reqSec = output.match(/Requests\/sec:\s+([\d.]+)/);
  const transferSec = output.match(/Transfer\/sec:\s+([\d.]+\w+)/);
  const latency = output.match(/Latency\s+([\d.]+\w+)/);
  if (reqSec) result.requests_per_sec = parseFloat(reqSec[1]);
  if (transferSec) result.transfer_per_sec = transferSec[1];
  if (latency) result.latency = latency[1];
  return result;
}

async function main() {
  // Build all examples
  for (const example of examples) {
    await buildExample(example);
  }

  // Bench all examples
  const results = [];
  const timestamp = new Date().toISOString();
  for (const example of examples) {
    const res = await benchExample(example);
    results.push(res);
  }

  // Write results to JSON file with timestamp
  const output = { timestamp, results };
  await Deno.writeTextFile(root + "bench/results.json", JSON.stringify(output, null, 2));
  console.log("\nBenchmark results written to bench/results.json");
}

if (import.meta.main) {
  main();
}

