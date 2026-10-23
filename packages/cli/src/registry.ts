import { readFileSync } from "node:fs";

export type CssTree = { [key: string]: string | CssTree };

export type RegistryFile = {
  path: string;
  type: string;
  target?: string;
  content: string;
};

export type ItemOptions = {
  question: string;
  choices: { label: string; item: string | null }[];
};

export type RegistryItem = {
  name: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  cssVars?: { theme?: Record<string, string> };
  css?: CssTree;
  envVars?: Record<string, string>;
  docs?: string;
  meta?: { options?: ItemOptions };
};

export type RegistrySource = { kind: "bundled" } | { kind: "remote"; url: string };

type Spec = { source: RegistrySource; name: string };

// Matches a registry item URL and captures the registry base and the item name
const itemUrlPattern = /^(https?:\/\/.+?)\/r\/([^/]+)\.json$/;

function toSpec(value: string, source: RegistrySource): Spec {
  const match = itemUrlPattern.exec(value);
  if (!match) return { source, name: value };
  return {
    source: source.kind === "bundled" ? source : { kind: "remote", url: match[1] },
    name: match[2],
  };
}

async function loadItem({ source, name }: Spec): Promise<RegistryItem> {
  if (source.kind === "bundled") {
    const url = new URL(`../registry/${name}.json`, import.meta.url);
    try {
      return JSON.parse(readFileSync(url, "utf8"));
    } catch {
      throw new Error(`There is no registry item called ${name}.`);
    }
  }
  const response = await fetch(`${source.url}/r/${name}.json`);
  if (!response.ok) throw new Error(`${source.url}/r/${name}.json answered ${response.status}`);
  return response.json();
}

/**
 * @name registrySource
 * @description The registry to read items from: a remote registry when a URL
 * is given, otherwise the copy bundled with this CLI.
 *
 * @example
 * registrySource(process.env.DOCS_BOILERPLATE_REGISTRY)
 */
export function registrySource(url: string | undefined): RegistrySource {
  return url ? { kind: "remote", url: url.replace(/\/+$/, "") } : { kind: "bundled" };
}

/**
 * @name resolveItems
 * @description Loads the named items and everything they depend on, with
 * dependencies before the items that need them. `pick` is called for an item
 * with options and returns the extra item to add, or null.
 *
 * @example
 * const items = await resolveItems(["footer"], registrySource(undefined), async () => null)
 */
export async function resolveItems(
  names: string[],
  source: RegistrySource,
  pick: (item: RegistryItem, requested: Set<string>) => Promise<string | null>,
) {
  const resolved = new Map<string, RegistryItem>();
  const requested = new Set(names.map((name) => toSpec(name, source).name));

  async function visit(spec: Spec) {
    if (resolved.has(spec.name)) return;
    const item = await loadItem(spec);
    for (const dependency of item.registryDependencies ?? [])
      await visit(toSpec(dependency, spec.source));
    resolved.set(spec.name, item);
    if (!item.meta?.options) return;
    const extra = await pick(item, requested);
    if (extra) {
      requested.add(extra);
      await visit({ source: spec.source, name: extra });
    }
  }

  for (const name of names) await visit(toSpec(name, source));
  return [...resolved.values()];
}

/**
 * @name listItems
 * @description The names and descriptions of every item in a registry.
 *
 * @example
 * for (const item of await listItems(registrySource(undefined))) console.log(item.name)
 */
export async function listItems(source: RegistrySource): Promise<RegistryItem[]> {
  if (source.kind === "bundled") {
    return JSON.parse(readFileSync(new URL("../registry/registry.json", import.meta.url), "utf8"))
      .items;
  }
  const response = await fetch(`${source.url}/r/registry.json`);
  if (!response.ok) throw new Error(`${source.url}/r/registry.json answered ${response.status}`);
  return (await response.json()).items;
}

/**
 * @name loadAlternatives
 * @description Loads the items that the setup questions of `items` could add
 * but were not picked, so their versions of a file count as unchanged
 * registry files.
 *
 * @example
 * const alternatives = await loadAlternatives(items, source) // [feedback-postgres, ...]
 */
export async function loadAlternatives(items: RegistryItem[], source: RegistrySource) {
  const names = new Set(items.map((item) => item.name));
  const alternatives = items
    .flatMap((item) => item.meta?.options?.choices ?? [])
    .flatMap((choice) => (choice.item && !names.has(choice.item) ? [choice.item] : []));
  return Promise.all([...new Set(alternatives)].map((name) => loadItem({ source, name })));
}
