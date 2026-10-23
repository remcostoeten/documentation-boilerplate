import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addItems } from "./add";
import type { RegistryItem } from "./registry";

const base: RegistryItem = {
  name: "feedback",
  dependencies: ["zod@^4.0.0"],
  files: [
    { path: "store.ts", type: "registry:file", content: "console\n" },
    { path: "widget.ts", type: "registry:file", content: "widget\n" },
  ],
};
const store: RegistryItem = {
  name: "feedback-neon",
  dependencies: ["@neondatabase/serverless@^1.0.0"],
  envVars: { DATABASE_URL: "postgres://" },
  files: [{ path: "store.ts", type: "registry:file", content: "neon\n" }],
};

test("replaces untouched registry files and keeps local edits", () => {
  const root = mkdtempSync(join(tmpdir(), "add-"));
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { zod: "^4.1.0" } }));
  writeFileSync(join(root, "store.ts"), "console\n");
  writeFileSync(join(root, "widget.ts"), "my widget\n");

  const result = addItems(root, [base, store], {
    overwrite: false,
    css: undefined,
    alternatives: [],
  });

  expect(readFileSync(join(root, "store.ts"), "utf8")).toBe("neon\n");
  expect(readFileSync(join(root, "widget.ts"), "utf8")).toBe("my widget\n");
  expect(result.skipped).toEqual(["widget.ts"]);
  expect(result.dependencies).toEqual(["@neondatabase/serverless"]);
  expect(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).dependencies.zod).toBe(
    "^4.1.0",
  );
  expect(readFileSync(join(root, ".env.local"), "utf8")).toBe("DATABASE_URL=postgres://\n");
});
