import * as fs from "fs";
import * as path from "path";

export interface DocExample {
  file: string;
  line: number;
  name: string;
  code: string;
  expectedOutput?: string;
}

export interface ParseResult {
  examples: DocExample[];
  errors: string[];
}

/**
 * Extract JSDoc comments from TypeScript/JavaScript source code
 */
function extractJSDocComments(
  source: string
): Array<{ comment: string; line: number; name: string }> {
  const results: Array<{ comment: string; line: number; name: string }> = [];

  // Match JSDoc comments: /** ... */
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
  let match;

  while ((match = jsdocRegex.exec(source)) !== null) {
    const comment = match[1];
    const startIndex = match.index;

    // Calculate line number
    const line = source.substring(0, startIndex).split("\n").length;

    // Try to find the name of the thing being documented
    const afterComment = source.substring(match.index + match[0].length);
    const nameMatch = afterComment.match(
      /^\s*(?:export\s+)?(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+(\w+)/
    );
    const name = nameMatch ? nameMatch[1] : `anonymous_${line}`;

    results.push({ comment, line, name });
  }

  return results;
}

/**
 * Extract @example blocks from a JSDoc comment
 */
function extractExamples(comment: string): Array<{ code: string; expectedOutput?: string }> {
  const examples: Array<{ code: string; expectedOutput?: string }> = [];

  // Pattern 1: @example tag followed by code block
  // ```ts or ```typescript or ```js or ```javascript or just ```
  const exampleBlockRegex =
    /@example\s*\n\s*\*?\s*```(?:ts|typescript|js|javascript)?\n([\s\S]*?)```/g;
  let match;

  while ((match = exampleBlockRegex.exec(comment)) !== null) {
    const code = cleanExampleCode(match[1]);
    const expectedOutput = extractExpectedOutput(code);
    examples.push({ code: expectedOutput.code, expectedOutput: expectedOutput.expected });
  }

  // Pattern 2: @example followed by indented code (no markdown fence)
  if (examples.length === 0) {
    const simpleExampleRegex = /@example\s*\n((?:\s*\*\s{2,}[^\n]+\n?)+)/g;
    while ((match = simpleExampleRegex.exec(comment)) !== null) {
      const code = cleanExampleCode(match[1]);
      if (code.trim()) {
        const expectedOutput = extractExpectedOutput(code);
        examples.push({ code: expectedOutput.code, expectedOutput: expectedOutput.expected });
      }
    }
  }

  return examples;
}

/**
 * Clean up example code by removing JSDoc asterisks and normalizing indentation
 */
function cleanExampleCode(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      // Remove leading " * " from JSDoc
      return line.replace(/^\s*\*\s?/, "");
    })
    .join("\n")
    .trim();
}

/**
 * Extract expected output from comments like "// => value" or "// output: value"
 */
function extractExpectedOutput(code: string): { code: string; expected?: string } {
  const lines = code.split("\n");
  const codeLines: string[] = [];
  let expected: string | undefined;

  for (const line of lines) {
    // Check for output assertions: // => value, // -> value, // output: value
    const outputMatch = line.match(/\/\/\s*(?:=>|->|output:)\s*(.+)$/);
    if (outputMatch) {
      expected = outputMatch[1].trim();
      // Keep the line but we'll use it for assertion
      codeLines.push(line);
    } else {
      codeLines.push(line);
    }
  }

  return { code: codeLines.join("\n"), expected };
}

/**
 * Parse a single file for doc examples
 */
export function parseFile(filePath: string): ParseResult {
  const examples: DocExample[] = [];
  const errors: string[] = [];

  try {
    const source = fs.readFileSync(filePath, "utf-8");
    const comments = extractJSDocComments(source);

    for (const { comment, line, name } of comments) {
      const extracted = extractExamples(comment);
      for (let i = 0; i < extracted.length; i++) {
        const { code, expectedOutput } = extracted[i];
        examples.push({
          file: filePath,
          line,
          name: extracted.length > 1 ? `${name}_example${i + 1}` : name,
          code,
          expectedOutput,
        });
      }
    }
  } catch (err) {
    errors.push(`Failed to parse ${filePath}: ${err}`);
  }

  return { examples, errors };
}

/**
 * Parse multiple files or directories for doc examples
 */
export function parseFiles(paths: string[]): ParseResult {
  const allExamples: DocExample[] = [];
  const allErrors: string[] = [];

  for (const p of paths) {
    const stats = fs.statSync(p);
    if (stats.isDirectory()) {
      const files = findSourceFiles(p);
      for (const file of files) {
        const { examples, errors } = parseFile(file);
        allExamples.push(...examples);
        allErrors.push(...errors);
      }
    } else {
      const { examples, errors } = parseFile(p);
      allExamples.push(...examples);
      allErrors.push(...errors);
    }
  }

  return { examples: allExamples, errors: allErrors };
}

/**
 * Recursively find TypeScript/JavaScript files in a directory
 */
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...findSourceFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mts|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}
