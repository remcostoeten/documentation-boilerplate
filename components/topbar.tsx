"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { setMobileNavigationOpen, useMobileNavigationOpen } from "@/helpers/mobile-navigation";
import { site } from "@/helpers/site";

export function Topbar() {
  const open = useMobileNavigationOpen();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-(--topbar-height) items-center border-b border-foreground/5 bg-background">
      <Link
        href="/docs"
        className="flex h-full items-center px-4 font-mono text-xs tracking-wider uppercase transition-colors duration-150 ease-out hover:bg-foreground/3 focus-visible:bg-foreground/6 lg:w-(--sidebar-width) lg:border-r lg:border-foreground/5"
      >
        {site.name}
      </Link>
      <button
        type="button"
        data-mobile-navigation-trigger
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setMobileNavigationOpen(!open)}
        className="ms-auto inline-flex size-(--topbar-height) items-center justify-center text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground focus-visible:bg-foreground/6 focus-visible:text-foreground lg:hidden"
      >
        {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
      </button>
    </header>
  );
}
