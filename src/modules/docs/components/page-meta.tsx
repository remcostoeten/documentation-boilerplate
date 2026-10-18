import { GitHubIcon } from "@/shared/components/github-icon";

type Props = {
  editUrl: string;
  lastModified?: Date;
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function PageMeta({ editUrl, lastModified }: Props) {
  return (
    <div className="not-prose mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/8 pt-5 text-xs text-foreground/50">
      <a
        href={editUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="pressable inline-flex items-center gap-2 rounded-md py-1 hover:text-foreground focus-visible:text-foreground"
      >
        <GitHubIcon className="size-3.5" />
        Edit this page on GitHub
      </a>
      {lastModified ? (
        <p>
          Last updated on{" "}
          <time dateTime={lastModified.toISOString()}>{dateFormat.format(lastModified)}</time>
        </p>
      ) : null}
    </div>
  );
}
