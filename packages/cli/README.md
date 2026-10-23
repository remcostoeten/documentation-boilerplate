<h1 align="center">docs-boilerplate</h1>

<p align="center">Creates a documentation site from <a href="https://github.com/remcostoeten/docs-boilerplate">docs-boilerplate</a>, or copies its modules into an existing Next.js and Fumadocs project.</p>

```bash
npx docs-boilerplate init my-docs
npx docs-boilerplate add feedback footer
```

## Commands

| Command             | Description                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init [directory]`  | Asks for the site name, description, production URL, author, accent color, docs content (a starter page or the example docs) and features (feedback and where it is stored, site footer, changelog, edit link and last updated date, Ask AI with its provider and model). Writes the site with `site.ts` filled in, installs with Bun and makes the first commit. `bun create docs-boilerplate` runs this too. |
| `add <modules...>`  | Copies modules and the modules they need into the current project, adds their dependencies to `package.json`, their environment variables to `.env.local` and their styles to the stylesheet, then installs.                                                                                                                                                                                                   |
| `diff <modules...>` | Shows how the local files of a module differ from the registry. Exits with 1 when they differ.                                                                                                                                                                                                                                                                                                                 |
| `list`              | Lists the modules.                                                                                                                                                                                                                                                                                                                                                                                             |

Features you turn off in `init` stay in the code and are switched off in `site.ts`, so you can turn them on later by editing it.

`add` never replaces a file you changed. A file is replaced only when it matches a registry version, so a store module can swap the feedback store but not your edits. `--overwrite` replaces it anyway.

## Options

| Option                                       | Description                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--name <name>`                              | `init`: site name, defaults to the directory name                                                                |
| `--description <text>`                       | `init`: site description                                                                                         |
| `--url <url>`                                | `init`: production URL                                                                                           |
| `--author <name>`                            | `init`: author and copyright holder, defaults to `git config user.name`                                          |
| `--accent <color>`                           | `init`: `none`, `blue`, `green`, `orange`, `purple` or any CSS color                                             |
| `--docs <content>`                           | `init`: `starter` or `example`                                                                                   |
| `--features <list>`                          | `init`: comma separated `feedback`, `footer`, `changelog`, `page-meta`, `ask-ai`                                 |
| `--ai-provider <name>`, `--ai-model <model>` | `init`: Ask AI provider (`openrouter`, `anthropic`, `openai`, `google`) and model                                |
| `--with <module>`                            | `init`: add a module, such as `feedback-neon`                                                                    |
| `--no-git`                                   | `init`: skip git init and the first commit                                                                       |
| `--no-install`                               | `init`, `add`: skip installing dependencies                                                                      |
| `--overwrite`                                | `add`: replace files you changed                                                                                 |
| `--css <path>`                               | `add`: stylesheet for the styles, defaults to `tailwind.css` in `components.json` or `src/app/globals.css`       |
| `--registry <url>`                           | read modules from a registry instead of the copy bundled with the CLI, also set with `DOCS_BOILERPLATE_REGISTRY` |
| `-y`, `--yes`                                | accept the defaults without asking. Each `init` option skips its question                                        |

Modules import each other through the `@/*` alias, which must map to `src/*`.

## Development

The template and the bundled registry are read from the repository when the package is built.

```bash
bun run build  # build the registry, write template.json and registry/, bundle dist/cli.js
bun test       # template and stylesheet tests
```

Publish this package first, then `packages/create-docs-boilerplate`. `prepack` runs the build.

xxx,<br/>
[Remco Stoeten](https://remcostoeten.com)<br/>
<small>MIT</small>
