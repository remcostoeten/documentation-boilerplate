"use client";

import type { Folder, Node } from "fumadocs-core/page-tree";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/helpers/cn";
import { nodeContainsPath } from "../utils/navigation-sections";
import { NavigationLink } from "./navigation-link";
import { NavigationSeparator } from "./navigation-separator";

type NodesProps = {
  nodes: Node[];
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
};

type NodeProps = {
  node: Node;
  pathname: string;
  onNavigate?: () => void;
  nested: boolean;
};

type FolderProps = {
  folder: Folder;
  pathname: string;
  onNavigate?: () => void;
  nested: boolean;
};

export function NavigationNodes({ nodes, pathname, onNavigate, nested = false }: NodesProps) {
  return (
    <div
      className={cn(
        "pt-0 pb-1 text-sm",
        nested &&
          "relative before:absolute before:top-0 before:bottom-0 before:left-10 before:w-px before:bg-foreground/20",
      )}
    >
      {nodes.map((node, index) => (
        <NavigationNode
          key={node.$id ?? getNodeKey(node, index)}
          node={node}
          pathname={pathname}
          onNavigate={onNavigate}
          nested={nested}
        />
      ))}
    </div>
  );
}

function getNodeKey(node: Node, index: number) {
  if (node.type === "page") return node.url;
  if (node.type === "folder") return `folder-${index}`;
  return `separator-${index}`;
}

function NavigationNode({ node, pathname, onNavigate, nested }: NodeProps) {
  if (node.type === "separator") return <NavigationSeparator>{node.name}</NavigationSeparator>;

  if (node.type === "page") {
    return (
      <NavigationLink
        node={node}
        active={node.url === pathname}
        onNavigate={onNavigate}
        nested={nested}
      />
    );
  }

  return (
    <NavigationFolder folder={node} pathname={pathname} onNavigate={onNavigate} nested={nested} />
  );
}

function NavigationFolder({ folder, pathname, onNavigate, nested }: FolderProps) {
  const active = nodeContainsPath(folder, pathname);
  const index = folder.index;

  if (!index) {
    return (
      <>
        <NavigationSeparator>{folder.name}</NavigationSeparator>
        <NavigationNodes
          nodes={folder.children}
          pathname={pathname}
          onNavigate={onNavigate}
          nested={nested}
        />
      </>
    );
  }

  const children = folder.children.filter((node) => node !== index);

  return (
    <div>
      <NavigationLink
        node={{ ...index, name: folder.name, icon: folder.icon ?? index.icon }}
        active={active}
        onNavigate={onNavigate}
        nested={nested}
      />
      <AnimatePresence initial={false}>
        {active && children.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{
              opacity: 0,
              height: 0,
              transition: { type: "spring", duration: 0.25, bounce: 0 },
            }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="overflow-hidden"
          >
            <NavigationNodes nodes={children} pathname={pathname} onNavigate={onNavigate} nested />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
