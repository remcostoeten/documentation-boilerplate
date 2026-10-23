<h1 align="center">create-docs-boilerplate</h1>

<p align="center">Creates a documentation site from <a href="https://github.com/remcostoeten/docs-boilerplate">docs-boilerplate</a>.</p>

```bash
bun create docs-boilerplate my-docs
```

It writes the boilerplate to `my-docs`, sets the package name, the site name and the author, adds a fresh README and changelog, runs `bun install` and makes the first git commit. Without a directory it asks for one.

| Option            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `--name <name>`   | Site name, defaults to the directory name                       |
| `--author <name>` | Author and copyright holder, defaults to `git config user.name` |
| `--no-git`        | Skip git init and the first commit                              |
| `--no-install`    | Skip `bun install`                                              |
| `-y`, `--yes`     | Accept the defaults without asking                              |

`npm create docs-boilerplate` and `pnpm create docs-boilerplate` work too, but the site itself needs [Bun](https://bun.sh).

## Development

The template is the boilerplate repository itself, read from git when the package is built.

```bash
bun run build  # write template.json from the repository and bundle dist/index.js
bun test       # check that the template transforms still match the repository
```

Publish with `npm publish` from this folder. `prepack` runs the build first.

xxx,<br/>
[Remco Stoeten](https://remcostoeten.com)<br/>
<small>MIT</small>
