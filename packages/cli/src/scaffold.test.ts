import { expect, test } from "bun:test";
import { join } from "node:path";
import { readRepositoryFiles } from "./repository-files";
import { templateExclusions } from "../scripts/template-exclusions";
import { personalizeTemplate, prepareTemplate, type ProjectDetails } from "./scaffold";

const template = prepareTemplate(
  readRepositoryFiles(join(import.meta.dir, "../../..")),
  templateExclusions(),
);

function content(files: { path: string; content: string }[], path: string) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`${path} is missing`);
  return file.content;
}

test("leaves this package, the changelog and the README out of the template", () => {
  const paths = template.map((file) => file.path);
  expect(paths.some((path) => path.startsWith("packages/"))).toBe(false);
  expect(paths.some((path) => path.startsWith("scripts/registry/"))).toBe(false);
  expect(paths).not.toContain("src/modules/feedback/server/stores/neon.ts");
  expect(content(template, "package.json")).not.toContain("registry");
  expect(content(template, "package.json")).not.toContain("@neondatabase/serverless");
  expect(content(template, "AGENTS.md")).not.toContain("## Registry");
  expect(content(template, "AGENTS.md")).not.toContain("## CLI");
  expect(content(template, "AGENTS.md").endsWith("\n\n")).toBe(false);
  expect(paths).not.toContain("CHANGELOG.md");
  expect(paths).not.toContain("README.md");
  expect(paths).not.toContain("llms.txt");
  expect(paths).not.toContain("PROMPT_GUIDE.md");
  expect(paths.some((path) => path.startsWith("skills/"))).toBe(false);
  expect(paths).not.toContain("content/docs/guides/ai-agents.mdx");
  expect(template.filter((file) => file.content.includes("/docs/guides/ai-agents"))).toEqual([]);
  expect(JSON.parse(content(template, "content/docs/guides/meta.json")).pages).not.toContain(
    "ai-agents",
  );
  expect(paths).toContain(".gitignore");
  expect(paths).toContain("src/shared/config/site.ts");
});

const details: ProjectDetails = {
  packageName: "acme-docs",
  siteName: "Acme Docs",
  description: "Docs for Acme.",
  url: "https://docs.acme.dev",
  author: "Ada Lovelace",
  accent: null,
  exampleDocs: true,
  askAI: null,
  feedback: true,
  footer: true,
  changelog: true,
  pageMeta: true,
};

test("writes the site config from the answers without the boilerplate's own details", () => {
  const files = personalizeTemplate(template, details);
  const manifest = JSON.parse(content(files, "package.json"));
  expect(Object.keys(manifest)[0]).toBe("name");
  expect(manifest.name).toBe("acme-docs");
  expect(manifest.version).toBe("0.1.0");

  const site = content(files, "src/shared/config/site.ts");
  expect(site).toContain(`name: "Acme Docs",`);
  expect(site).toContain(`copyright: "© {year} Ada Lovelace"`);
  expect(site).toContain(`process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.acme.dev"`);
  for (const path of ["package.json", "content/docs/meta.json", "src/shared/config/site.ts"]) {
    expect(content(files, path)).not.toContain("remcostoeten");
    expect(content(files, path)).not.toContain("Remco Stoeten");
  }
  expect(content(files, "CHANGELOG.md")).toContain("## [Unreleased]");
});

test("replaces the example docs with a starter page and drops turned off pages", () => {
  const files = personalizeTemplate(template, {
    ...details,
    exampleDocs: false,
    changelog: false,
    footer: false,
  });
  const docs = files
    .filter((file) => file.path.startsWith("content/docs/"))
    .map((file) => file.path);
  expect(docs.sort()).toEqual([
    "content/docs/getting-started.mdx",
    "content/docs/index.mdx",
    "content/docs/meta.json",
    "content/docs/writing-content.mdx",
  ]);
  expect(JSON.parse(content(files, "content/docs/meta.json")).pages).toEqual([
    "index",
    "getting-started",
    "writing-content",
  ]);
  expect(files.map((file) => file.path)).not.toContain("CHANGELOG.md");
  const site = content(files, "src/shared/config/site.ts");
  expect(site).toContain("siteFooter: null,");
  expect(site).toContain("changelogs: [],");
});
