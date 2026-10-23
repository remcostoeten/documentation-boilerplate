import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { TemplateFile } from "./scaffold";

/**
 * @name readRepositoryFiles
 * @description Reads every file git tracks or would track in a repository,
 * skipping ignored files and files deleted from the working tree.
 *
 * @example
 * const files = readRepositoryFiles("/path/to/docs-boilerplate");
 */
export function readRepositoryFiles(root: string): TemplateFile[] {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  return output
    .split("\0")
    .filter((path) => path && statSync(join(root, path), { throwIfNoEntry: false })?.isFile())
    .sort()
    .map((path) => ({ path, content: readFileSync(join(root, path), "utf8") }));
}
