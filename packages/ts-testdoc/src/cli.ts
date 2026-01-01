#!/usr/bin/env node

import { parseFiles } from "./parser.js";
import { runExamples, formatResults } from "./runner.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
ts-testdoc - Run code examples from JSDoc comments as tests

Usage: ts-testdoc [options] <files or directories...>

Options:
  -h, --help      Show this help message
  -v, --verbose   Show verbose output
  --timeout <ms>  Set test timeout (default: 5000ms)
  --dry-run       Parse and show examples without running them

Examples:
  ts-testdoc src/
  ts-testdoc src/utils.ts src/helpers.ts
  ts-testdoc --verbose ./lib/

Write doc examples in your code like this:

  /**
   * Adds two numbers together.
   *
   * @example
   * \`\`\`ts
   * const result = add(1, 2);
   * assertEqual(result, 3);
   * \`\`\`
   */
  export function add(a: number, b: number): number {
    return a + b;
  }
`);
    process.exit(0);
  }

  const verbose = args.includes("-v") || args.includes("--verbose");
  const dryRun = args.includes("--dry-run");
  const timeoutIndex = args.findIndex((a) => a === "--timeout");
  const timeout = timeoutIndex >= 0 ? parseInt(args[timeoutIndex + 1], 10) : 5000;

  // Filter out flags to get paths
  const paths = args.filter(
    (a, i) =>
      !a.startsWith("-") && (timeoutIndex < 0 || i !== timeoutIndex + 1)
  );

  if (paths.length === 0) {
    console.error("Error: No files or directories specified");
    process.exit(1);
  }

  console.log(`\n🔍 Scanning for doc examples in: ${paths.join(", ")}\n`);

  const { examples, errors } = parseFiles(paths);

  for (const error of errors) {
    console.error(`⚠️  ${error}`);
  }

  if (examples.length === 0) {
    console.log("No @example blocks found in JSDoc comments.");
    process.exit(0);
  }

  console.log(`Found ${examples.length} doc example(s)\n`);

  if (dryRun) {
    console.log("Dry run - showing examples without executing:\n");
    for (const example of examples) {
      console.log(`─── ${example.name} (${example.file}:${example.line}) ───`);
      console.log(example.code);
      console.log("");
    }
    process.exit(0);
  }

  console.log("Running doc tests...\n");

  const results = await runExamples(examples, { verbose, timeout });
  console.log(formatResults(results));

  const failed = results.filter((r) => !r.passed).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
