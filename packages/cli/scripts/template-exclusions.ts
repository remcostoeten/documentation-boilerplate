import { itemFiles, registryItems } from "../../../scripts/registry/items";
import type { TemplateExclusions } from "../src/scaffold";

/**
 * @name templateExclusions
 * @description The files and packages of optional registry items, the ones a
 * setup question adds, which a new site only gets when they are picked.
 *
 * @example
 * prepareTemplate(files, templateExclusions())
 */
export function templateExclusions(): TemplateExclusions {
  const optional = new Set(
    registryItems.flatMap(
      (item) => item.options?.choices.flatMap((choice) => choice.item ?? []) ?? [],
    ),
  );
  const optionalItems = registryItems.filter((item) => optional.has(item.name));
  const keptPackages = new Set(
    registryItems.filter((item) => !optional.has(item.name)).flatMap((item) => item.dependencies),
  );
  return {
    paths: optionalItems.flatMap(itemFiles),
    packages: [...new Set(optionalItems.flatMap((item) => item.dependencies))].filter(
      (name) => !keptPackages.has(name),
    ),
  };
}
