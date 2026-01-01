/**
 * Adds two numbers together.
 *
 * @example
 * ```ts
 * import { add } from "example-lib";
 *
 * const result = add(2, 3);
 * assertEqual(result, 5);
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Multiplies two numbers.
 *
 * @example
 * ```ts
 * import { multiply, add } from "example-lib";
 *
 * assertEqual(multiply(3, 4), 12);
 * assertEqual(multiply(0, 100), 0);
 * // Can use other exports from same package
 * assertEqual(add(multiply(2, 3), 1), 7);
 * ```
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divides two numbers, throwing if divisor is zero.
 *
 * @example
 * ```ts
 * import { divide } from "example-lib";
 *
 * assertEqual(divide(10, 2), 5);
 * assertEqual(divide(9, 3), 3);
 * ```
 *
 * @example
 * ```ts
 * import { divide } from "example-lib";
 *
 * // This should throw
 * let threw = false;
 * try {
 *   divide(1, 0);
 * } catch {
 *   threw = true;
 * }
 * assert(threw, "Expected divide by zero to throw");
 * ```
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

/**
 * Calculates the factorial of a number.
 *
 * @example
 * ```ts
 * import { factorial } from "example-lib";
 *
 * assertEqual(factorial(0), 1);
 * assertEqual(factorial(1), 1);
 * assertEqual(factorial(5), 120);
 * assertEqual(factorial(10), 3628800);
 * ```
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error("Negative factorial");
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Checks if a number is prime.
 *
 * @example
 * ```ts
 * import { isPrime } from "example-lib";
 *
 * assert(isPrime(2), "2 is prime");
 * assert(isPrime(17), "17 is prime");
 * assert(!isPrime(1), "1 is not prime");
 * assert(!isPrime(15), "15 is not prime");
 * ```
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}
