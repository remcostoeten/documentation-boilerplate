<h1 align="center">docs-boilerplate</h1>

<p align="center">A documentation site starter with an accordion sidebar, built on Next.js and Fumadocs.</p>

Pages are MDX files in `content/docs`. The sidebar is built from the folder structure: each top-level folder is a section that opens on click, one at a time, and a nested folder with an `index.mdx` expands while you are inside it.

- **Sidebar animation** uses `motion` with one shared spring (`duration: 0.35`, `bounce: 0`) for every section and folder.
- Icons are Lucide line drawings split into moving parts in `src/shared/icons`, picked by name with `icon` in `meta.json` or frontmatter. Hovering a link or button plays its icon's one-shot motion, defined as keyframe data in `motion.ts` and played with the Web Animations API. It only runs with a mouse and with reduced motion off.
- `sidebarTitle` and `sidebarBadge` in frontmatter set a shorter label and a small badge.
- Search opens with `⌘K`, lists recently opened pages before you type and filters results by sidebar section. The index is served by `src/app/api/search/route.ts`.
- Every page is available as Markdown at its URL plus `.mdx`, with copy and view buttons under the title. `/llms.txt` and `/llms-full.txt` cover the whole site.
- Each page gets an Open Graph image, canonical and social metadata and TechArticle JSON-LD. `sitemap.xml` and `robots.txt` use `NEXT_PUBLIC_SITE_URL`.
- Pages end with a feedback widget, an edit on GitHub link and the date of their last commit. Feedback goes through a server action to `src/modules/feedback/server/feedback-handler.ts`, which only logs until you point it somewhere.
- A changelog page is generated from `CHANGELOG.md` by `scripts/sync-changelog.ts`, or written by hand with the `Release` component. `changelogs` in `site.ts` lists the files, one page each, and can point outside the repository.
- On small screens the sidebar becomes a full screen dialog behind the top bar menu button.

The sidebar and top bar live in `src/modules/navigation`, layout sizes in `src/app/globals.css` (`--topbar-height`, `--sidebar-width`) and the site name, URL, repository link and SEO metadata in `src/shared/config/site.ts`.

## Development

Requires [Bun](https://bun.sh) and [Vite+](https://viteplus.dev) (`vp`).

```bash
bun install        # install dependencies and generate .source
bun dev            # start the dev server on localhost:3000
bun run check      # format and lint through vp
bun run typecheck  # regenerate .source and route types, then tsc
bun test           # changelog parser tests
bun run build      # sync the changelog, check internal links, then build for production
```

CI in `.github/workflows/ci.yml` runs the same checks and the build on every push and pull request. Next.js runs on Bun. Vite+ only handles formatting and linting, since Next.js builds with its own bundler.

<br/>

xxx,<br/>
[Remco Stoeten](https://remcostoeten.com)<br/>
<small>MIT</small>
