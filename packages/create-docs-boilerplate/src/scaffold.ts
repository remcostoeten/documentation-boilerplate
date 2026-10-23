export type TemplateFile = {
  path: string;
  content: string;
};

export type ProjectDetails = {
  packageName: string;
  siteName: string;
  author: string;
};

const boilerplateRepository = "https://github.com/remcostoeten/docs-boilerplate";
const excludedPaths = ["packages/", "CHANGELOG.md", "README.md"];
const removedPackageFields = [
  "homepage",
  "bugs",
  "repository",
  "author",
  "keywords",
  "description",
];

function replaceExact(file: TemplateFile, from: string, to: string) {
  if (!file.content.includes(from)) {
    throw new Error(`${file.path} no longer contains ${JSON.stringify(from)}`);
  }
  return { ...file, content: file.content.replace(from, to) };
}

function stripPackageJson(content: string) {
  const manifest = JSON.parse(content);
  for (const field of removedPackageFields) delete manifest[field];
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

// Matches the footer column object that links to the boilerplate repository
const boilerplateColumnPattern = new RegExp(
  `\\n {6}\\{\\n {8}title: "[^"]+",\\n {8}links: \\[(?:(?!\\n {6}\\},)[\\s\\S])*?${boilerplateRepository}[\\s\\S]*?\\n {6}\\},`,
);

function stripFooterLinks(file: TemplateFile) {
  if (!boilerplateColumnPattern.test(file.content)) {
    throw new Error(
      `${file.path} no longer has a footer column linking to ${boilerplateRepository}`,
    );
  }
  return { ...file, content: file.content.replace(boilerplateColumnPattern, "") };
}

/**
 * @name prepareTemplate
 * @description Turns the files of the boilerplate repository into the
 * template the CLI ships: drops this package, the changelog and the README,
 * and removes package fields and links that point at the boilerplate. Throws
 * when a file no longer has the shape it expects.
 *
 * @example
 * const template = prepareTemplate(readRepositoryFiles());
 */
export function prepareTemplate(files: TemplateFile[]) {
  return files
    .filter((file) => !excludedPaths.some((path) => file.path.startsWith(path)))
    .map((file) => {
      if (file.path === "package.json") {
        return { ...file, content: stripPackageJson(file.content) };
      }
      if (file.path === "content/docs/meta.json") {
        return { ...file, content: stripSidebarLinks(file.content) };
      }
      if (file.path === "src/shared/config/site.ts") return stripFooterLinks(file);
      return file;
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

function personalizeSite(file: TemplateFile, details: ProjectDetails) {
  const named = replaceExact(file, `name: "Docs",`, `name: ${JSON.stringify(details.siteName)},`);
  const authored = replaceExact(
    named,
    `author: { name: "Remco Stoeten", url: "https://remcostoeten.com" },`,
    `author: { name: ${JSON.stringify(details.author)}, url: "" },`,
  );
  return replaceExact(
    authored,
    `copyright: "© {year} Remco Stoeten",`,
    `copyright: ${JSON.stringify(`© {year} ${details.author}`)},`,
  );
}

function personalizePackageJson(content: string, packageName: string) {
  const manifest = JSON.parse(content);
  delete manifest.name;
  return `${JSON.stringify({ name: packageName, ...manifest }, null, 2)}\n`;
}

/**
 * @name personalizeTemplate
 * @description Fills the template with the details of a new project: the
 * package name, the site name, and the author, and adds a
 * fresh README and changelog.
 *
 * @example
 * const files = personalizeTemplate(template, {
 *   packageName: "my-docs",
 *   siteName: "My Docs",
 *   author: "Ada Lovelace",
 * });
 */
export function personalizeTemplate(files: TemplateFile[], details: ProjectDetails) {
  const personalized = files.map((file) => {
    if (file.path === "package.json") {
      return { ...file, content: personalizePackageJson(file.content, details.packageName) };
    }
    if (file.path === "src/shared/config/site.ts") return personalizeSite(file, details);
    return file;
  });
  return [
    ...personalized,
    { path: "README.md", content: renderReadme(details.siteName) },
    { path: "CHANGELOG.md", content: renderChangelog() },
  ];
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
