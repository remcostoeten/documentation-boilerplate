#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { addItems, registryVersions } from "./add";
import { unifiedDiff } from "./diff";
import { init, setupQuestions } from "./init";
import { listItems, loadAlternatives, registrySource, resolveItems } from "./registry";
import { detectPackageManager, run } from "./shell";

const usage = `Usage: docs-boilerplate <command> [options]

Commands:
  init [directory]   Create a new docs site
  add <items...>     Copy modules into this project
  diff <items...>    Show how local files differ from the registry
  list               List the modules

Options for init, each one skips its question:
  --name <name>        site name
  --description <text> site description
  --url <url>          production URL
  --author <name>      author and copyright holder, defaults to git user.name
  --accent <color>     none, blue, green, orange, purple or any CSS color
  --docs <content>     starter or example
  --features <list>    comma separated: feedback, footer, changelog, page-meta, ask-ai
  --ai-provider <name> openrouter, anthropic, openai or google
  --ai-model <model>   model for Ask AI
  --with <module>      add a module, such as feedback-neon

Options:
  --no-git             init: skip git init and the first commit
  --no-install         init, add: skip installing dependencies
  --overwrite          add: replace files you changed
  --css <path>         add: stylesheet to add styles to
  --registry <url>     read modules from a registry URL instead of the bundled copy
  -y, --yes            accept the defaults without asking
  -h, --help           show this help

The registry URL can also be set with DOCS_BOILERPLATE_REGISTRY.`;

function parse(argv: string[]) {
  return parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      name: { type: "string" },
      description: { type: "string" },
      url: { type: "string" },
      accent: { type: "string" },
      docs: { type: "string" },
      features: { type: "string" },
      "ai-provider": { type: "string" },
      "ai-model": { type: "string" },
      author: { type: "string" },
      css: { type: "string" },
      registry: { type: "string" },
      with: { type: "string", multiple: true },
      "no-git": { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
      overwrite: { type: "boolean", default: false },
      yes: { type: "boolean", short: "y", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

function printList(label: string, paths: string[]) {
  if (paths.length > 0) console.log(`${label}:\n${paths.map((path) => `  ${path}`).join("\n")}`);
}

/**
 * @name main
 * @description Runs the docs-boilerplate CLI with the given arguments.
 *
 * @example
 * await main(["add", "footer"])
 */
export async function main(argv: string[]) {
  const { values, positionals } = parse(argv);
  const [command, ...rest] = positionals;
  if (values.help || !command) {
    console.log(usage);
    return;
  }

  const interactive = Boolean(process.stdin.isTTY) && !values.yes;
  const source = registrySource(values.registry ?? process.env.DOCS_BOILERPLATE_REGISTRY);
  const root = process.cwd();

  if (command === "init") {
    await init({
      directory: rest[0],
      name: values.name,
      description: values.description,
      url: values.url,
      author: values.author,
      accent: values.accent,
      docs: values.docs,
      features: values.features,
      aiProvider: values["ai-provider"],
      aiModel: values["ai-model"],
      with: values.with ?? [],
      git: !values["no-git"],
      install: !values["no-install"],
      interactive,
      source,
    });
    return;
  }

  if (command === "list") {
    for (const item of await listItems(source))
      console.log(`${item.name.padEnd(20)} ${item.description ?? ""}`);
    return;
  }

  if (rest.length === 0)
    throw new Error(`Name at least one module, for example: docs-boilerplate ${command} footer`);

  if (command === "add") {
    const items = await resolveItems(rest, source, setupQuestions(interactive));
    const result = addItems(root, items, {
      overwrite: values.overwrite,
      css: values.css,
      alternatives: await loadAlternatives(items, source),
    });
    const changed = result.written.length + result.skipped.length + result.dependencies.length;
    if (changed === 0 && !result.css && result.envVars.length === 0)
      console.log("Already up to date.");
    printList("Added", result.written);
    printList(
      "Skipped, changed locally (use --overwrite or docs-boilerplate diff)",
      result.skipped,
    );
    if (result.css) console.log(`Updated styles in ${result.css}`);
    if (result.envVars.length > 0) console.log(`Added to .env.local: ${result.envVars.join(", ")}`);
    if (result.dependencies.length > 0 && !values["no-install"]) {
      const manager = detectPackageManager(root);
      run(manager, ["install"], root);
    }
    for (const item of items) if (item.docs) console.log(`\n${item.docs}`);
    return;
  }

  if (command === "diff") {
    const items = await resolveItems(rest, source, () => Promise.resolve(null));
    const versions = registryVersions([...items, ...(await loadAlternatives(items, source))]);
    let changes = 0;
    for (const item of items.filter((entry) => rest.includes(entry.name))) {
      for (const file of item.files ?? []) {
        const target = file.target ?? file.path;
        let local: string;
        try {
          local = readFileSync(join(root, target), "utf8");
        } catch {
          console.log(`${target} is missing`);
          changes++;
          continue;
        }
        if (versions.get(target)?.has(local)) continue;
        const patch = unifiedDiff(local, file.content, target);
        if (patch) {
          console.log(`${patch}\n`);
          changes++;
        }
      }
    }
    if (changes === 0) console.log("Up to date.");
    process.exitCode = changes > 0 ? 1 : 0;
    return;
  }

  throw new Error(`Unknown command ${command}. Run docs-boilerplate --help.`);
}

function isEntry() {
  try {
    return realpathSync(resolve(process.argv[1] ?? "")) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntry()) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
