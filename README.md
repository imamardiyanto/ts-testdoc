# ts-testdoc

Run code examples from JSDoc comments as tests — like Rust's `rustdoc --test`.

## Why?

Documentation examples rot. ts-testdoc extracts `@example` blocks from your JSDoc comments and runs them as tests, ensuring your docs always work.

## Installation

```bash
pnpm add -D ts-testdoc tsx
```

## Usage

```bash
# Run doc tests
npx ts-testdoc src/

# Preview examples without running
npx ts-testdoc --dry-run src/

# With timeout
npx ts-testdoc --timeout 10000 src/
```

## Writing Doc Tests

Add `@example` blocks to your JSDoc comments:

```ts
/**
 * Adds two numbers together.
 *
 * @example
 * ```ts
 * import { add } from "my-package";
 *
 * const result = add(2, 3);
 * assertEqual(result, 5);
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

### Built-in Assertions

Two assertion helpers are available in all examples:

```ts
assert(condition, message?)      // Throws if condition is false
assertEqual(actual, expected)    // Throws if actual !== expected
```

### Import Styles

Both package imports and relative imports work:

```ts
/**
 * @example
 * ```ts
 * // Import from package name (requires "exports" in package.json)
 * import { add, multiply } from "my-package";
 *
 * // Or use relative imports from the source file's location
 * import { add } from "./math.js";
 * import { helper } from "../utils/index.js";
 * ```
 */
```

### External Dependencies

Use any dependency from your `node_modules`:

```ts
/**
 * @example
 * ```ts
 * import { add } from "my-package";
 * import _ from "lodash";
 *
 * const chunks = _.chunk([1, 2, 3, 4], 2);
 * assertEqual(chunks.length, 2);
 * ```
 */
```

### Multiple Examples

A single function can have multiple `@example` blocks:

```ts
/**
 * Divides two numbers.
 *
 * @example
 * ```ts
 * assertEqual(divide(10, 2), 5);
 * ```
 *
 * @example
 * ```ts
 * // Test error case
 * let threw = false;
 * try {
 *   divide(1, 0);
 * } catch {
 *   threw = true;
 * }
 * assert(threw, "Should throw on division by zero");
 * ```
 */
```

## Package Setup

For self-referencing imports (`import { x } from "my-package"`), add `exports` to your package.json:

```json
{
  "name": "my-package",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

## Ignoring in Knip

If using [knip](https://github.com/webpro/knip), dependencies only used in doc examples will appear unused. Add them to `ignoreDependencies`:

```json
{
  "ignoreDependencies": ["lodash", "@types/lodash"]
}
```

## How It Works

1. Parses TypeScript/JavaScript files for JSDoc comments
2. Extracts code from `@example` blocks
3. Hoists imports to top level, resolving relative paths
4. Wraps code with assertion helpers
5. Executes each example with `tsx`
6. Reports pass/fail with file locations

## License

ISC
