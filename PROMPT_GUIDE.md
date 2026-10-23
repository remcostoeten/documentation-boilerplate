# Prompt guide

How to get docs-boilerplate into a project, what to configure, and prompts that have a coding agent do it. The prompts assume an agent that can run shell commands and edit files, such as Claude Code, Codex or Cursor.

## Get the project

Neither `docs-boilerplate` nor `create-docs-boilerplate` is on npm yet, so the CLI commands below only work after they are published. Cloning does not need them.

### Clone

```bash
git clone https://github.com/remcostoeten/docs-boilerplate my-docs
cd my-docs
rm -rf .git && git init
bun install
bun dev
```

A clone includes `packages/`, `scripts/registry/` and the boilerplate's own README, changelog and sample pages. Delete what you do not want.

### Create with the CLI

```bash
bun create docs-boilerplate my-docs
```

It asks for the site name, description, production URL, author, accent color, the docs to start with (a starter page or the example docs) and the features to turn on. Every question has a flag and `--yes` takes the defaults:

```bash
bunx docs-boilerplate init my-docs --yes \
  --name "Acme Docs" \
  --url https://docs.acme.dev \
  --accent blue \
  --features feedback,footer,changelog,page-meta
```

The result has no `packages/`, no registry scripts and a site config already filled in. Features you turn off stay in the code and are switched off in `site.ts`.

### Add modules to an existing project

For a project that already runs Next.js and Fumadocs:

```bash
npx docs-boilerplate list
npx docs-boilerplate add feedback footer
npx docs-boilerplate diff feedback
```

The project needs the `@/*` alias mapped to `src/*`. `add` never replaces a file you changed unless you pass `--overwrite`.

### Let an agent fetch it

Point the agent at `llms.txt` in the repository. It lists the files worth reading, each with a raw URL. For a running site, `/llms.txt` lists every docs page and `/llms-full.txt` holds all of them in one file. Any page URL plus `.mdx` returns that page as Markdown.

## What to configure

In this order. Everything except step 1 is optional.

| Step | What                                     | Where                                                    |
| ---- | ---------------------------------------- | -------------------------------------------------------- |
| 1    | Name, description, URL, author, keywords | `src/shared/config/site.ts`                              |
| 2    | `NEXT_PUBLIC_SITE_URL` for production    | Host environment, set before the build                   |
| 3    | Logo, favicon, accent color, radius      | `site.logo`, `site.favicon`, `site.theme`                |
| 4    | Pages and sidebar order                  | `content/docs` and its `meta.json` files                 |
| 5    | Page footer: edit link, date, feedback   | `site.pageFooter`                                        |
| 6    | Site footer columns                      | `site.siteFooter`                                        |
| 7    | Where feedback is stored                 | `src/modules/feedback/server/store.ts`                   |
| 8    | Ask AI provider, model and key           | `site.askAI` and `.env.local`                            |
| 9    | Changelog source                         | `site.changelogs`, `CHANGELOG.md` or a GitHub URL        |
| 10   | Delete what you do not need              | `content/docs/components`, sample guides, unused modules |

Notes that save a round trip:

- `site.url` reads `NEXT_PUBLIC_SITE_URL`. It is baked in at build time, so changing it means building again. Without it, canonical links, the sitemap and Open Graph images point at `localhost`.
- The GitHub button, edit links and last updated dates come from the `origin` git remote. Set `site.repository` to override it or to `false` to hide them. Last updated dates need a full git history, so avoid shallow clones in CI and on hosts.
- Feedback only logs to the console until you swap the store. `feedback-postgres`, `feedback-neon` and `feedback-libsql` are the CLI modules that replace it.
- Ask AI is off while `site.askAI` is `null`. Its key comes from the environment only, never from `site.ts`: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`.
- A page that is not in a `meta.json` still builds, but it is not in the sidebar.
- `bun run build` fails on a broken internal link, an unknown frontmatter field and a type error in a `twoslash` code block.

## Prompts

Each prompt is self-contained. Replace the values in angle brackets. Run the agent from the project root so it picks up `AGENTS.md`.

### Create a site

```text
Create a documentation site from docs-boilerplate in ./<directory>.
Site name: <name>. Description: <one sentence>. Production URL: <url>.
Author: <name>. Accent color: <color or "none">.
Features: <feedback, footer, changelog, page-meta, ask-ai>.

Use the CLI if it is available (`bun create docs-boilerplate`), otherwise clone
<repository url>, remove its .git folder and the packages folder, and edit
src/shared/config/site.ts by hand. Read AGENTS.md and content/docs/components/reference/configuration.mdx
first. When it is set up, run `bun install`, `bun run check`, `bun run typecheck`
and `bun test`, and report anything that fails. Do not start a deploy.
```

### Configure an existing clone

```text
This is a clone of docs-boilerplate. Read AGENTS.md first.
Configure src/shared/config/site.ts for <name> at <url>: name, description,
author, keywords, accent color <color>, and the logo at public/<file> at
<width>x<height>. Set the site footer to two columns, <column 1 title> and
<column 2 title>, with the links I list below. Turn off <pageFooter fields>.
Remove the pages in content/docs/components that are not about <topic> and fix
content/docs/meta.json so no entry points at a deleted page. Run
`bun run build` and fix every broken link it reports.

Links: <label, url, one per line>
```

### Write the docs

```text
Add documentation for <product> to content/docs. Read content/docs/concepts/content.mdx
and content/docs/components/reference/frontmatter.mdx first.
Sections: <section names>. Create one folder per section with a meta.json that
sets title, icon and pages, add each section to content/docs/meta.json in the
order given, and give every page a title, a one line description and an icon
from src/shared/icons. Use callouts, steps, tabs and code blocks from the
existing component pages where they help. Write plain declarative prose, no
marketing language and no em dashes. Run `bun run build` and fix broken links.

Source material: <paths or links>
```

### Turn on Ask AI

```text
Enable Ask AI with <provider> and the model <model> in src/shared/config/site.ts.
Read content/docs/guides/ask-ai.mdx and src/modules/ask-ai/types.ts first, and
use a model name the provider's types accept. Add the provider's key variable
to .env.local as an empty value and do not write a real key anywhere. Keep the
default rate limit. Hide the button on <page paths> with `askAI: false` in their
frontmatter. Run `bun run typecheck`.
```

### Store feedback in a database

```text
Store page feedback in <postgres, neon or libsql>. Read content/docs/guides/feedback.mdx.
If the CLI is available run `npx docs-boilerplate add feedback-<name>`, otherwise
copy src/modules/feedback/server/store.<name>.ts over store.ts and its driver
from src/modules/feedback/server/stores, and install the driver package. Add
the connection variable to .env.local and list it in the host environment.
Do not run migrations against a database I have not named.
```

### Publish a changelog

```text
Publish a changelog page. Source: <CHANGELOG.md in this repo, a path, or a GitHub
repository URL>. Add an entry to `changelogs` in src/shared/config/site.ts, add
`content/docs/<page>.mdx` to .gitignore and `<page>` to content/docs/meta.json,
then run `bun run sync:changelog`. Read content/docs/guides/changelog.mdx first
and never edit the generated page by hand.
```

### Deploy

```text
Prepare this site for <Vercel or Docker>. Read content/docs/guides/deployment/index.mdx
and the page for the host. Set NEXT_PUBLIC_SITE_URL to <url> in the build
environment, check that the deploy clones the full git history, run
`bun run build` locally, and list every environment variable the host needs.
Do not deploy, and do not put a secret in any committed file.
```

### Review a change

```text
Review the current diff against AGENTS.md. Check: function declarations for
standalone functions, no added comments outside the allowed kinds, no ESLint or
Prettier, no hardcoded site name or repository URL, no `site.askAI` passed to a
client component, docs updated for any changed option, and no export of
`dynamic`, `revalidate` or `fetchCache` from a route. Run `bun run check`,
`bun run typecheck` and `bun test`, then list findings by file and line.
```

## Install the skill

The repository ships an agent skill in `skills/docs-boilerplate`, with one reference file per topic: getting the project, configuring, styling, frontmatter and sidebar, migrating Markdown, AI setup, databases and deployment. Install it with the skills CLI, `npx skills add <owner>/<repo>`, or copy the folder into `.claude/skills`. An agent that has it loaded needs shorter prompts, such as "migrate the Markdown in ./old-docs into this site".

## Rules to give any agent

Put these at the start of a prompt when the agent does not read `AGENTS.md` on its own:

```text
Next.js in this project is a newer version than you know. Read the matching guide in
node_modules/next/dist/docs before changing routes or caching. Use Bun, not npm.
Lint with Oxlint and format with oxfmt through `bun run check`. Standalone
functions are function declarations and callbacks are arrow functions. Do not add
comments, ESLint or Prettier. Never commit a key or edit .source, .next or a
generated changelog page. Check `git status` first and leave unrelated changes alone.
```
