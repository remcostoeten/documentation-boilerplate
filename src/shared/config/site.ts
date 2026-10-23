import type { ComponentType, SVGProps } from "react";
import type { AskAIConfig } from "@/modules/ask-ai/types";

type ChangelogSource = { file: string; url?: never } | { url: string; file?: never };

export type ChangelogConfig = ChangelogSource & {
  page: string;
  title: string;
  description: string;
  skipPrereleases?: boolean;
  editUrl?: string | false;
};

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

export type FooterLink = { label: string; href: string };

export type FooterColumn = { title: string; links: FooterLink[] };

export type FooterConfig = {
  columns: FooterColumn[];
  copyright?: string;
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
  footer: FooterConfig | null;
  landing?: boolean;
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
  footer: null,
  landing: true,
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
