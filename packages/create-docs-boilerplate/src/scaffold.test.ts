import { expect, test } from "bun:test";
import { join } from "node:path";
import { readRepositoryFiles } from "./repository-files";
import { personalizeTemplate, prepareTemplate, toPackageName, toSiteName } from "./scaffold";

const template = prepareTemplate(readRepositoryFiles(join(import.meta.dir, "../../..")));

function content(files: { path: string; content: string }[], path: string) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`${path} is missing`);
  return file.content;
}

test("leaves this package, the changelog and the README out of the template", () => {
  const paths = template.map((file) => file.path);
  expect(paths.some((path) => path.startsWith("packages/"))).toBe(false);
  expect(paths).not.toContain("CHANGELOG.md");
  expect(paths).not.toContain("README.md");
  expect(paths).toContain(".gitignore");
  expect(paths).toContain("src/shared/config/site.ts");
});

test("removes every link to the boilerplate repository from the site", () => {
  for (const path of ["package.json", "content/docs/meta.json", "src/shared/config/site.ts"]) {
    expect(content(template, path)).not.toContain("remcostoeten/docs-boilerplate");
  }
});

test("fills in the project details", () => {
  const files = personalizeTemplate(template, {
    packageName: "acme-docs",
    siteName: "Acme Docs",
    author: "Ada Lovelace",
  });
  const manifest = JSON.parse(content(files, "package.json"));
  expect(Object.keys(manifest)[0]).toBe("name");
  expect(manifest.name).toBe("acme-docs");
  expect(manifest.version).toBe("0.1.0");

  const site = content(files, "src/shared/config/site.ts");
  expect(site).toContain(`name: "Acme Docs",`);
  expect(site).toContain(`author: { name: "Ada Lovelace", url: "" },`);
  expect(site).toContain(`copyright: "© {year} Ada Lovelace",`);
  expect(site).not.toContain("Remco Stoeten");

  expect(content(files, "README.md")).toContain("Acme Docs");
  expect(content(files, "CHANGELOG.md")).toContain("## [Unreleased]");
});

test("derives package and site names from a directory", () => {
  expect(toPackageName("My Docs!")).toBe("my-docs");
  expect(toPackageName("---")).toBe("docs");
  expect(toSiteName("acme-docs")).toBe("Acme Docs");
  expect(toSiteName("")).toBe("Docs");
});
