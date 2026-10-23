import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { mergeCss } from "./css";
import type { RegistryItem } from "./registry";

export type AddResult = {
  written: string[];
  unchanged: string[];
  skipped: string[];
  dependencies: string[];
  envVars: string[];
  css: string | null;
};

const cssCandidates = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
];

// Matches the path of a CSS @import statement
const importPattern = /@import\s+["']([^"']+)["']/g;

function readText(path: string) {
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

function splitPackage(spec: string) {
  const at = spec.lastIndexOf("@");
  return at > 0
    ? { name: spec.slice(0, at), range: spec.slice(at + 1) }
    : { name: spec, range: "latest" };
}

function findCssFile(root: string) {
  const config = readText(join(root, "components.json"));
  const configured = config ? JSON.parse(config).tailwind?.css : undefined;
  if (configured) return configured;
  return cssCandidates.find((path) => existsSync(join(root, path))) ?? null;
}

function addDependencies(root: string, items: RegistryItem[]) {
  const path = join(root, "package.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const present = { ...manifest.devDependencies, ...manifest.dependencies };
  const added: string[] = [];
  for (const { name, range } of items
    .flatMap((item) => item.dependencies ?? [])
    .map(splitPackage)) {
    if (present[name]) continue;
    manifest.dependencies = { ...manifest.dependencies, [name]: range };
    present[name] = range;
    added.push(name);
  }
  if (added.length > 0) writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return added;
}

function addEnvVars(root: string, items: RegistryItem[]) {
  const path = join(root, ".env.local");
  const current = readText(path) ?? "";
  const defined = new Set(current.split("\n").map((line) => line.split("=")[0].trim()));
  const missing = items
    .flatMap((item) => Object.entries(item.envVars ?? {}))
    .filter(([name]) => !defined.has(name));
  if (missing.length === 0) return [];
  const block = missing.map(([name, value]) => `${name}=${value}`).join("\n");
  writeFileSync(path, `${current}${current && !current.endsWith("\n") ? "\n" : ""}${block}\n`);
  return missing.map(([name]) => name);
}

function importsFile(stylesheet: string, source: string, path: string) {
  return [...source.matchAll(importPattern)].some(
    ([, imported]) => join(dirname(stylesheet), imported) === path,
  );
}

function addCss(root: string, items: RegistryItem[], cssPath: string | undefined) {
  const styled = items.filter((item) => item.css || item.cssVars?.theme);
  if (styled.length === 0) return null;
  const file = cssPath ?? findCssFile(root);
  if (!file)
    throw new Error("No stylesheet found. Pass --css with the path of your Tailwind CSS file.");
  const before = readFileSync(join(root, file), "utf8");
  let source = before;
  for (const item of styled) {
    const cssFiles = (item.files ?? []).filter((entry) => entry.path.endsWith(".css"));
    if (cssFiles.some((entry) => importsFile(file, before, entry.target ?? entry.path))) continue;
    source = mergeCss(source, item.cssVars?.theme ?? {}, item.css ?? {});
  }
  if (source === before) return null;
  writeFileSync(join(root, file), source);
  return file;
}

/**
 * @name registryVersions
 * @description Every registry version of each file target in the items.
 *
 * @example
 * registryVersions(items).get("src/modules/feedback/server/store.ts")?.has(local)
 */
export function registryVersions(items: RegistryItem[]) {
  const versions = new Map<string, Set<string>>();
  for (const file of items.flatMap((item) => item.files ?? [])) {
    const target = file.target ?? file.path;
    versions.set(target, (versions.get(target) ?? new Set()).add(file.content));
  }
  return versions;
}

/**
 * @name addItems
 * @description Copies registry items into a project. A file that exists is
 * replaced only when it matches a registry version of that file, so local
 * edits are kept unless `overwrite` is set. Also adds missing dependencies to
 * package.json, missing variables to .env.local and the styles to the
 * stylesheet.
 *
 * @example
 * const result = addItems(process.cwd(), items, { overwrite: false, css: undefined, alternatives: [] })
 */
export function addItems(
  root: string,
  items: RegistryItem[],
  options: { overwrite: boolean; css: string | undefined; alternatives: RegistryItem[] },
): AddResult {
  const known = registryVersions([...items, ...options.alternatives]);
  const chosenElsewhere = registryVersions(options.alternatives);
  const choices = new Set(
    items.flatMap(
      (item) => item.meta?.options?.choices.flatMap((choice) => choice.item ?? []) ?? [],
    ),
  );
  const result: AddResult = {
    written: [],
    unchanged: [],
    skipped: [],
    dependencies: [],
    envVars: [],
    css: null,
  };
  const writtenNow = new Set<string>();
  const files = items.flatMap((item) =>
    (item.files ?? []).map((file) => ({ file, isChoice: choices.has(item.name) })),
  );
  for (const { file, isChoice } of files) {
    const target = file.target ?? file.path;
    const path = join(root, target);
    const current = readText(path);
    const keepsOtherChoice =
      !isChoice && current !== undefined && chosenElsewhere.get(target)?.has(current);
    if (current === file.content || keepsOtherChoice) {
      result.unchanged.push(target);
      continue;
    }
    const pristine =
      current === undefined || writtenNow.has(target) || known.get(target)?.has(current);
    if (!pristine && !options.overwrite) {
      if (!result.skipped.includes(target)) result.skipped.push(target);
      continue;
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.content);
    writtenNow.add(target);
    result.written.push(target);
  }

  result.dependencies = addDependencies(root, items);
  result.envVars = addEnvVars(root, items);
  result.css = addCss(root, items, options.css);
  result.unchanged = result.unchanged.filter((path) => !writtenNow.has(path));
  result.skipped = result.skipped.filter((path) => !writtenNow.has(path));
  return result;
}
