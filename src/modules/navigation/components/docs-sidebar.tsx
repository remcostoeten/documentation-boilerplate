"use client";

import type { Root } from "fumadocs-core/page-tree";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useMobileDialog } from "../hooks/use-mobile-dialog";
import { setMobileNavigationOpen, useMobileNavigationOpen } from "../hooks/use-mobile-navigation";
import { getNavigationSections } from "../utils/navigation-sections";
import { SearchButton } from "./search-button";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarNavigation } from "./sidebar-navigation";

type Props = { tree: Root };

export function DocsSidebar({ tree }: Props) {
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
