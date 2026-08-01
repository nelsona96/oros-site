import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without `test.globals: true`, RTL can't auto-detect a global afterEach to
// register its own cleanup, so each render() call was leaking into the next
// test's DOM. Registering it explicitly here fixes that for every test file.
afterEach(() => {
  cleanup();
});
