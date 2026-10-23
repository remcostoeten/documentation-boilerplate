import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { readRepositoryFiles } from "../src/repository-files";
import { prepareTemplate } from "../src/scaffold";

const packageRoot = join(import.meta.dir, "..");
const template = prepareTemplate(readRepositoryFiles(join(packageRoot, "../..")));

writeFileSync(join(packageRoot, "template.json"), JSON.stringify(template));
console.log(`Wrote ${template.length} files to template.json`);
