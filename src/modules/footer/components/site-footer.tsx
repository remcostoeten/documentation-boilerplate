import Link from "next/link";
import { site } from "@/shared/config/site";

const linkClass =
  "text-foreground/50 transition-colors duration-150 ease-hover hover:text-foreground focus-visible:text-foreground";

type Props = { inset?: boolean };

export function SiteFooter({ inset = false }: Props) {
  const footer = site.footer;
  if (!footer) return null;

  return (
    <footer className={`border-t border-foreground/5${inset ? " docs-footer" : ""}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 text-sm">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 font-mono text-xs tracking-wider text-foreground uppercase">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={linkClass}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {footer.copyright ? <p className="mt-10 text-foreground/50">{footer.copyright}</p> : null}
      </div>
    </footer>
  );
}
