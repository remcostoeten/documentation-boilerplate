import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { addItems } from "./add";
import { confirm, intro, log, multiselect, note, outro, select, spinner, text } from "./prompts";
import { type RegistryItem, type RegistrySource, resolveItems } from "./registry";
import {
  type AskAIAnswer,
  envLines,
  personalizeTemplate,
  type ProjectDetails,
  type TemplateFile,
  toPackageName,
  toSiteName,
} from "./scaffold";
import { run } from "./shell";

export type InitOptions = {
  directory: string | undefined;
  name: string | undefined;
  description: string | undefined;
  url: string | undefined;
  author: string | undefined;
  accent: string | undefined;
  docs: string | undefined;
  features: string | undefined;
  aiProvider: string | undefined;
  aiModel: string | undefined;
  with: string[];
  git: boolean;
  install: boolean;
  interactive: boolean;
  source: RegistrySource;
};

type Feature = "ask-ai" | "feedback" | "footer" | "changelog" | "page-meta";
type Provider = AskAIAnswer["provider"];

const accents = {
  blue: { light: "oklch(0.55 0.2 260)", dark: "oklch(0.72 0.15 260)" },
  green: { light: "oklch(0.55 0.15 150)", dark: "oklch(0.75 0.15 150)" },
  orange: { light: "oklch(0.62 0.18 50)", dark: "oklch(0.75 0.15 55)" },
  purple: { light: "oklch(0.52 0.22 300)", dark: "oklch(0.72 0.16 300)" },
};

const features: { value: Feature; label: string; hint: string }[] = [
  { value: "feedback", label: "Feedback", hint: "was this page helpful, under each page" },
  { value: "footer", label: "Site footer", hint: "columns of links under each page" },
  { value: "changelog", label: "Changelog page", hint: "generated from CHANGELOG.md" },
  { value: "page-meta", label: "Edit link and last updated date", hint: "needs a GitHub remote" },
  { value: "ask-ai", label: "Ask AI", hint: "a docs chat, needs an API key" },
];

const defaultFeatures: Feature[] = ["feedback", "footer", "changelog", "page-meta"];

const providers: { value: Provider; label: string; model: string }[] = [
  { value: "openrouter", label: "OpenRouter", model: "anthropic/claude-haiku-5-5" },
  { value: "anthropic", label: "Anthropic", model: "claude-haiku-5-5" },
  { value: "openai", label: "OpenAI", model: "gpt-5.4-mini" },
  { value: "google", label: "Google", model: "gemini-3.8-flash" },
];

function isEmptyDirectory(path: string) {
  return !existsSync(path) || readdirSync(path).length === 0;
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
    log.warn("git was not found, skipped git init.");
    return;
  }
  run("git", ["init", "--quiet"], root, true);
  run("git", ["add", "--all"], root, true);
  if (!run("git", ["commit", "--quiet", "-m", "Initial commit"], root, true).ok) {
    log.warn(
      "Created the repository without a commit. Set git user.name and user.email, then commit.",
    );
  }
}

function isAccentName(value: string): value is keyof typeof accents {
  return Object.hasOwn(accents, value);
}

function isFeature(value: string): value is Feature {
  return features.some((feature) => feature.value === value);
}

function parseAccent(value: string) {
  if (value === "none") return null;
  if (isAccentName(value)) return accents[value];
  return { light: value, dark: value };
}

function parseFeatures(value: string | undefined) {
  if (value === undefined) return defaultFeatures;
  const names = value
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
  const unknown = names.filter((name) => !isFeature(name));
  if (unknown.length > 0) {
    const known = features.map((feature) => feature.value).join(", ");
    throw new Error(`Unknown feature ${unknown.join(", ")}. Use ${known}.`);
  }
  return names.filter(isFeature);
}

function findProvider(value: string) {
  const provider = providers.find((entry) => entry.value === value);
  if (!provider)
    throw new Error(
      `Unknown AI provider ${value}. Use ${providers.map((entry) => entry.value).join(", ")}.`,
    );
  return provider;
}

/**
 * @name setupQuestions
 * @description The `pick` callback for `resolveItems`: asks an item's setup
 * question, unless the session is not interactive or one of its answers was
 * already requested.
 *
 * @example
 * await resolveItems(["feedback"], source, setupQuestions(true))
 */
export function setupQuestions(interactive: boolean) {
  return async (item: RegistryItem, requested: Set<string>) => {
    const options = item.meta?.options;
    if (!options || !interactive) return null;
    if (options.choices.some((choice) => choice.item && requested.has(choice.item))) return null;
    const answer = await select(
      options.question,
      options.choices.map((choice) => ({ value: choice.item ?? "", label: choice.label })),
    );
    return answer || null;
  };
}

async function askAccent(options: InitOptions) {
  if (options.accent) return parseAccent(options.accent);
  if (!options.interactive) return null;
  const choice = await select("Accent color", [
    { value: "none", label: "Fumadocs default" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Purple" },
    { value: "custom", label: "Custom", hint: "any CSS color" },
  ]);
  if (choice === "custom")
    return parseAccent(await text("Color, such as #2563eb or oklch(0.6 0.2 260)", "#2563eb"));
  return parseAccent(choice);
}

async function askAI(options: InitOptions): Promise<AskAIAnswer> {
  const provider = options.aiProvider
    ? findProvider(options.aiProvider)
    : options.interactive
      ? findProvider(
          await select(
            "AI provider",
            providers.map(({ value, label }) => ({ value, label })),
          ),
        )
      : providers[0];
  const model =
    options.aiModel ?? (options.interactive ? await text("Model", provider.model) : provider.model);
  return { provider: provider.value, model };
}

async function askDetails(options: InitOptions, folder: string): Promise<ProjectDetails> {
  const interactive = options.interactive;
  const siteName =
    options.name ??
    (interactive ? await text("Site name", toSiteName(folder)) : toSiteName(folder));
  const fallbackDescription = `Documentation for ${siteName}.`;
  const description =
    options.description ??
    (interactive ? await text("Description", fallbackDescription) : fallbackDescription);
  const url =
    options.url ??
    (interactive ? await text("Production URL", "http://localhost:3000") : "http://localhost:3000");
  const gitAuthor = run("git", ["config", "user.name"], process.cwd(), true).output || siteName;
  const author = options.author ?? (interactive ? await text("Author", gitAuthor) : gitAuthor);
  const accent = await askAccent(options);
  const docs =
    options.docs ??
    (interactive
      ? await select("Docs content", [
          { value: "starter", label: "A starter page", hint: "start writing your own docs" },
          {
            value: "example",
            label: "The example docs",
            hint: "the boilerplate's own pages, as a reference",
          },
        ])
      : "starter");
  const picked =
    options.features === undefined && interactive
      ? (await multiselect("Features", features, defaultFeatures)).filter(isFeature)
      : parseFeatures(options.features);

  return {
    packageName: toPackageName(folder),
    siteName,
    description,
    url,
    author,
    accent,
    exampleDocs: docs === "example",
    askAI: picked.includes("ask-ai") ? await askAI(options) : null,
    feedback: picked.includes("feedback"),
    footer: picked.includes("footer"),
    changelog: picked.includes("changelog"),
    pageMeta: picked.includes("page-meta"),
  };
}

async function addPicked(root: string, options: InitOptions, feedback: boolean) {
  const picked = [...options.with];
  if (!feedback && picked.length === 0) return [];
  const ask = setupQuestions(options.interactive);
  const items = await resolveItems(
    ["feedback", ...picked],
    options.source,
    async (item, requested) => {
      const extra = await ask(item, requested);
      if (extra) picked.push(extra);
      return extra;
    },
  );
  if (picked.length > 0)
    addItems(root, items, { overwrite: false, css: undefined, alternatives: [] });
  return items.filter((item) => picked.includes(item.name));
}

/**
 * @name init
 * @description Creates a new docs site in an empty directory from the bundled
 * template. Asks for the site details, the theme, the docs content and the
 * features, writes `site.ts` from the answers, adds the picked modules,
 * installs with Bun, formats and makes the first commit.
 *
 * @example
 * await init({ ...options, directory: "my-docs" })
 */
export async function init(options: InitOptions) {
  if (options.interactive) intro("docs-boilerplate");
  const directory =
    options.directory ??
    (options.interactive ? await text("Project directory", "my-docs") : "my-docs");
  const root = resolve(directory);
  if (!isEmptyDirectory(root)) throw new Error(`${directory} already exists and is not empty.`);

  const details = await askDetails(options, basename(root));
  writeFiles(root, personalizeTemplate(readTemplate(), details));
  const env = envLines(details);
  if (env.length > 0) writeFileSync(join(root, ".env.local"), `${env.join("\n")}\n`);
  const added = await addPicked(root, options, details.feedback);

  const install =
    options.interactive && options.install
      ? await confirm("Install dependencies with Bun?", true)
      : options.install;
  const git =
    options.interactive && options.git
      ? await confirm("Create a git repository?", true)
      : options.git;

  let installed = false;
  if (install) {
    const progress = spinner();
    progress.start("Installing dependencies");
    installed = run("bun", ["--version"], root, true).ok && run("bun", ["install"], root, true).ok;
    if (installed) run("bun", ["run", "format"], root, true);
    progress.stop(
      installed ? "Installed dependencies" : "Could not install, run bun install yourself",
    );
  }
  if (git) initGit(root);

  for (const item of added) if (item.docs) log.info(item.docs);
  if (details.askAI) log.info(`Put your API key in .env.local as ${env[0].replace("=", "")}.`);

  const location = relative(process.cwd(), root);
  const steps = [location && `cd ${location}`, !installed && "bun install", "bun dev"].filter(
    Boolean,
  );
  note(steps.join("\n"), "Next steps");
  outro(`Created ${details.siteName}. Change anything else in src/shared/config/site.ts.`);
}
