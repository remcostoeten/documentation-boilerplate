import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/modules/docs/server/source";
import { DocsSidebar, Topbar } from "@/modules/navigation";
import { RecentPagesTracker } from "@/modules/search/components/recent-pages";
import { getRepository } from "@/shared/config/repository";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.getPageTree();
  const repositoryUrl = getRepository()?.url;

  return (
    <>
      <Topbar />
      <RecentPagesTracker />
      <DocsSidebar tree={tree} repositoryUrl={repositoryUrl} />
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
