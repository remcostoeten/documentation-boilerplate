import type { ComponentType, SVGProps } from "react";
import type { AskAIConfig } from "@/modules/ask-ai/types";
import type { ChangelogConfig } from "@/modules/changelog/types";
import type { FooterConfig } from "@/modules/footer/types";

export type LogoSource = string | ComponentType<SVGProps<SVGSVGElement>>;

export type FaviconConfig = string | { light: string; dark: string };

export type LogoConfig = {
  src: LogoSource;
  darkSrc?: LogoSource;
  alt?: string;
  width: number;
  height: number;
  hideName?: boolean;
};

export type AccentConfig = {
  light: string;
  dark: string;
};

export type ThemeConfig = {
  accent: AccentConfig | null;
  radius?: string;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  repository?: string | false;
  branch?: string;
  contentDir: string;
  author: { name: string; url: string };
  keywords: string[];
  logo: LogoConfig | null;
  favicon?: FaviconConfig;
  theme: ThemeConfig;
  pageFooter: { editLink: boolean; lastUpdated: boolean; feedback: boolean; prevNext: boolean };
  siteFooter: FooterConfig | null;
  changelogs: ChangelogConfig[];
  askAI: AskAIConfig | null;
};

export const site: SiteConfig = {
  name: "Docs",
  description:
    "Documentation site boilerplate built on Next.js and Fumadocs, with an animated accordion sidebar, MDX content and built-in search.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contentDir: "content/docs",
  author: { name: "Remco Stoeten", url: "https://remcostoeten.com" },
  keywords: ["docs", "documentation", "boilerplate", "nextjs", "fumadocs", "mdx"],
  logo: null,
  theme: { accent: null },
  pageFooter: { editLink: true, lastUpdated: true, feedback: true, prevNext: true },
  siteFooter: {
    brand: { description: "Documentation site boilerplate built on Next.js and Fumadocs." },
    columns: [
      {
        title: "Docs",
        links: [
          { label: "Introduction", href: "/docs" },
          { label: "Configuration", href: "/docs/components/reference/configuration" },
        ],
      },
      {
        title: "Community",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/remcostoeten/docs-boilerplate",
            icon: "GitHub",
          },
        ],
      },
    ],
    bottom: {
      copyright: "© {year} Remco Stoeten",
      links: [{ label: "Contact", href: "mailto:hello@example.com", icon: "Mail" }],
    },
  },
  askAI: { provider: "openrouter", model: "anthropic/claude-haiku-5-5" },
  changelogs: [
    {
      file: "CHANGELOG.md",
      page: "changelog",
      title: "Changelog",
      description: "What changed in each release.",
    },
  ],
};
