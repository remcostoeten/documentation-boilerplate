#!/usr/bin/env node
import { main } from "docs-boilerplate";

main(["init", ...process.argv.slice(2)]).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
