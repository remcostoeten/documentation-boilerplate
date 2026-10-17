import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs-sidebar";
import { Topbar } from "@/components/topbar";
import { source } from "@/helpers/source";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.getPageTree();

  return (
    <>
      <Topbar />
      <DocsSidebar tree={tree} />
      <DocsLayout
        tree={tree}
        nav={{ enabled: false }}
        searchToggle={{ enabled: false }}
        themeSwitch={{ enabled: false }}
        sidebar={{ enabled: false }}
        containerProps={{ className: "docs-layout" }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
