import { cpSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readRepositoryFiles } from "../src/repository-files";
import { prepareTemplate } from "../src/scaffold";
import { templateExclusions } from "./template-exclusions";

const packageRoot = join(import.meta.dir, "..");
const repositoryRoot = join(packageRoot, "../..");

const template = prepareTemplate(readRepositoryFiles(repositoryRoot), templateExclusions());
writeFileSync(join(packageRoot, "template.json"), JSON.stringify(template));
console.log(`Wrote ${template.length} files to template.json`);

rmSync(join(packageRoot, "registry"), { recursive: true, force: true });
cpSync(join(repositoryRoot, "public/r"), join(packageRoot, "registry"), { recursive: true });
console.log("Copied public/r to registry");
