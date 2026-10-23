# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- Changelog page generated from `CHANGELOG.md`, and a `Release` component for writing entries by hand.
- Changelog entries can set `url` instead of `file` to read GitHub Releases, a GitHub `blob` URL or any Markdown file.
- Ask AI chat that answers from the text of the docs with Anthropic, OpenAI, Google or OpenRouter. It is off until `askAI` is set in `site.ts`, has a default rate limit and can be hidden per page or with `hideOn`.
- `site.logo` for an image before the site name, with a dark mode variant, and `site.theme.accent` for the primary color.
- `site.pageFooter` to turn the feedback widget, the previous and next links, the edit link and the last updated date on or off.
- `site.siteFooter` for an opt in footer under every docs page, with columns of links, optional icons, a logo and description block, a copyright row with a `{year}` token, `hideOn` patterns and a `siteFooter: false` frontmatter field. `bun run check:links` checks its config and its links to docs pages.
- Twoslash hover types, type queries, completions and expected errors in code blocks marked `twoslash`.
- `TypeTable` with highlighted types, one union member per line and a `typeDescription` override.
- Pages for the content model, routing, sidebar, search, SEO and LLM output, icons, feedback, Docker and Vercel deployment, and reference pages for configuration, frontmatter, `meta.json`, environment variables and scripts.

### Changed

- The repository and branch behind the GitHub button, edit links and last updated dates are detected from the `origin` git remote, then from the Vercel and GitHub Actions environment, instead of being set in `site.ts`. `site.repository` and `site.branch` override them, and `site.repository: false` hides every link.
- The GitHub button and the edit links are hidden when the site has no repository, and the page footer is not rendered when it has nothing to show.

## [0.1.0] - 2026-10-18

### Added

- Documentation site on Next.js and Fumadocs with an accordion sidebar and MDX content.
- Icons with one-shot hover motion, picked by name in `meta.json` or frontmatter.
- Component showcase pages for cards, tabs, steps, callouts, tables, accordions, code blocks and file trees.
- Custom code block with a copy button and language label.
- Markdown for every page at its URL plus `.mdx`, `llms.txt` and `llms-full.txt`.
- Open Graph images, canonical and social metadata, JSON-LD, `sitemap.xml` and `robots.txt`.
- Edit on GitHub link and last updated date on every page.
- Search with recent pages and section filters.
- Page feedback widget backed by a server action.
- Internal link check in the build and a CI workflow.

### Changed

- Everything runs on Bun.

[Unreleased]: https://github.com/remcostoeten/docs-boilerplate/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/remcostoeten/docs-boilerplate/releases/tag/v0.1.0
