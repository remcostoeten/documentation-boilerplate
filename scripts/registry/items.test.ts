import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import {
  itemFiles,
  platformPackages,
  type RegistryItem,
  registryItems,
  repositoryRoot as root,
} from "./items";

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const installed = new Set(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }));
// Matches the module specifier of import and export statements, including bare side effect imports
const importPattern = /(?:^|\n)\s*(?:import|export)\s(?:[^"';]*?\sfrom\s)?["']([^"']+)["']/g;

function findItem(name: string) {
  const item = registryItems.find((entry) => entry.name === name);
  if (!item) throw new Error(`unknown registry item ${name}`);
  return item;
}

function reachableFiles(item: RegistryItem, seen = new Set<string>()): Set<string> {
  if (seen.has(item.name)) return new Set();
  seen.add(item.name);
  const files = new Set(itemFiles(item));
  for (const name of item.registryDependencies) {
    for (const file of reachableFiles(findItem(name), seen)) files.add(file);
  }
  return files;
}

function resolveLocal(from: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? join("src", specifier.slice(2))
    : normalize(join(dirname(from), specifier));
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")];
  return candidates.find((path) => existsSync(join(root, path)) && !path.endsWith("/")) ?? base;
}

function packageName(specifier: string) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function boundaryProblems(item: RegistryItem) {
  const allowed = reachableFiles(item);
  const packages = new Set([...item.dependencies, ...platformPackages]);
  const problems: string[] = [];

  for (const file of itemFiles(item)) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(join(root, file), "utf8");
    for (const [, specifier] of source.matchAll(importPattern)) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        const target = resolveLocal(file, specifier);
        if (!allowed.has(target)) problems.push(`${file} imports ${target}`);
        continue;
      }
      if (specifier.startsWith("node:")) continue;
      if (!packages.has(packageName(specifier))) problems.push(`${file} imports ${specifier}`);
    }
  }
  return problems;
}

test("registry dependencies and npm dependencies exist", () => {
  for (const item of registryItems) {
    for (const name of item.registryDependencies) findItem(name);
    for (const name of [...item.dependencies, ...platformPackages]) {
      expect(installed.has(name), `${item.name} depends on ${name}`).toBe(true);
    }
  }
});

for (const item of registryItems) {
  test(`${item.name} only imports its own files, its registry dependencies and declared packages`, () => {
    expect(boundaryProblems(item)).toEqual([]);
  });
}
