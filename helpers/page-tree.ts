import type { Node } from "fumadocs-core/page-tree";
import type { LoaderPlugin } from "fumadocs-core/source";
import * as z from "zod";

const sidebarMetadataSchema = z.object({
  sidebarTitle: z.string().optional().catch(undefined),
  sidebarBadge: z.string().optional().catch(undefined),
});

export type SidebarPageNode = Extract<Node, { type: "page" }> &
  z.infer<typeof sidebarMetadataSchema>;

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
 * @name sidebarMetadataPlugin
 * @description Copies the `sidebarTitle` and `sidebarBadge` frontmatter of each
 * page onto its page tree node so the sidebar can render them.
 *
 * @example
 * loader({ source, plugins: [sidebarMetadataPlugin()] })
 */
export function sidebarMetadataPlugin(): LoaderPlugin {
  return {
    name: "sidebar-metadata",
    transformPageTree: {
      file(node, file) {
        const sourceFile = file ? this.storage.read(file) : undefined;
        const metadata = sidebarMetadataSchema.safeParse(sourceFile?.data);
        if (metadata.success) Object.assign(node, metadata.data);
        return node;
      },
    },
  };
}
