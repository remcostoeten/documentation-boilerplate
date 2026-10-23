import { expect, test } from "bun:test";
import { mergeCss } from "./css";

test("merges into existing blocks without dropping their other rules", () => {
  const source = `@import "tailwindcss";

@media (prefers-reduced-motion: reduce) {
  .card:active {
    transform: none;
  }
}
`;
  const result = mergeCss(
    source,
    { "ease-hover": "ease" },
    {
      "@utility pressable": { "transition-duration": "150ms" },
      "@media (prefers-reduced-motion: reduce)": {
        ":where(.pressable):active": { transform: "none" },
      },
    },
  );
  expect(result).toContain("@theme");
  expect(result).toContain("--ease-hover: ease");
  expect(result).toContain(".card:active");
  expect(result).toContain(":where(.pressable):active");
  expect(result.match(/@media/g)?.length).toBe(1);
  expect(result.indexOf("@theme")).toBeGreaterThan(result.indexOf("@import"));
});
