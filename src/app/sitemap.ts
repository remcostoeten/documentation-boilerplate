import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/modules/docs/server/seo";
import { source } from "@/modules/docs/server/source";
import { site } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: absoluteUrl(page.url),
    lastModified: page.data.lastModified,
    changeFrequency: "weekly" as const,
    priority: page.slugs.length === 0 ? (site.landing ? 0.9 : 1) : 0.7,
  }));
  if (!site.landing) return pages;
  return [{ url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 }, ...pages];
}
