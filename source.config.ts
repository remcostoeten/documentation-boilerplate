import { type RehypeCodeOptions, rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import * as z from "zod";

type Transformer = NonNullable<RehypeCodeOptions["transformers"]>[number];

const transformerLanguage: Transformer = {
  name: "language",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
  },
};

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      sidebarTitle: z.string().min(1).optional(),
      sidebarBadge: z.string().min(1).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: { light: "github-light", dark: "github-dark-default" },
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerLanguage],
    },
  },
});
