import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/modules/docs/server/source";
import { DocsSidebar, Topbar } from "@/modules/navigation";

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
