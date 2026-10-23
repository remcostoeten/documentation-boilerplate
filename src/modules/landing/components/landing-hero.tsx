import Link from "next/link";
import { CopyButton } from "@/modules/docs/components/copy-button";
import { site } from "@/shared/config/site";

export function LandingHero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {site.name}
        </h1>
        <p className="text-lg leading-relaxed text-pretty text-foreground/60">{site.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/docs"
          className="pressable inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:bg-foreground/85"
        >
          Read the docs
        </Link>
        <Link
          href="/docs/quick-start"
          className="pressable inline-flex h-10 items-center rounded-lg border border-foreground/10 px-4 text-sm font-medium hover:bg-foreground/4 focus-visible:bg-foreground/6"
        >
          Quick start
        </Link>
      </div>
      <figure
        data-code-block=""
        className="flex w-full max-w-md items-start gap-2 rounded-xl border border-foreground/10 bg-foreground/2.5 py-3 ps-4 pe-2 font-mono text-sm"
      >
        <pre className="grow overflow-x-auto leading-7">
          <code>{"bun install\nbun dev"}</code>
        </pre>
        <CopyButton className="mt-0.5" />
      </figure>
    </section>
  );
}
