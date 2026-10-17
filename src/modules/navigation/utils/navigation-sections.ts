import type { Node, Root } from "fumadocs-core/page-tree";
import { createElement } from "react";
import { BookIcon } from "@/shared/icons/icons";
import type { NavigationSection } from "../types/navigation";

/**
 * @name isPathWithinFolderIndex
 * @description True when the pathname is a folder's index page or any page
 * below it.
 *
 * @example
 * isPathWithinFolderIndex("/docs/guides", "/docs/guides/deployment") // true
 */
export function isPathWithinFolderIndex(indexUrl: string | undefined, pathname: string) {
  return indexUrl === pathname || (indexUrl !== undefined && pathname.startsWith(`${indexUrl}/`));
}

/**
 * @name getNavigationSections
 * @description Turns the page tree into sidebar sections: root pages become
 * one section and every top-level folder becomes its own section.
 *
 * @example
 * const sections = getNavigationSections(tree)
 */
export function getNavigationSections(tree: Root): NavigationSection[] {
  const rootChildren = tree.children.filter((node) => node.type !== "folder");
  const sections: NavigationSection[] = [];

  if (rootChildren.length > 0) {
    sections.push({
      id: tree.$id ?? "root",
      name: tree.name,
      icon: createElement(BookIcon),
      children: rootChildren,
    });
  }

  for (const node of tree.children) {
    if (node.type !== "folder") continue;
    sections.push({
      id: node.$id ?? `folder-${sections.length}`,
      name: node.name,
      icon: node.icon,
      index: node.index,
      children: node.children,
    });
  }

  return sections;
}

/**
 * @name nodeContainsPath
 * @description True when the node is the page at the pathname or contains it.
 *
 * @example
 * nodeContainsPath(folder, "/docs/guides/theming") // true
 */
export function nodeContainsPath(node: Node, pathname: string): boolean {
  if (node.type === "separator") return false;
  if (node.type === "page") return node.url === pathname;
  return (
    isPathWithinFolderIndex(node.index?.url, pathname) ||
    node.children.some((child) => nodeContainsPath(child, pathname))
  );
}

/**
 * @name getDefaultOpen
 * @description Index of the section that holds the current page, falling back
 * to the first section.
 *
 * @example
 * const [open, setOpen] = useState(() => getDefaultOpen(sections, pathname))
 */
export function getDefaultOpen(sections: NavigationSection[], pathname: string) {
  const index = sections.findIndex(
    (section) =>
      isPathWithinFolderIndex(section.index?.url, pathname) ||
      section.children.some((node) => nodeContainsPath(node, pathname)),
  );
  return index === -1 ? 0 : index;
}
