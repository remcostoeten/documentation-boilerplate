import {
  Bot,
  FileCode,
  History,
  LayoutPanelLeft,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    title: "Accordion sidebar",
    description:
      "Sections, nested folders, separators, icons and badges, built from the folder structure and one meta.json per folder.",
    href: "/docs/concepts/sidebar",
    icon: LayoutPanelLeft,
  },
  {
    title: "Search",
    description:
      "Recent pages and a filter per sidebar section, indexed from every heading and paragraph.",
    href: "/docs/concepts/search",
    icon: Search,
  },
  {
    title: "Code blocks",
    description:
      "Server-highlighted blocks with file headers, line notation, tabs and TypeScript hover types checked at build time.",
    href: "/docs/components/code-blocks",
    icon: FileCode,
  },
  {
    title: "Markdown for every page",
    description:
      "Each page is also served as Markdown, with llms.txt, Open Graph images, a sitemap and structured data.",
    href: "/docs/concepts/seo-and-llms",
    icon: Sparkles,
  },
  {
    title: "Ask AI",
    description:
      "An optional chat that answers from your pages, with a built-in rate limit that protects the API key.",
    href: "/docs/guides/ask-ai",
    icon: Bot,
  },
  {
    title: "Changelog",
    description: "A changelog page generated from CHANGELOG.md or GitHub Releases.",
    href: "/docs/guides/changelog",
    icon: History,
  },
];
