const root = new URL("..", import.meta.url).pathname;

const examples = [
  "baseline",
  "island",
  "preact", 
  "react",
  "react-ssr",
]

type BenchResult = {
  example: string;
  requests_per_sec?: number;
  transfer_per_sec?: string;
  latency?: string;
  ratio?: number;
};

async function buildExample(example: string) {
  const isBaseline = example === "baseline";
  const projectPath = isBaseline ? root + "bench/" + example : root + "examples/" + example;
  console.log(`Building example: ${example} at ${projectPath}`);
  
  const command = new Deno.Command("deno", {
    args: ["task", "build"],
    cwd: projectPath,
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

let baselineResults: BenchResult | null = null;

async function benchExample(example: string): Promise<BenchResult> {
  console.log(`\n=== Benchmarking ${example} ===`);
  const isBaseline = example === "baseline";
  const projectPath = isBaseline ? root + "bench/" + example : root + "examples/" + example;
  
  // Start the example server
  const command = new Deno.Command("deno", {
    args: ["task", "start"],
    cwd: projectPath,
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
    // Wait a moment for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (_e) {
    console.log("Failed to gracefully shut down, forcing kill");
  }
  
  // Force kill anything still running on port 8000
  try {
    const killPort = new Deno.Command("lsof", {
      args: ["-ti:8000"],
      stdout: "piped",
      stderr: "piped"
    });
    const { stdout } = await killPort.output();
    const pids = new TextDecoder().decode(stdout).trim().split('\n').filter(p => p);
    
    for (const pid of pids) {
      if (pid) {
        console.log(`Force killing process ${pid} on port 8000`);
        const kill = new Deno.Command("kill", {
          args: ["-9", pid],
          stdout: "piped",
          stderr: "piped"
        });
        await kill.output();
      }
    }
  } catch (_e) {
    // No processes found on port 8000, which is fine
  }
  
  // Wait a bit more to ensure port is free
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Parse wrk output
  const result: BenchResult = { example };
  const reqSec = output.match(/Requests\/sec:\s+([\d.]+)/);
  const transferSec = output.match(/Transfer\/sec:\s+([\d.]+\w+)/);
  const latency = output.match(/Latency\s+([\d.]+\w+)/);
  if (reqSec) result.requests_per_sec = parseFloat(reqSec[1]);
  if (transferSec) result.transfer_per_sec = transferSec[1];
  if (latency) result.latency = latency[1];

  if (isBaseline) {
    baselineResults = result;
  } else if (baselineResults && result.requests_per_sec && baselineResults.requests_per_sec) {
    const ratio = result.requests_per_sec / baselineResults.requests_per_sec;
    result.ratio = ratio;
  }

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

