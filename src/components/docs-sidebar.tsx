"use client";

import type { Folder, Node, Root } from "fumadocs-core/page-tree";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { BookOpenIcon, ChevronDownIcon, FolderIcon, SearchIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createElement, useEffect, useId, useMemo, useRef, useState } from "react";
import { GitHubIcon } from "@/components/github-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/helpers/cn";
import { setMobileNavigationOpen, useMobileNavigationOpen } from "@/helpers/mobile-navigation";
import type { SidebarPageNode } from "@/helpers/page-tree";
import { isPathWithinFolderIndex } from "@/helpers/page-tree";
import { site } from "@/helpers/site";

type NavigationSection = {
  id: string;
  name: ReactNode;
  icon?: ReactNode;
  index?: SidebarPageNode;
  children: Node[];
};

function getNavigationSections(tree: Root): NavigationSection[] {
  const rootChildren = tree.children.filter((node) => node.type !== "folder");
  const sections: NavigationSection[] = [];

  if (rootChildren.length > 0) {
    sections.push({
      id: tree.$id ?? "root",
      name: tree.name,
      icon: createElement(BookOpenIcon),
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

function nodeContainsPath(node: Node, pathname: string): boolean {
  if (node.type === "separator") return false;
  if (node.type === "page") return node.url === pathname;
  return (
    isPathWithinFolderIndex(node.index?.url, pathname) ||
    node.children.some((child) => nodeContainsPath(child, pathname))
  );
}

function getDefaultOpen(sections: NavigationSection[], pathname: string) {
  const index = sections.findIndex(
    (section) =>
      isPathWithinFolderIndex(section.index?.url, pathname) ||
      section.children.some((node) => nodeContainsPath(node, pathname)),
  );
  return index === -1 ? 0 : index;
}

function useActiveItemScroll(active: boolean) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!active) return;
    const element = ref.current;
    const viewport = element?.closest<HTMLElement>("[data-docs-sidebar-viewport]");
    if (!element || !viewport || viewport.getClientRects().length === 0) return;

    const elementRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    if (elementRect.top >= viewportRect.top && elementRect.bottom <= viewportRect.bottom) return;

    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return ref;
}

function useMobileDialog(active: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function getFocusableElements() {
      return dialog?.querySelectorAll<HTMLElement>(focusableSelector);
    }
    getFocusableElements()?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
        return;
      }
      const focusableElements = getFocusableElements();
      if (event.key !== "Tab" || !focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const focusTarget =
        previousFocus && previousFocus !== document.body && previousFocus.isConnected
          ? previousFocus
          : document.querySelector<HTMLElement>("[data-mobile-navigation-trigger]");
      focusTarget?.focus({ preventScroll: true });
    };
  }, [active]);

  return dialogRef;
}

export function DocsSidebar({ tree }: { tree: Root }) {
  const pathname = usePathname() || "/docs";
  const mobileOpen = useMobileNavigationOpen();
  const mobileDialogRef = useMobileDialog(mobileOpen);
  const { setOpenSearch } = useSearchContext();
  const sections = useMemo(() => getNavigationSections(tree), [tree]);

  return (
    <>
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed top-(--topbar-height) bottom-0 left-0 z-30 hidden w-(--sidebar-width) flex-col border-r border-foreground/5 bg-background lg:flex"
      >
        <SearchButton onClick={() => setOpenSearch(true)} />
        <SidebarNavigation key={pathname} sections={sections} pathname={pathname} />
        <SidebarFooter />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.dialog
            ref={mobileDialogRef}
            open
            aria-modal="true"
            aria-label="Documentation navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 m-0 h-full max-h-none w-full max-w-none border-0 bg-background/95 p-0 text-foreground backdrop-blur-sm lg:hidden"
          >
            <div className="flex h-full flex-col pt-(--topbar-height)">
              <SearchButton
                onClick={() => {
                  setMobileNavigationOpen(false);
                  setOpenSearch(true);
                }}
              />
              <div data-docs-sidebar-viewport className="min-h-0 flex-1 overflow-y-auto">
                <SidebarNavigation
                  key={pathname}
                  sections={sections}
                  pathname={pathname}
                  mobile
                  onNavigate={() => setMobileNavigationOpen(false)}
                />
              </div>
              <SidebarFooter />
            </div>
          </motion.dialog>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="group/search flex w-full items-center gap-2 border-b border-foreground/5 px-4 py-[9px] text-sm text-foreground/55 transition-colors duration-150 ease-out hover:bg-foreground/3 hover:text-foreground/80 focus-visible:bg-foreground/6 focus-visible:text-foreground"
      onClick={onClick}
    >
      <SearchIcon className="size-4 shrink-0 text-foreground/40 transition-colors duration-150 ease-out group-hover/search:text-foreground/70 group-focus-visible/search:text-foreground" />
      <span className="truncate">Search</span>
      <kbd className="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-md border border-foreground/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground/40 transition-colors duration-150 ease-out group-hover/search:border-foreground/20 group-hover/search:text-foreground/60 group-focus-visible/search:border-foreground/25">
        <span className="text-[11px]">&#8984;</span>K
      </kbd>
    </button>
  );
}

function SidebarNavigation({
  sections,
  pathname,
  mobile = false,
  onNavigate,
}: {
  sections: NavigationSection[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [currentOpen, setCurrentOpen] = useState(() => getDefaultOpen(sections, pathname));
  const navigationId = useId();

  const content = (
    <MotionConfig transition={{ duration: 0.35, type: "spring", bounce: 0 }}>
      <div className="flex flex-col">
        {sections.map((section, index) => {
          const panelId = `${navigationId}-section-${index}`;
          const open = currentOpen === index;
          return (
            <div key={section.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className={cn(
                  "flex w-full items-center gap-2 border-b border-foreground/6 text-left text-sm font-medium transition-colors duration-150 ease-out focus-visible:bg-foreground/6 focus-visible:text-foreground",
                  mobile ? "px-5 py-3" : "px-4 py-2.5",
                  open
                    ? "bg-foreground/3 text-foreground"
                    : "text-foreground/70 hover:bg-foreground/3 hover:text-foreground",
                )}
                onClick={() => setCurrentOpen((previous) => (previous === index ? -1 : index))}
              >
                <span className="flex size-4.5 items-center justify-center [&>svg]:size-4.5">
                  {section.icon ?? <FolderIcon />}
                </span>
                <span className="grow">{section.name}</span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    id={panelId}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative overflow-hidden"
                  >
                    <NavigationNodes
                      nodes={section.children}
                      pathname={pathname}
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </MotionConfig>
  );

  if (mobile) return content;
  return (
    <nav
      data-docs-sidebar-viewport
      className="sidebar-viewport flex-1 overflow-x-hidden overflow-y-auto pb-3"
    >
      {content}
    </nav>
  );
}

function NavigationNodes({
  nodes,
  pathname,
  onNavigate,
  nested = false,
}: {
  nodes: Node[];
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
}) {
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

function NavigationNode({
  node,
  pathname,
  onNavigate,
  nested,
}: {
  node: Node;
  pathname: string;
  onNavigate?: () => void;
  nested: boolean;
}) {
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

function NavigationFolder({
  folder,
  pathname,
  onNavigate,
  nested,
}: {
  folder: Folder;
  pathname: string;
  onNavigate?: () => void;
  nested: boolean;
}) {
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
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <NavigationNodes nodes={children} pathname={pathname} onNavigate={onNavigate} nested />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NavigationSeparator({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-4 my-2 flex items-center gap-2 lg:mx-7">
      <p className="text-[10px] tracking-wider text-foreground/45 uppercase">{children}</p>
      <div className="h-px grow bg-border" />
    </div>
  );
}

function NavigationLink({
  node,
  active,
  onNavigate,
  nested,
}: {
  node: SidebarPageNode;
  active: boolean;
  onNavigate?: () => void;
  nested: boolean;
}) {
  const opensNewTab = node.external && node.url.startsWith("http");
  const linkRef = useActiveItemScroll(active);

  return (
    <Link
      ref={linkRef}
      href={node.url}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noreferrer noopener" : undefined}
      onClick={onNavigate}
      data-active={active || undefined}
      className={cn(
        "relative flex w-full items-center gap-2.5 py-1 text-[14px] transition-colors duration-150 ease-out focus-visible:bg-foreground/10 focus-visible:text-foreground",
        nested ? "pr-4 pl-12 text-[13px]" : "px-4",
        active
          ? "bg-foreground/6 text-foreground"
          : "text-foreground/65 hover:bg-foreground/3 hover:text-foreground/90",
      )}
    >
      <SidebarIcon icon={node.icon} />
      <span className="min-w-0 grow truncate">{node.sidebarTitle ?? node.name}</span>
      {node.sidebarBadge ? <SidebarBadge active={active}>{node.sidebarBadge}</SidebarBadge> : null}
    </Link>
  );
}

function SidebarIcon({ icon }: { icon?: ReactNode }) {
  if (icon == null) return null;
  return (
    <span className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-[14px]">
      {icon}
    </span>
  );
}

function SidebarBadge({ active, children }: { active: boolean; children: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none border px-1.5 py-0 text-[9px] tracking-wider uppercase",
        active
          ? "border-solid border-foreground/25 bg-foreground/10 text-foreground"
          : "border-dashed border-foreground/25 text-foreground/55",
      )}
    >
      {children}
    </span>
  );
}

function SidebarFooter() {
  return (
    <div className="flex items-center gap-1 border-t border-foreground/5 p-2 text-foreground/40">
      <a
        href={site.repository}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex size-8 items-center justify-center transition-colors duration-150 ease-out hover:bg-foreground/5 hover:text-foreground/70 focus-visible:bg-foreground/8 focus-visible:text-foreground"
        aria-label="GitHub"
      >
        <GitHubIcon className="size-4" />
      </a>
      <div className="ms-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
