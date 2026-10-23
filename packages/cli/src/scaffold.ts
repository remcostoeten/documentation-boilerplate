export type TemplateFile = {
  path: string;
  content: string;
};

export type TemplateExclusions = {
  paths: string[];
  packages: string[];
};

export type AskAIAnswer = {
  provider: "anthropic" | "openai" | "google" | "openrouter";
  model: string;
};

export type ProjectDetails = {
  packageName: string;
  siteName: string;
  description: string;
  url: string;
  author: string;
  accent: { light: string; dark: string } | null;
  exampleDocs: boolean;
  askAI: AskAIAnswer | null;
  feedback: boolean;
  footer: boolean;
  changelog: boolean;
  pageMeta: boolean;
};

const boilerplateRepository = "https://github.com/remcostoeten/docs-boilerplate";
const excludedPaths = [
  "packages/",
  "scripts/registry/",
  "CHANGELOG.md",
  "README.md",
  "llms.txt",
  "PROMPT_GUIDE.md",
  "skills/",
  "content/docs/guides/ai-agents.mdx",
];
const registryPackages = ["postcss"];
const removedPackageFields = [
  "homepage",
  "bugs",
  "repository",
  "author",
  "keywords",
  "description",
];

function stripPackageJson(content: string, packages: string[]) {
  const manifest = JSON.parse(content);
  for (const field of removedPackageFields) delete manifest[field];
  for (const name of [...packages, ...registryPackages]) {
    delete manifest.dependencies?.[name];
    delete manifest.devDependencies?.[name];
  }
  delete manifest.scripts["build:registry"];
  for (const [name, script] of Object.entries<string>(manifest.scripts)) {
    manifest.scripts[name] = script.replace("bun run build:registry && ", "");
  }
  manifest.version = "0.1.0";
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function stripSidebarLinks(content: string) {
  const meta = JSON.parse(content);
  meta.pages = meta.pages.filter(
    (page: string) => page !== "---Links---" && !page.includes(boilerplateRepository),
  );
  return `${JSON.stringify(meta, null, 2)}\n`;
}

const agentsPage = "/docs/guides/ai-agents";

function stripAgentsPage(file: TemplateFile) {
  if (file.path === "content/docs/guides/meta.json") {
    const meta = JSON.parse(file.content);
    meta.pages = meta.pages.filter((page: string) => page !== "ai-agents");
    return { ...file, content: `${JSON.stringify(meta, null, 2)}\n` };
  }
  if (!file.content.includes(agentsPage)) return file;
  const lines = file.content.split("\n").filter((line) => !line.includes(agentsPage));
  return { ...file, content: lines.join("\n").replace(/\n{3,}/g, "\n\n") };
}

const siteAnchor = "export const site: SiteConfig = {";

function checkSiteAnchor(file: TemplateFile) {
  if (!file.content.includes(siteAnchor))
    throw new Error(`${file.path} no longer contains ${siteAnchor}`);
  return file;
}

function stripSection(file: TemplateFile, heading: string) {
  const start = file.content.indexOf(`\n## ${heading}\n`);
  if (start === -1) throw new Error(`${file.path} no longer has a ${heading} section`);
  const next = file.content.indexOf("\n## ", start + 1);
  const rest = next === -1 ? "" : file.content.slice(next);
  return { ...file, content: `${file.content.slice(0, start).trimEnd()}\n${rest}` };
}

/**
 * @name prepareTemplate
 * @description Turns the files of the boilerplate repository into the
 * template the CLI ships: drops this package, the changelog, the README, the
 * repository `llms.txt`, the prompt guide, the skills, the AI agents page and
 * the files and packages of optional modules, and removes package fields and
 * links that point at the boilerplate. Throws when a file no longer has the shape it expects.
 *
 * @example
 * const template = prepareTemplate(readRepositoryFiles(root), templateExclusions());
 */
export function prepareTemplate(files: TemplateFile[], exclusions: TemplateExclusions) {
  return files
    .filter((file) => !excludedPaths.some((path) => file.path.startsWith(path)))
    .filter((file) => !exclusions.paths.includes(file.path))
    .map((file) => {
      if (file.path === "package.json") {
        return { ...file, content: stripPackageJson(file.content, exclusions.packages) };
      }
      if (file.path === "content/docs/meta.json") {
        return { ...file, content: stripSidebarLinks(file.content) };
      }
      if (file.path === "src/shared/config/site.ts") return checkSiteAnchor(file);
      if (file.path === "AGENTS.md") return stripSection(stripSection(file, "Registry"), "CLI");
      return stripAgentsPage(file);
    });
}

function renderReadme(siteName: string) {
  return `<h1 align="center">${siteName}</h1>

Documentation site built on Next.js and Fumadocs. Pages are MDX files in \`content/docs\`, and the site name, logo, theme and features are set in \`src/shared/config/site.ts\`.

## Development

Requires [Bun](https://bun.sh).

\`\`\`bash
bun install        # install dependencies and generate .source
bun dev            # start the dev server on localhost:3000
bun run check      # format and lint through vp
bun run typecheck  # regenerate .source and route types, then tsc
bun test           # run the tests
bun run build      # sync the changelog, check internal links, then build for production
\`\`\`
`;
}

function renderChangelog() {
  return `# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- Documentation site.
`;
}

const keyVariables: Record<AskAIAnswer["provider"], string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

function quote(value: string) {
  return JSON.stringify(value);
}

function renderSite(details: ProjectDetails) {
  const docsLinks = [
    `          { label: "Introduction", href: "/docs" },`,
    details.exampleDocs &&
      `          { label: "Configuration", href: "/docs/components/reference/configuration" },`,
    details.changelog && `          { label: "Changelog", href: "/docs/changelog" },`,
  ].filter(Boolean);
  const footer = details.footer
    ? `{
    brand: { description: ${quote(details.description)} },
    columns: [
      {
        title: "Docs",
        links: [
${docsLinks.join("\n")}
        ],
      },
    ],
    bottom: { copyright: ${quote(`© {year} ${details.author}`)} },
  }`
    : "null";
  const accent = details.accent
    ? `{ light: ${quote(details.accent.light)}, dark: ${quote(details.accent.dark)} }`
    : "null";
  const askAI = details.askAI
    ? `{ provider: ${quote(details.askAI.provider)}, model: ${quote(details.askAI.model)} }`
    : "null";
  const changelogs = details.changelog
    ? `[
    {
      file: "CHANGELOG.md",
      page: "changelog",
      title: "Changelog",
      description: "What changed in each release.",
    },
  ]`
    : "[]";

  return `${siteAnchor}
  name: ${quote(details.siteName)},
  description: ${quote(details.description)},
  url: process.env.NEXT_PUBLIC_SITE_URL ?? ${quote(details.url)},
  contentDir: "content/docs",
  author: { name: ${quote(details.author)}, url: ${quote(details.url)} },
  keywords: ["docs", "documentation"],
  logo: null,
  theme: { accent: ${accent} },
  pageFooter: {
    editLink: ${details.pageMeta},
    lastUpdated: ${details.pageMeta},
    feedback: ${details.feedback},
    prevNext: true,
  },
  siteFooter: ${footer},
  askAI: ${askAI},
  changelogs: ${changelogs},
};
`;
}

function personalizeSite(file: TemplateFile, details: ProjectDetails) {
  return {
    ...file,
    content: file.content.slice(0, file.content.indexOf(siteAnchor)) + renderSite(details),
  };
}

function personalizePackageJson(content: string, packageName: string) {
  const manifest = JSON.parse(content);
  delete manifest.name;
  return `${JSON.stringify({ name: packageName, ...manifest }, null, 2)}\n`;
}

function personalizeMeta(content: string, details: ProjectDetails) {
  const meta = JSON.parse(content);
  if (!details.changelog) meta.pages = meta.pages.filter((page: string) => page !== "changelog");
  return `${JSON.stringify(meta, null, 2)}\n`;
}

function renderStarterPage(details: ProjectDetails) {
  return `---
title: Introduction
description: ${details.description}
icon: House
---

Welcome to the ${details.siteName} documentation.

Pages are MDX files in \`content/docs\`. The sidebar is built from \`content/docs/meta.json\`, and the site itself is configured in \`src/shared/config/site.ts\`.

<Cards>
  <Card
    icon={<RocketIcon />}
    title="Getting started"
    href="/docs/getting-started"
    description="Add a page and put it in the sidebar."
  />
  <Card
    icon={<BookIcon />}
    title="Writing content"
    href="/docs/writing-content"
    description="Callouts, tabs, steps and code blocks."
  />
</Cards>
`;
}

function renderGettingStartedPage() {
  return `---
title: Getting started
description: Add a page, put it in the sidebar and preview it.
icon: Rocket
---

<Steps>
<Step>

### Create the file

\`\`\`mdx title="content/docs/my-page.mdx"
---
title: My page
description: One line under the title.
icon: FileText
---

Hello.
\`\`\`

Only \`title\` is required. The file name becomes the URL, so this page is \`/docs/my-page\`.

</Step>
<Step>

### Put it in the sidebar

Add \`"my-page"\` to the \`pages\` array in \`content/docs/meta.json\`.

\`\`\`json title="content/docs/meta.json"
{
  "title": "Docs",
  "root": true,
  "pages": ["index", "getting-started", "writing-content", "my-page"]
}
\`\`\`

</Step>
<Step>

### Preview it

Run the dev server and open the page. Changes to MDX files show up without a restart.

\`\`\`bash
bun dev
\`\`\`

</Step>
</Steps>

<Callout title="Folders become sections">
  Put pages in a folder with its own \`meta.json\` to group them in the sidebar.
</Callout>
`;
}

function renderWritingContentPage() {
  return `---
title: Writing content
description: The building blocks available in every page.
icon: Pencil
---

## Callouts

<Callout type="info" title="Info">
  Use callouts for what the reader should not skip.
</Callout>

<Callout type="warn" title="Warning">
  Renaming a file changes its URL.
</Callout>

## Tabs

<Tabs items={["bun", "npm"]}>
  <Tab value="bun">\`bun add some-package\`</Tab>
  <Tab value="npm">\`npm install some-package\`</Tab>
</Tabs>

## Code blocks

Add a \`title\` to show a file name.

\`\`\`ts title="src/greet.ts"
export function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\`

## Tables

| Field         | Where                         |
| ------------- | ----------------------------- |
| Page order    | \`meta.json\`                 |
| Title, icon   | Page frontmatter              |
| Site settings | \`src/shared/config/site.ts\` |
`;
}

function starterDocs(details: ProjectDetails): TemplateFile[] {
  const pages = [
    "index",
    "getting-started",
    "writing-content",
    ...(details.changelog ? ["changelog"] : []),
  ];
  return [
    { path: "content/docs/index.mdx", content: renderStarterPage(details) },
    { path: "content/docs/getting-started.mdx", content: renderGettingStartedPage() },
    { path: "content/docs/writing-content.mdx", content: renderWritingContentPage() },
    {
      path: "content/docs/meta.json",
      content: `${JSON.stringify({ title: details.siteName, root: true, pages }, null, 2)}\n`,
    },
  ];
}

/**
 * @name personalizeTemplate
 * @description Fills the template with the answers for a new project: writes
 * the site config, the package name, a README and a changelog, and replaces
 * the example docs with a starter page when they are not wanted.
 *
 * @example
 * const files = personalizeTemplate(template, details);
 */
export function personalizeTemplate(files: TemplateFile[], details: ProjectDetails) {
  const personalized = files
    .filter((file) => details.exampleDocs || !file.path.startsWith("content/docs/"))
    .map((file) => {
      if (file.path === "package.json") {
        return { ...file, content: personalizePackageJson(file.content, details.packageName) };
      }
      if (file.path === "content/docs/meta.json") {
        return { ...file, content: personalizeMeta(file.content, details) };
      }
      if (file.path === "src/shared/config/site.ts") return personalizeSite(file, details);
      return file;
    });
  return [
    ...personalized,
    ...(details.exampleDocs ? [] : starterDocs(details)),
    { path: "README.md", content: renderReadme(details.siteName) },
    ...(details.changelog ? [{ path: "CHANGELOG.md", content: renderChangelog() }] : []),
  ];
}

/**
 * @name envLines
 * @description The variables a new project needs in `.env.local` for its answers.
 *
 * @example
 * envLines(details) // ["OPENROUTER_API_KEY="]
 */
export function envLines(details: ProjectDetails) {
  return details.askAI ? [`${keyVariables[details.askAI.provider]}=`] : [];
}

/**
 * @name toPackageName
 * @description Derives a valid npm package name from a directory name.
 *
 * @example
 * toPackageName("My Docs!"); // "my-docs"
 */
export function toPackageName(directory: string) {
  const name = directory
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "");
  return name || "docs";
}

/**
 * @name toSiteName
 * @description Derives a readable site name from a directory name.
 *
 * @example
 * toSiteName("acme-docs"); // "Acme Docs"
 */
export function toSiteName(directory: string) {
  const words = directory.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (words.length === 0) return "Docs";
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
