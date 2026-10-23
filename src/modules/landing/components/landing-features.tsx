import Link from "next/link";
import { features } from "../content";

export function LandingFeatures() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24">
      <ul className="grid gap-px overflow-hidden rounded-xl border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, description, href, icon: Icon }) => (
          <li key={title} className="bg-background">
            <Link
              href={href}
              className="flex h-full flex-col gap-3 p-6 transition-colors duration-150 ease-hover hover:bg-foreground/3 focus-visible:bg-foreground/4"
            >
              <Icon className="size-5 text-foreground/50" aria-hidden />
              <h2 className="text-base font-medium">{title}</h2>
              <p className="text-sm leading-relaxed text-foreground/60">{description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
