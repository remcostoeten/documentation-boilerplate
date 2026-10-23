import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

const lockfiles: [string, PackageManager][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
];

/**
 * @name run
 * @description Runs a command and reports whether it exited with 0. Quiet runs
 * capture the output instead of printing it.
 *
 * @example
 * run("git", ["init"], root)
 */
export function run(command: string, args: string[], cwd: string, quiet = false) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: quiet ? "pipe" : "inherit",
    encoding: "utf8",
  });
  return { ok: result.status === 0, output: result.stdout?.trim() ?? "" };
}

/**
 * @name detectPackageManager
 * @description The package manager of a project, read from its lockfile.
 * Defaults to Bun.
 *
 * @example
 * detectPackageManager(process.cwd()) // "bun"
 */
export function detectPackageManager(root: string): PackageManager {
  return lockfiles.find(([file]) => existsSync(join(root, file)))?.[1] ?? "bun";
}
