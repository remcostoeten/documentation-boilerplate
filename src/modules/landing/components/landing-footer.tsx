import { site } from "@/shared/config/site";

export function LandingFooter() {
  return (
    <footer className="border-t border-foreground/5">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 text-sm text-foreground/50">
        <a
          href={site.author.url}
          target="_blank"
          rel="noreferrer noopener"
          className="transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground"
        >
          {site.author.name}
        </a>
      </div>
    </footer>
  );
}
