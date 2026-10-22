import { site } from "@/shared/config/site";
import { isHiddenOn } from "../hidden";
import { AskAI } from "./ask-ai";

type Props = {
  url: string;
  enabled?: boolean;
};

/**
 * @name AskAISlot
 * @description The Ask AI button for a docs page. Renders nothing unless
 * `site.askAI` is set, the page does not set `askAI: false` and its URL does not
 * match `hideOn`.
 *
 * @example
 * <PageActions markdownUrl={markdownUrl}>
 *   <AskAISlot url={page.url} enabled={page.data.askAI} />
 * </PageActions>
 */
export function AskAISlot({ url, enabled }: Props) {
  const config = site.askAI;
  if (!config || enabled === false || isHiddenOn(url, config.hideOn)) return null;

  return (
    <AskAI
      title={config.title ?? "Ask AI"}
      placeholder={config.placeholder ?? "Ask about these docs"}
      suggestions={config.suggestions ?? []}
    />
  );
}
