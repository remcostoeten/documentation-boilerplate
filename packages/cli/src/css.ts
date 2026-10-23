import postcss, { type AtRule, type Container, type Root } from "postcss";
import type { CssTree } from "./registry";

function splitAtRule(key: string) {
  const [name, ...params] = key.slice(1).split(" ");
  return { name, params: params.join(" ") };
}

function findChild(parent: Container, key: string) {
  return parent.nodes?.find((node) => {
    if (key.startsWith("@")) {
      const { name, params } = splitAtRule(key);
      return node.type === "atrule" && node.name === name && node.params === params;
    }
    return node.type === "rule" && node.selector === key;
  });
}

function mergeTree(parent: Container, tree: CssTree) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") {
      const existing = parent.nodes?.find((node) => node.type === "decl" && node.prop === key);
      if (existing?.type === "decl") existing.value = value;
      else parent.append({ prop: key, value });
      continue;
    }
    const existing = findChild(parent, key);
    if (existing && "nodes" in existing) {
      mergeTree(existing, value);
      continue;
    }
    const container = key.startsWith("@")
      ? postcss.atRule(splitAtRule(key))
      : postcss.rule({ selector: key });
    mergeTree(container, value);
    parent.append(container);
  }
}

function themeBlock(root: Root) {
  const existing = root.nodes.find(
    (node): node is AtRule => node.type === "atrule" && node.name === "theme" && node.params === "",
  );
  if (existing) return existing;
  const block = postcss.atRule({ name: "theme", params: "" });
  const lastImport = root.nodes.findLast(
    (node) => node.type === "atrule" && node.name === "import",
  );
  if (lastImport) lastImport.after(block);
  else root.prepend(block);
  return block;
}

/**
 * @name mergeCss
 * @description Adds registry styles to a stylesheet: theme variables go into
 * the `@theme` block, rules and at-rules are merged into matching ones or
 * appended. Existing rules that the registry does not mention stay.
 *
 * @example
 * const next = mergeCss(globals, { "ease-hover": "ease" }, { "@utility pressable": { ... } })
 */
export function mergeCss(source: string, theme: Record<string, string>, css: CssTree) {
  const root = postcss.parse(source);
  const variables = Object.entries(theme);
  if (variables.length > 0) {
    mergeTree(
      themeBlock(root),
      Object.fromEntries(variables.map(([key, value]) => [`--${key}`, value])),
    );
  }
  mergeTree(root, css);
  return root.toString();
}
