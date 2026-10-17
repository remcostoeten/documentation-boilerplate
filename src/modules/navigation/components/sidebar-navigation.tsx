"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/shared/helpers/cn";
import { ChevronIcon, FolderIcon } from "@/shared/icons/icons";
import type { NavigationSection } from "../types/navigation";
import { getDefaultOpen } from "../utils/navigation-sections";
import { NavigationNodes } from "./navigation-nodes";

type Props = {
  sections: NavigationSection[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

export function SidebarNavigation({ sections, pathname, mobile = false, onNavigate }: Props) {
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
                  "flex w-full items-center gap-2 border-b border-foreground/6 text-left text-sm font-medium transition-colors duration-150 ease-hover focus-visible:bg-foreground/6 focus-visible:text-foreground",
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
                <ChevronIcon
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-snappy",
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
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: { type: "spring", duration: 0.25, bounce: 0 },
                    }}
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
