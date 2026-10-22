export type ChangelogConfig = {
  file: string;
  page: string;
  title: string;
  description: string;
  skipPrereleases?: boolean;
  editUrl?: string | false;
};

export const site = {
  name: "Docs",
  description:
    "Documentation site boilerplate built on Next.js and Fumadocs, with an animated accordion sidebar, MDX content and built-in search.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  repository: "https://github.com/remcostoeten/docs-boilerplate",
  branch: "master",
  contentDir: "content/docs",
  author: { name: "Remco Stoeten", url: "https://remcostoeten.com" },
  keywords: ["docs", "documentation", "boilerplate", "nextjs", "fumadocs", "mdx"],
  changelogs: [
    {
      file: "CHANGELOG.md",
      page: "changelog",
      title: "Changelog",
      description: "What changed in each release.",
    },
  ] as ChangelogConfig[],
};
