import "server-only";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "collections/server";
import { sidebarMetadataPlugin } from "./page-tree-plugin";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  pageTree: { noRef: true },
  plugins: [sidebarMetadataPlugin(), lucideIconsPlugin()],
});
