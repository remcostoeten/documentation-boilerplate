import Link from "next/link";
import { Logo } from "@/modules/navigation/components/logo";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";
import { GitHubIcon } from "@/shared/components/github-icon";
import { getRepository } from "@/shared/config/repository";
import { site } from "@/shared/config/site";

export function LandingHeader() {
  const repositoryUrl = getRepository()?.url;
  const changelog = site.changelogs[0];

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-1 px-4">
        <Link
          href="/"
          className="-ms-2 flex h-8 items-center gap-2 px-2 font-mono text-xs tracking-wider uppercase transition-colors duration-150 ease-hover hover:bg-foreground/3 focus-visible:bg-foreground/6"
        >
          <Logo />
          {site.logo?.hideName ? null : site.name}
        </Link>
        <nav className="ms-auto flex items-center gap-1 text-sm text-foreground/60">
          <Link
            href="/docs"
            className="px-2 py-1 transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground"
          >
            Docs
          </Link>
          {changelog ? (
            <Link
              href={`/docs/${changelog.page}`}
              className="px-2 py-1 transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground"
            >
              Changelog
            </Link>
          ) : null}
          {repositoryUrl ? (
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="pressable inline-flex size-8 items-center justify-center hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/8 focus-visible:text-foreground"
            >
              <GitHubIcon className="size-4" />
            </a>
          ) : null}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
