type ChangelogSource = { file: string; url?: never } | { url: string; file?: never };

export type ChangelogConfig = ChangelogSource & {
  page: string;
  title: string;
  description: string;
  skipPrereleases?: boolean;
  editUrl?: string | false;
};

type SiteConfig = {
  name: string;
  description: string;
  url: string;
  repository?: string | false;
  branch?: string;
  contentDir: string;
  author: { name: string; url: string };
  keywords: string[];
  pageFooter: { editLink: boolean; lastUpdated: boolean };
  changelogs: ChangelogConfig[];
};

export const site: SiteConfig = {
  name: "Docs",
  description:
    "Documentation site boilerplate built on Next.js and Fumadocs, with an animated accordion sidebar, MDX content and built-in search.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contentDir: "content/docs",
  author: { name: "Remco Stoeten", url: "https://remcostoeten.com" },
  keywords: ["docs", "documentation", "boilerplate", "nextjs", "fumadocs", "mdx"],
  pageFooter: { editLink: true, lastUpdated: true },
  changelogs: [
    {
      file: "CHANGELOG.md",
      page: "changelog",
      title: "Changelog",
      description: "What changed in each release.",
    },
  ],
};
