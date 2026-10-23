<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

A documentation site starter built on Next.js and Fumadocs, run with Bun. Pages are MDX files in `content/docs`, the sidebar comes from the folders and the `meta.json` in each, and the site is configured in one object, `src/shared/config/site.ts`. The stack is Next.js 16 with `cacheComponents`, React 19, Tailwind 4, Fumadocs 16, `motion`, AI SDK 7 and TypeScript 6. User docs for every feature are in `content/docs`, and `/llms.txt` lists them.

### Commands

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `bun install`       | Installs and runs `fumadocs-mdx`, which generates `.source`      |
| `bun dev`           | Dev server on port 3000 or the next free port                    |
| `bun run check`     | Format check and lint through Vite+ (`vp`), Oxlint and oxfmt     |
| `bun run lint:fix`  | Applies lint fixes                                               |
| `bun run format`    | Writes formatting                                                |
| `bun run typecheck` | Regenerates `.source` and route types, then `tsc --noEmit`       |
| `bun test`          | Unit tests                                                       |
| `bun run build`     | Changelog sync, internal link check, then `bun --bun next build` |

Before finishing a change, run `bun run check`, `bun run typecheck` and `bun test`. Run `bun run build` when you touched routes, MDX, `source.config.ts` or anything that renders on the server. Run one test command at a time, they share the machine.

### Layout

| Path                        | What it holds                                                                    |
| --------------------------- | -------------------------------------------------------------------------------- |
| `content/docs`              | Pages and the `meta.json` files that order them                                  |
| `src/shared/config/site.ts` | `SiteConfig`: name, URL, logo, theme, footers, changelogs, Ask AI                |
| `source.config.ts`          | The MDX collection, the frontmatter schema and code highlighting                 |
| `src/app`                   | Routes: docs pages, search, Ask AI, `llms.txt`, `.mdx` output, Open Graph images |
| `src/modules/<feature>`     | One folder per feature with `components`, `server`, `hooks`, `utils` and `types` |
| `src/shared`                | Config, helpers, icons, styles and types used by more than one module            |
| `scripts`                   | Dev server wrapper, changelog sync, link check, type table data                  |

Modules are `ask-ai`, `changelog`, `docs`, `feedback`, `footer`, `navigation`, `search` and `theme`. `server` folders are server only. Put code used by two modules in `src/shared`. The feature modules `ask-ai`, `changelog`, `feedback` and `footer` import nothing from other modules, keep it that way.

### Making common changes

- New page: create `content/docs/<name>.mdx` with a `title`, then list it in the `pages` array of the `meta.json` in that folder. An unlisted page builds and is searchable but is not in the sidebar. The order of `pages` is the order of the sidebar.
- New section: a folder with a `meta.json` (`title`, `icon`, `pages`), listed in the parent `meta.json`.
- Frontmatter fields are defined in `source.config.ts` and documented in `content/docs/components/reference/frontmatter.mdx`. An unknown field fails the build. Add the field to both.
- Icons are picked by name from `src/shared/icons`. An unknown name renders nothing and logs a warning.
- Site settings go in `src/shared/config/site.ts`. Every option is documented in `content/docs/components/reference/configuration.mdx`, so update that page when you add or change one.
- Internal links start with `/docs`. `bun run check:links` fails the build on a missing page or heading anchor, so run `bun run build` after moving or renaming pages.
- Never edit `.source`, `.next` or `content/docs/changelog.mdx`. They are generated.

### Environment

No variable is required. Put them in `.env.local`, which is gitignored, and never commit a key. `NEXT_PUBLIC_SITE_URL` must be set before a production build, or canonical links, the sitemap and Open Graph images point at `localhost`. The provider key for Ask AI is read from the environment only. The full list is in `content/docs/components/reference/environment-variables.mdx`.

### Code style

- Standalone functions are `function` declarations. Callbacks are arrow functions. Oxlint enforces both (`func-style`, `prefer-arrow-callback` in `vite.config.ts`).
- Lint with Oxlint and format with oxfmt through `vp`. Do not add ESLint or Prettier.
- Files are kebab-case. A component file exports one component.
- Shared helpers and business logic functions that are exported carry a JSDoc block with `@name`, `@description` and `@example`. Other code has no comments except a one line workaround reason, a one line explanation of a regex, or a `TODO`.
- Use the semantic types already declared, such as `ActionResult` in `src/shared/types/result.ts`, and derive types from the config instead of repeating them.
- Prose in docs and code is plain and specific. No em dashes, no marketing language.

### Rules for agents

- Read the relevant doc in `content/docs` and the Next.js guide in `node_modules/next/dist/docs/` before changing behavior. Next.js here differs from older versions.
- Check `git status` first and leave unrelated changes alone.
- Do not add a dependency for something the stack already covers. Install current versions with `bun add`.
- Do not hardcode the repository URL, the site name or the site URL. Read them from `site` and `getRepository()`.
- Do not remove the Ask AI rate limit, and do not pass `site.askAI` to a client component.
- When a feature changes, update its page in `content/docs` and the root `README.md` in the same change.

## Changelog

A changelog page is either generated from a changelog file or written by hand. Full user docs are in `content/docs/guides/changelog.mdx`.

### Files

- `src/shared/config/site.ts`: `changelogs` lists the files to publish. Type is `ChangelogConfig` from `src/modules/changelog/types.ts` (exactly one of `file` or `url`, then `page`, `title`, `description`, optional `skipPrereleases`, optional `editUrl`). An empty list turns the feature off.
- `scripts/sync-changelog.ts`: writes `content/docs/<page>.mdx` for each entry. Run it with `bun run sync:changelog`. `bun dev` runs it and watches the files, `bun run build` runs it before the link check.
- `src/modules/changelog/utils/parse-changelog.ts`: splits a changelog into releases and makes the body MDX safe. Tests are next to it, run them with `bun test`.
- `src/modules/changelog/utils/changelog-source.ts` and `github-releases.ts`: resolve a `url` to GitHub Releases or a Markdown file, and map the GitHub API response to releases.
- `src/modules/changelog/utils/render-changelog-page.ts`: builds the page frontmatter and `Release` blocks.
- `src/modules/changelog/components/release.tsx`: the `Release` MDX component, registered in `src/modules/docs/mdx-components.tsx`.

### Rules

- Never edit a generated page. It starts with the `generated by scripts/sync-changelog.ts` marker and is gitignored. Edit the source changelog and re-run the sync.
- Generated pages are not added to `.gitignore` automatically. Add `content/docs/<page>.mdx` for each new entry, and list `<page>` in `content/docs/meta.json` or it will not show in the sidebar.
- To write a changelog by hand, create the page yourself without the marker and use `<Release date="YYYY-MM-DD">` with a `## version` heading inside. The sync throws instead of overwriting a page without the marker, so keep the page name out of `changelogs`.
- `file` is relative to the repository root, or absolute, and may point outside the repository. Edit links are hidden for files outside it unless `editUrl` is set.
- `url` accepts a GitHub repository or releases page (GitHub Releases API), a GitHub `blob` URL (raw file) or any Markdown URL. It is fetched on sync, uses `GITHUB_TOKEN` if set, and a failed fetch keeps the existing generated page with a warning.
- Each page must have a unique `page` name.
- Accepted heading formats: Keep a Changelog (`## [1.2.0] - 2026-10-18`, `## [Unreleased]`), conventional changelog (`## [1.2.0](url) (2026-10-18)`), Changesets (`## 1.2.0`, no date) and plain `## v1.2.0 - 2026-10-18`. Each level 2 heading is one release, and releases with an empty body are dropped.
- Outside code, raw HTML, JSX, HTML comments and curly braces in the changelog are escaped or removed so MDX compiles. Put anything that needs them in a code span.
- The sidebar badge is the latest version that is not `Unreleased`. `tocDepth: 2` keeps the table of contents to one entry per release.
- The frontmatter fields `tocDepth` and `editUrl` are defined in `source.config.ts` and documented in `content/docs/components/reference/frontmatter.mdx`. Keep both in sync.

### Adding a changelog

1. Add an entry to `changelogs` in `src/shared/config/site.ts`.
2. Add `content/docs/<page>.mdx` to `.gitignore` and `<page>` to `content/docs/meta.json`.
3. Run `bun run sync:changelog`, then `bun run check`, `bun test`, `bun run typecheck` and `bun run build`.

## Site config

`src/shared/config/site.ts` is the single config object (`SiteConfig`). Related files:

- `src/shared/config/repository.ts`: `getRepository()` and `repositoryFileUrl(path)` read the GitHub repository and branch from the `origin` remote, then from Vercel and GitHub Actions environment variables. `site.repository` and `site.branch` override them, `site.repository: false` disables them. Use these instead of hardcoding a repository URL. When there is no repository, callers must hide the link, not render a broken one. Credentials in a remote are stripped.
- `src/shared/config/theme-css.ts`: turns `site.theme.accent` into CSS variables injected in `src/app/layout.tsx`. Everything else about the theme lives in `src/app/globals.css`.
- `site.logo` is rendered by `src/modules/navigation/components/logo.tsx` from files in `public`.
- `site.pageFooter` toggles the edit link and the last updated date under each page.
- Server code calls `getRepository()`. Client components get the URL as a prop, as `DocsSidebar` does through `src/app/docs/layout.tsx`.

## Ask AI

An optional docs chat. Off while `site.askAI` is null. User docs are in `content/docs/guides/ask-ai.mdx`. This project uses AI SDK v7, so read `node_modules/ai/docs` before changing the server code: `streamText` takes `instructions`, and the route returns `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`.

- `src/modules/ask-ai/types.ts`: `AskAIConfig` is a union keyed by `provider`, so `model` is required and typed per provider. The model types come from the provider packages. Add a provider by extending `ProviderModels`, `loadModel` in `server/model.ts` and the key variable table there.
- `server/handler.ts`: `createAskHandler` builds `POST /api/ask`, and `src/app/api/ask/route.ts` passes it `site.askAI`, the site name and the pages. Order is limit, validation, key check, context, stream. Messages are validated with zod, cut to the last 12 and 2000 characters each.
- `server/context.ts`: sends the whole site when it fits in `maxContextChars`, otherwise ranks pages by the question and the current URL.
- `server/rate-limit.ts`: in memory counter by default (20 per hour per IP). `limit` can be a preset with `by` and `skipIf`, a function, or false. Never remove the default limit, it protects the API key.
- `components/ask-ai-slot.tsx`: server component that applies `hideOn` and the `askAI: false` frontmatter, then renders the client `ask-ai.tsx` inside `PageActions`. The chat is a module level `Chat` so it survives navigation.
- Functions in `site.askAI` run on the server only. Never pass the config object to a client component, pass plain props as `AskAISlot` does.
- API keys come from environment variables only. Never put a key in `site.ts`.

## TypeScript hover types

A `ts` or `tsx` fence with `twoslash` in its meta is type checked at build time and gets hover popups, type queries and completions. User docs are in `content/docs/components/code-blocks.mdx`.

- `source.config.ts`: `transformerTwoslash` from `fumadocs-twoslash`, with results cached in `.next/cache/twoslash`. `@/*` maps to `src/*`, so snippets can import real project modules. Pin it to 3.x: 4.x needs Node because its TypeScript 7 API crashes under Bun, and this project builds with `bun --bun`.
- A type error that is not listed in `// @errors: <code>` fails the build. Snippets for code that is not in this repo are mocked with a `.d.ts` block (`// @filename: x.d.ts` and `declare module`), see the last example on the code blocks page.
- `Popup`, `PopupTrigger` and `PopupContent` from `fumadocs-twoslash/ui` are registered in `mdx-components.tsx`. `code-block.tsx` renders a `pre` without `data-language` bare, because Twoslash nests one inside its popups.
- `copy-button.tsx` skips `.nd-copy-ignore`, which marks the popups, completion lists and error lines Twoslash inserts into the code.
- Styles are in `src/modules/docs/components/twoslash.css`. `.twoslash` is git ignored, it is where Twoslash writes scratch files.

## Instant navigation

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, so every `<Link>` prefetches the route's App Shell and `next dev` validates each page for blocking code. The guide is `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

- Do not export `dynamic`, `revalidate` or `fetchCache` from a route. They fail the build.
- `/docs/[[...slug]]` is also prerendered once with an unknown slug, so a client component that calls `usePathname()` must sit inside `<Suspense>`. `DocsSidebar` does, with `DocsSidebarFallback` as the fallback, and it also records recent pages. Do not add a second component that reads the pathname outside it.
- Shiki reads `Date.now()`, which cannot run while prerendering. Anything that calls `highlight` at render time must go through a `"use cache"` function that returns serializable data, as `highlightTree` in `type-table.tsx` does. A cached function cannot return elements with function components in them.
- `bun --bun next build` must print no `Error:` lines. Add `--debug-prerender` for usable stack traces.

## Registry

Modules are meant to be copied into other projects, so `scripts/registry/items.ts` lists each one as a registry item: its files, npm dependencies and the other items it needs. `core` holds the shared helpers (`cn`, `isHiddenOn`, `noop`, `ActionResult`) and `src/shared/styles/core.css` with the `pressable` utility and the easing variables. `globals.css` imports it.

- `scripts/registry/items.test.ts` fails when a file in an item imports anything outside its own files, its registry dependencies, its declared packages, React or Next.
- A module never imports `@/shared/config/site` or another app module. The page passes config, the site name and slots such as the logo as props, as `SiteFooter`, `AskAISlot` and `createAskHandler` do. `scripts/sync-changelog.ts` is app glue and stays outside the changelog item.
- A new file in a listed module is picked up by its glob. A new module needs an entry in `registryItems`.
- Modules use the Fumadocs color tokens (`text-fd-foreground`, `bg-fd-background`), not the `foreground` aliases in `globals.css`, so they work in any Fumadocs project.
- `scripts/registry/build-registry.ts` (`bun run build:registry`, also run by `bun dev` and `bun run build`) writes a shadcn registry to `public/r`, which is gitignored: one `<item>.json` per item with the source inlined, and `registry.json`. Package versions come from `package.json`. `@theme` blocks in an item's CSS become `cssVars.theme`, the rest becomes `css`. Item URLs use `site.url`, so set `NEXT_PUBLIC_SITE_URL` before building.
- Install an item with `npx shadcn add <site>/r/<item>.json`. The target needs a `components.json` and the `@/*` to `src/*` path alias.
- Feedback stores: `src/modules/feedback/server/store.ts` exports the active `FeedbackStore`, the console store by default, so this repo builds without a database. The registry items `feedback-postgres`, `feedback-neon` and `feedback-libsql` each add a driver file in `server/stores` and replace `store.ts` with their `store.<name>.ts`. Their drivers are dev dependencies here only so the files typecheck.
- A manifest file entry is a glob or `{ path, target }`, for a file that installs under another name. `envVars`, `docs` and `options` are optional. `envVars` and `docs` are written as the shadcn fields, `options` as `meta.options`: a question with choices that name the item to install, which the CLI asks. The `feedback` item asks where to store feedback.

## CLI

`packages/cli` is the `docs-boilerplate` package (`init`, `add`, `diff`, `list`). `packages/create-docs-boilerplate` only runs `docs-boilerplate init`, so `bun create docs-boilerplate` works.

- `bun run build` in `packages/cli` builds the registry, writes `template.json` from the files git tracks and copies `public/r` to `registry/`, so the CLI works offline. `--registry <url>` or `DOCS_BOILERPLATE_REGISTRY` reads a deployed registry instead.
- The template leaves out `packages/`, `scripts/registry/`, this Registry section, the changelog, the README, and the files and packages of optional items (the ones a setup question adds, such as the feedback stores). `init` adds the picked ones back through the same code as `add`.
- `add` replaces a file only when it matches a registry version of that file, including the versions of the other answers to a setup question, so it never overwrites local edits without `--overwrite`. It skips the CSS of an item whose `.css` file the stylesheet already imports.
- `init` replaces everything from `export const site: SiteConfig = {` to the end of `site.ts` with an object built from the answers in `renderSite` (`packages/cli/src/scaffold.ts`). A new `SiteConfig` field needs a value there too. Turned off features stay in the code and are switched off in the object.
- `src/scaffold.test.ts` fails when `site.ts`, `meta.json` or `AGENTS.md` change in a way the template transforms no longer match.
