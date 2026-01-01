import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";
import type { DocExample } from "./parser.js";

export interface TestResult {
  example: DocExample;
  passed: boolean;
  error?: string;
  output?: string;
  duration: number;
}

export interface RunOptions {
  verbose?: boolean;
  timeout?: number;
}

/**
 * Run a single doc example as a test
 */
async function runExample(
  example: DocExample,
  options: RunOptions = {}
): Promise<TestResult> {
  const startTime = Date.now();
  const timeout = options.timeout ?? 5000;

  // Create temp file in project's .ts-testdoc dir so node_modules resolves
  const tempDir = path.join(process.cwd(), ".ts-testdoc", `test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tempDir, { recursive: true });
  const tempFile = path.join(tempDir, "test.ts");

  // Wrap the code to capture output and handle assertions
  const wrappedCode = wrapExampleCode(example);

  try {
    fs.writeFileSync(tempFile, wrappedCode);

    const result = await executeWithTsx(tempFile, timeout);
    const duration = Date.now() - startTime;

    return {
      example,
      passed: result.exitCode === 0,
      error: result.exitCode !== 0 ? result.stderr || result.stdout : undefined,
      output: result.stdout,
      duration,
    };
  } catch (err) {
    return {
      example,
      passed: false,
      error: err instanceof Error ? err.message : String(err),
      duration: Date.now() - startTime,
    };
  } finally {
    // Cleanup
    try {
      fs.rmSync(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Extract import statements from code and separate them from the rest.
 * Resolves relative imports (./foo, ../bar) to absolute paths based on source file location.
 */
function extractImports(
  code: string,
  sourceFile: string
): { imports: string[]; rest: string[] } {
  const lines = code.split("\n");
  const imports: string[] = [];
  const rest: string[] = [];
  const sourceDir = path.dirname(path.resolve(sourceFile));

  for (const line of lines) {
    // Match import statements
    if (/^\s*import\s+/.test(line)) {
      // Resolve relative imports to absolute paths
      const resolvedImport = line.replace(
        /(from\s+['"])(\.[^'"]+)(['"])/g,
        (_match, prefix, relativePath, suffix) => {
          const absolutePath = path.resolve(sourceDir, relativePath).replace(/\\/g, "/");
          return `${prefix}${absolutePath}${suffix}`;
        }
      );
      imports.push(resolvedImport);
    } else {
      rest.push(line);
    }
  }

  return { imports, rest };
}

/**
 * Wrap example code with assertion helpers and error handling
 */
function wrapExampleCode(example: DocExample): string {
  // Import the original file to get access to the functions being documented
  const originalFile = path.resolve(example.file);
  const importPath = originalFile.replace(/\\/g, "/");

  // Extract imports from example code - they need to be at top level
  // Relative imports are resolved to absolute paths based on source file location
  const { imports, rest } = extractImports(example.code, example.file);

  // Get export names, filter out any that might conflict with user imports
  const exportNames = getExportNames(example.file);
  const exportDestructure =
    exportNames.length > 0 ? `const { ${exportNames.join(", ")} } = _module;` : "";

  return `
// Auto-generated test for: ${example.name}
// From: ${example.file}:${example.line}

// Import everything from the source file
import * as _module from "${importPath}";

// User imports from example
${imports.join("\n")}

// Make all exports available as globals for convenience
${exportDestructure}

// Simple assertion helper
function assert(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message ?? \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`
    );
  }
}

// Run the example
async function __runExample() {
${rest.map((line) => "  " + line).join("\n")}
}

__runExample().catch((err) => {
  console.error(err);
  process.exit(1);
});
`;
}

/**
 * Try to get export names from a file (simple regex-based approach)
 */
function getExportNames(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const names: string[] = [];

    // Match: export function name, export const name, export class name, etc.
    const exportRegex =
      /export\s+(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      names.push(match[1]);
    }

    // Match: export { name1, name2 }
    const namedExportRegex = /export\s*\{([^}]+)\}/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const exports = match[1].split(",").map((e) => e.trim().split(/\s+as\s+/)[0].trim());
      names.push(...exports.filter((n) => n && !n.includes("*")));
    }

    return [...new Set(names)];
  } catch {
    return [];
  }
}

/**
 * Execute a TypeScript file using tsx
 */
function executeWithTsx(
  filePath: string,
  timeout: number
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", filePath], {
      timeout,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      cwd: process.cwd(), // Run from project dir so node_modules is found
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    child.on("error", (err) => {
      resolve({ exitCode: 1, stdout, stderr: err.message });
    });
  });
}

/**
 * Run all doc examples and return results
 */
export async function runExamples(
  examples: DocExample[],
  options: RunOptions = {}
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const example of examples) {
    const result = await runExample(example, options);
    results.push(result);
  }

  return results;
}

/**
 * Format test results for display
 */
export function formatResults(results: TestResult[]): string {
  const lines: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    const location = `${path.relative(process.cwd(), result.example.file)}:${result.example.line}`;
    const time = `(${result.duration}ms)`;

    lines.push(`${status} ${result.example.name} ${time}`);
    lines.push(`  ${location}`);

    if (result.passed) {
      passed++;
    } else {
      failed++;
      if (result.error) {
        const errorLines = result.error.split("\n").slice(0, 10);
        for (const line of errorLines) {
          lines.push(`  \x1b[31m${line}\x1b[0m`);
        }
      }
    }
    lines.push("");
  }

  lines.push("─".repeat(50));
  lines.push(
    `\x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, ${results.length} total`
  );

  return lines.join("\n");
}
