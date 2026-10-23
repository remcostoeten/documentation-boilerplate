import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import postcss, { type ChildNode } from "postcss";
import { site } from "../../src/shared/config/site";
import {
  itemFileEntries,
  platformPackages,
  type RegistryItem,
  registryItems,
  repositoryRoot,
} from "./items";

type CssTree = { [key: string]: string | CssTree };

const outputDir = join(repositoryRoot, "public/r");
const manifest = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
const versions: Record<string, string> = { ...manifest.devDependencies, ...manifest.dependencies };

function itemUrl(name: string) {
  return new URL(`/r/${name}.json`, site.url).href;
}

function cssTree(nodes: ChildNode[]) {
  const tree: CssTree = {};
  for (const node of nodes) {
    if (node.type === "decl") tree[node.prop] = node.value;
    if (node.type === "rule") tree[node.selector] = cssTree(node.nodes);
    if (node.type === "atrule")
      tree[`@${node.name} ${node.params}`.trim()] = cssTree(node.nodes ?? []);
  }
  return tree;
}

function splitCss(source: string) {
  const theme: Record<string, string> = {};
  const rest: ChildNode[] = [];
  for (const node of postcss.parse(source).nodes) {
    if (node.type === "atrule" && node.name === "theme") {
      node.walkDecls((decl) => {
        theme[decl.prop.replace(/^--/, "")] = decl.value;
      });
      continue;
    }
    rest.push(node);
  }
  return { cssVars: { theme }, css: cssTree(rest) };
}

function withVersion(name: string) {
  const version = versions[name];
  if (!version) throw new Error(`${name} is not in package.json`);
  return `${name}@${version}`;
}

function buildItem(item: RegistryItem) {
  const files = itemFileEntries(item);
  const styles = files
    .filter((file) => file.path.endsWith(".css"))
    .map((file) => splitCss(readFileSync(join(repositoryRoot, file.path), "utf8")));

  return {
    name: item.name,
    type: "registry:block",
    title: item.title,
    description: item.description,
    dependencies: item.dependencies
      .filter((name) => !platformPackages.includes(name))
      .map(withVersion),
    registryDependencies: item.registryDependencies.map(itemUrl),
    files: files.map((file) => ({
      path: file.target,
      type: "registry:file",
      target: file.target,
      content: readFileSync(join(repositoryRoot, file.path), "utf8"),
    })),
    envVars: item.envVars,
    docs: item.docs,
    meta: item.options && { options: item.options },
    ...(styles.length > 0 && {
      cssVars: { theme: Object.assign({}, ...styles.map((style) => style.cssVars.theme)) },
      css: Object.assign({}, ...styles.map((style) => style.css)),
    }),
  };
}

/**
 * @name buildRegistry
 * @description Writes a shadcn registry to `public/r`: one item file per entry
 * in `registryItems` with the source inlined, and `registry.json` listing them.
 *
 * @example
 * await buildRegistry() // ["core", "icons", ...]
 */
export function buildRegistry() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const items = registryItems.map(buildItem);
  for (const item of items) {
    const file = { $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item };
    writeFileSync(join(outputDir, `${item.name}.json`), `${JSON.stringify(file, null, 2)}\n`);
  }

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: manifest.name,
    homepage: site.url,
    items: items.map((item) => ({
      ...item,
      files: item.files.map(({ path, type, target }) => ({ path, type, target })),
    })),
  };
  writeFileSync(join(outputDir, "registry.json"), `${JSON.stringify(index, null, 2)}\n`);
  return items.map((item) => item.name);
}

if (import.meta.main) {
  console.log(`✓ registry ${buildRegistry().join(", ")}`);
}
