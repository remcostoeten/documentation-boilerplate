#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { personalizeTemplate, toPackageName, toSiteName, type TemplateFile } from "./scaffold";

const usage = `Usage: create-docs-boilerplate [directory] [options]

Options:
  --name <name>     Site name, defaults to the directory name
  --author <name>   Author and copyright holder, defaults to git user.name
  --no-git          Skip git init and the first commit
  --no-install      Skip bun install
  -y, --yes         Accept the defaults without asking
  -h, --help        Show this help`;

function run(command: string, args: string[], cwd: string, quiet = false) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: quiet ? "pipe" : "inherit",
    encoding: "utf8",
  });
  return { ok: result.status === 0, output: result.stdout?.trim() ?? "" };
}

function isEmptyDirectory(path: string) {
  return !existsSync(path) || readdirSync(path).length === 0;
}

async function ask(question: string, fallback: string) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(`${question} (${fallback}) `);
  prompt.close();
  return answer.trim() || fallback;
}

function readTemplate(): TemplateFile[] {
  return JSON.parse(readFileSync(new URL("../template.json", import.meta.url), "utf8"));
}

function writeFiles(root: string, files: TemplateFile[]) {
  for (const file of files) {
    const path = join(root, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.content);
  }
}

function initGit(root: string) {
  if (!run("git", ["--version"], root, true).ok) {
    console.log("git was not found, skipped git init.");
    return;
  }
  run("git", ["init", "--quiet"], root);
  run("git", ["add", "--all"], root);
  const committed = run("git", ["commit", "--quiet", "-m", "Initial commit"], root, true).ok;
  if (!committed)
    console.log(
      "Created the repository without a commit. Set git user.name and user.email, then commit.",
    );
}

function install(root: string) {
  if (!run("bun", ["--version"], root, true).ok) {
    console.log("Bun was not found. Install it from https://bun.sh, then run bun install.");
    return false;
  }
  return run("bun", ["install"], root).ok;
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: "string" },
      author: { type: "string" },
      "no-git": { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
      yes: { type: "boolean", short: "y", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(usage);
    return;
  }

  const interactive = process.stdin.isTTY && !values.yes;
  const directory =
    positionals[0] ?? (interactive ? await ask("Project directory", "my-docs") : "my-docs");
  const root = resolve(directory);

  if (!isEmptyDirectory(root)) {
    console.error(`${directory} already exists and is not empty.`);
    process.exitCode = 1;
    return;
  }

  const folder = basename(root);
  const siteName =
    values.name ?? (interactive ? await ask("Site name", toSiteName(folder)) : toSiteName(folder));
  const gitAuthor = run("git", ["config", "user.name"], process.cwd(), true).output;
  const author = values.author ?? (gitAuthor || siteName);

  const files = personalizeTemplate(readTemplate(), {
    packageName: toPackageName(folder),
    siteName,
    author,
  });
  writeFiles(root, files);
  console.log(`Created ${siteName} in ${root}`);

  const installed = !values["no-install"] && install(root);
  if (installed) run("bun", ["run", "format"], root, true);
  if (!values["no-git"]) initGit(root);

  const steps = [relative(process.cwd(), root) && `cd ${relative(process.cwd(), root)}`];
  if (!installed) steps.push("bun install");
  steps.push("bun dev");
  console.log(
    `\nNext:\n${steps
      .filter(Boolean)
      .map((step) => `  ${step}`)
      .join("\n")}`,
  );
  console.log("\nSet the site name, logo, theme and features in src/shared/config/site.ts.");
}

await main();
