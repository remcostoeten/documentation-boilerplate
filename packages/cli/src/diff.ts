type Line = { kind: " " | "-" | "+"; text: string };

const context = 3;

function diffLines(before: string[], after: string[]) {
  const table = Array.from({ length: before.length + 1 }, () =>
    Array.from<number>({ length: after.length + 1 }).fill(0),
  );
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      table[i][j] =
        before[i] === after[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const lines: Line[] = [];
  let i = 0;
  let j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      lines.push({ kind: " ", text: before[i++] });
      j++;
    } else if (j < after.length && (i === before.length || table[i][j + 1] >= table[i + 1][j])) {
      lines.push({ kind: "+", text: after[j++] });
    } else {
      lines.push({ kind: "-", text: before[i++] });
    }
  }
  return lines;
}

/**
 * @name unifiedDiff
 * @description A line diff of two texts with three lines of context around
 * each change, or an empty string when they are equal.
 *
 * @example
 * console.log(unifiedDiff(local, upstream, "src/modules/footer/types.ts"))
 */
export function unifiedDiff(before: string, after: string, label: string) {
  if (before === after) return "";
  const lines = diffLines(before.split("\n"), after.split("\n"));
  const keep = lines.map((line, index) =>
    lines
      .slice(Math.max(0, index - context), index + context + 1)
      .some((nearby) => nearby.kind !== " "),
  );
  const output = [`--- ${label} (local)`, `+++ ${label} (registry)`];
  for (const [index, line] of lines.entries()) {
    if (keep[index]) output.push(`${line.kind}${line.text}`);
    else if (keep[index - 1]) output.push("@@");
  }
  return output.join("\n");
}
