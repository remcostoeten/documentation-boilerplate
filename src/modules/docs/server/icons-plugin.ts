import "server-only";
import type { Node } from "fumadocs-core/page-tree";
import type { LoaderPlugin } from "fumadocs-core/source";
import { createElement } from "react";
import { handIcons, isHandIconName } from "@/shared/icons/icons";

function replaceIcon<TNode extends Node>(node: TNode) {
  if (typeof node.icon !== "string") return node;
  if (isHandIconName(node.icon)) {
    node.icon = createElement(handIcons[node.icon]);
  } else {
    console.warn(`[hand-icons] Unknown icon "${node.icon}".`);
    node.icon = undefined;
  }
  return node;
}

/**
 * @name handIconsPlugin
 * @description Resolves the `icon` name of pages, folders and separators to a
 * hand-drawn icon from `src/shared/icons`.
 *
 * @example
 * loader({ source, plugins: [handIconsPlugin()] })
 */
export function handIconsPlugin(): LoaderPlugin {
  return {
    name: "hand-icons",
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon,
    },
  };
}
