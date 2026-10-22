import { existsSync, watch } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { Glob } from "bun";
import { dropPrereleases, parseChangelog } from "../src/modules/changelog/utils/parse-changelog";
import {
  generatedMarker,
  renderChangelogPage,
} from "../src/modules/changelog/utils/render-changelog-page";
import { type ChangelogConfig, site } from "../src/shared/config/site";

type Result = "written" | "unchanged" | "removed";

type Outcome = {
  page: string;
  result: Result;
};

function outputPath(config: ChangelogConfig) {
  return join(site.contentDir, `${config.page}.mdx`);
}

function defaultEditUrl(config: ChangelogConfig) {
  if (config.editUrl !== undefined) return config.editUrl;
  if (isAbsolute(config.file) || config.file.startsWith("..")) return false;
  return `${site.repository}/blob/${site.branch}/${config.file}`;
}

async function readIfExists(path: string) {
  const file = Bun.file(path);
  return (await file.exists()) ? file.text() : undefined;
}

async function syncOne(config: ChangelogConfig): Promise<Outcome | undefined> {
  const output = outputPath(config);
  const existing = await readIfExists(output);
  const generated = existing?.includes(generatedMarker) ?? false;
  const markdown = await readIfExists(config.file);

  if (markdown === undefined) {
    if (!generated) return undefined;
    await Bun.file(output).delete();
    return { page: config.page, result: "removed" };
  }

  if (existing !== undefined && !generated) {
    throw new Error(
      `${output} is written by hand. Remove it from site.changelogs or change its page name to generate ${config.file} somewhere else.`,
    );
  }

  const parsed = parseChangelog(markdown);
  const releases = config.skipPrereleases ? dropPrereleases(parsed) : parsed;
  const page = renderChangelogPage(releases, config, defaultEditUrl(config));
  if (page === existing) return { page: config.page, result: "unchanged" };
  await Bun.write(output, page);
  return { page: config.page, result: "written" };
}

async function removeStalePages() {
  const wanted = new Set(site.changelogs.map(outputPath));
  const removed: Outcome[] = [];
  for await (const name of new Glob("*.mdx").scan(site.contentDir)) {
    const path = join(site.contentDir, name);
    if (wanted.has(path)) continue;
    if (!(await Bun.file(path).text()).includes(generatedMarker)) continue;
    await Bun.file(path).delete();
    removed.push({ page: name.replace(/\.mdx$/, ""), result: "removed" });
  }
  return removed;
}

/**
 * @name syncChangelog
 * @description Converts every changelog file listed in `site.changelogs` into a
 * docs page. A missing file is skipped and its stale generated page removed, a
 * generated page that is no longer configured is removed, and a page written by
 * hand is never overwritten.
 *
 * @example
 * const outcomes = await syncChangelog()
 */
export async function syncChangelog() {
  const pages = site.changelogs.map((config) => config.page);
  if (new Set(pages).size !== pages.length) {
    throw new Error("site.changelogs has two entries with the same page name.");
  }
  const outcomes: Outcome[] = [];
  for (const config of site.changelogs) {
    const outcome = await syncOne(config);
    if (outcome) outcomes.push(outcome);
  }
  return [...outcomes, ...(await removeStalePages())];
}

/**
 * @name watchChangelog
 * @description Re-runs `syncChangelog` whenever a changelog file in
 * `site.changelogs` changes, wherever it lives, so edits show up in the dev
 * server.
 *
 * @example
 * watchChangelog()
 */
export function watchChangelog() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  for (const config of site.changelogs) {
    const file = resolve(config.file);
    if (!existsSync(dirname(file))) continue;
    watch(dirname(file), (_event, name) => {
      if (name !== basename(file)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        syncChangelog().catch((error: unknown) => console.error(error));
      }, 100);
    });
  }
}

if (import.meta.main) {
  try {
    for (const { page, result } of await syncChangelog()) console.log(`✓ ${page} ${result}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
