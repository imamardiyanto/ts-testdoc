/**
 * Chunks an array into smaller arrays of a given size.
 *
 * @example
 * ```ts
 * import { chunkArray } from "example-lib";
 * import _ from "lodash";
 *
 * const result = chunkArray([1, 2, 3, 4, 5], 2);
 * assertEqual(result.length, 3);
 *
 * // Compare with lodash
 * const lodashResult = _.chunk([1, 2, 3, 4, 5], 2);
 * assertEqual(JSON.stringify(result), JSON.stringify(lodashResult));
 * ```
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Deep clones an object.
 *
 * @example
 * ```ts
 * import { deepClone } from "example-lib";
 * import _ from "lodash";
 *
 * const original = { a: { b: { c: 1 } } };
 * const cloned = deepClone(original);
 *
 * assert(_.isEqual(original, cloned), "Should be equal");
 * assert(original !== cloned, "Should be different references");
 *
 * cloned.a.b.c = 999;
 * assertEqual(original.a.b.c, 1);
 * ```
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Combines multiple functions from the library.
 *
 * @example
 * ```ts
 * // Import via package name (self-reference)
 * import { add, chunkArray } from "example-lib";
 *
 * const numbers = [1, 2, 3, 4];
 * const chunks = chunkArray(numbers, 2);
 * const sums = chunks.map(chunk => chunk.reduce(add, 0));
 * assertEqual(sums[0], 3);  // 1 + 2
 * assertEqual(sums[1], 7);  // 3 + 4
 * ```
 *
 * @example
 * ```ts
 * // Import via relative path
 * import { add, multiply } from "./math.js";
 * import { chunkArray } from "./utils.js";
 *
 * const result = chunkArray([add(1, 2), multiply(3, 4)], 1);
 * assertEqual(result.length, 2);
 * assertEqual(result[0][0], 3);
 * assertEqual(result[1][0], 12);
 * ```
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}
