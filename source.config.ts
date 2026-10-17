import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import * as z from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      sidebarTitle: z.string().min(1).optional(),
      sidebarBadge: z.string().min(1).optional(),
    }),
  },
});

export default defineConfig();
