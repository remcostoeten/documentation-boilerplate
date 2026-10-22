import type { AccentConfig } from "./site";

const unsafe = /[;{}<>\\]/;

function accentRules(color: string) {
  if (unsafe.test(color)) throw new Error(`site.theme.accent has an unsupported color: ${color}`);
  // White text on dark colors and black text on light ones, from the color's lightness
  const foreground = `oklch(from ${color} calc((0.65 - l) * 1000) 0 0)`;
  return `--color-fd-primary:${color};--color-fd-primary-foreground:${foreground};`;
}

/**
 * @name themeCss
 * @description CSS that sets the Fumadocs primary color for light and dark mode
 * from `site.theme.accent`, with a readable foreground chosen automatically.
 * Returns an empty string when no accent is set.
 *
 * @example
 * <style dangerouslySetInnerHTML={{ __html: themeCss(site.theme.accent) }} />
 */
export function themeCss(accent: AccentConfig | null) {
  if (!accent) return "";
  return `:root:root{${accentRules(accent.light)}}:root.dark{${accentRules(accent.dark)}}`;
}
