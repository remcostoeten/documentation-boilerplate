import { Glob } from "bun";
import { join } from "node:path";

export type RegistryFile = string | { path: string; target: string };

export type RegistryOptions = {
  question: string;
  choices: { label: string; item: string | null }[];
};

export type RegistryItem = {
  name: string;
  title: string;
  description: string;
  files: RegistryFile[];
  dependencies: string[];
  registryDependencies: string[];
  envVars?: Record<string, string>;
  docs?: string;
  options?: RegistryOptions;
};

const feedbackServer = "src/modules/feedback/server";

export const platformPackages = ["react", "react-dom", "next"];

export const registryItems: RegistryItem[] = [
  {
    name: "core",
    title: "Core",
    description:
      "Shared helpers the other modules build on: cn, isHiddenOn, noop and ActionResult.",
    files: [
      "src/shared/helpers/cn.ts",
      "src/shared/helpers/is-hidden-on.ts",
      "src/shared/helpers/noop.ts",
      "src/shared/types/result.ts",
      "src/shared/styles/core.css",
    ],
    dependencies: ["clsx", "tailwind-merge"],
    registryDependencies: [],
  },
  {
    name: "icons",
    title: "Icons",
    description: "Line icons split into parts with a one-shot hover motion, picked by name.",
    files: ["src/shared/icons/*.{ts,tsx}", "src/shared/icons/LICENSE"],
    dependencies: [],
    registryDependencies: ["core"],
  },
  {
    name: "feedback",
    title: "Feedback",
    description:
      "A was this page helpful widget that sends ratings and notes through a server action.",
    files: [
      "src/modules/feedback/types.ts",
      "src/modules/feedback/components/*.tsx",
      `${feedbackServer}/{feedback-handler,submit-feedback,store}.ts`,
      `${feedbackServer}/stores/console.ts`,
    ],
    dependencies: ["lucide-react", "server-only", "zod"],
    registryDependencies: ["core"],
    options: {
      question: "Where should feedback be stored?",
      choices: [
        { label: "Logs only", item: null },
        { label: "Postgres in Docker", item: "feedback-postgres" },
        { label: "Neon", item: "feedback-neon" },
        { label: "Turso or a local libSQL file", item: "feedback-libsql" },
      ],
    },
  },
  {
    name: "feedback-postgres",
    title: "Feedback in Postgres",
    description:
      "Stores feedback in a Postgres database, with a Docker Compose file for a local one.",
    files: [
      `${feedbackServer}/stores/postgres.ts`,
      { path: `${feedbackServer}/store.postgres.ts`, target: `${feedbackServer}/store.ts` },
      { path: `${feedbackServer}/stores/compose.postgres.yml`, target: "compose.feedback.yml" },
    ],
    dependencies: ["postgres", "server-only"],
    registryDependencies: ["feedback"],
    envVars: { DATABASE_URL: "postgres://docs:docs@localhost:5432/feedback" },
    docs: "Start the database with `docker compose -f compose.feedback.yml up -d`. The feedback table is created on the first submission.",
  },
  {
    name: "feedback-neon",
    title: "Feedback in Neon",
    description: "Stores feedback in a Neon Postgres database over HTTP.",
    files: [
      `${feedbackServer}/stores/neon.ts`,
      { path: `${feedbackServer}/store.neon.ts`, target: `${feedbackServer}/store.ts` },
    ],
    dependencies: ["@neondatabase/serverless", "server-only"],
    registryDependencies: ["feedback"],
    envVars: { DATABASE_URL: "" },
    docs: "Set DATABASE_URL to the connection string from the Neon console. The feedback table is created on the first submission.",
  },
  {
    name: "feedback-libsql",
    title: "Feedback in libSQL",
    description:
      "Stores feedback in a Turso database, or in a local SQLite file when no URL is set.",
    files: [
      `${feedbackServer}/stores/libsql.ts`,
      { path: `${feedbackServer}/store.libsql.ts`, target: `${feedbackServer}/store.ts` },
    ],
    dependencies: ["@libsql/client", "server-only"],
    registryDependencies: ["feedback"],
    envVars: { TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "" },
    docs: "Without TURSO_DATABASE_URL feedback goes to feedback.db in the project root, so add it to .gitignore. A local file does not persist on serverless hosts such as Vercel.",
  },
  {
    name: "footer",
    title: "Footer",
    description:
      "A column footer with a brand block, link columns, a copyright row and hideOn patterns.",
    files: ["src/modules/footer/**/*.{ts,tsx}"],
    dependencies: ["lucide-react"],
    registryDependencies: ["core", "icons"],
  },
  {
    name: "ask-ai",
    title: "Ask AI",
    description:
      "A docs chat that answers from the text of the docs with Anthropic, OpenAI, Google or OpenRouter.",
    files: ["src/modules/ask-ai/**/*.{ts,tsx}"],
    dependencies: [
      "@ai-sdk/anthropic",
      "@ai-sdk/google",
      "@ai-sdk/openai",
      "@ai-sdk/react",
      "@openrouter/ai-sdk-provider",
      "ai",
      "fumadocs-ui",
      "motion",
      "react-markdown",
      "remark-gfm",
      "server-only",
      "use-stick-to-bottom",
      "zod",
    ],
    registryDependencies: ["core", "icons"],
  },
  {
    name: "changelog",
    title: "Changelog",
    description: "Turns a changelog file or GitHub Releases into release blocks on a docs page.",
    files: ["src/modules/changelog/**/*.{ts,tsx}"],
    dependencies: ["zod"],
    registryDependencies: [],
  },
];

export const repositoryRoot = join(import.meta.dir, "../..");

/**
 * @name itemFileEntries
 * @description The files of a registry item with the path they are read from
 * and the path they are installed to, both relative to the repository root,
 * without tests.
 *
 * @example
 * itemFileEntries(feedbackPostgres) // [{ path: ".../store.postgres.ts", target: ".../store.ts" }, ...]
 */
export function itemFileEntries(item: RegistryItem) {
  return item.files
    .flatMap((file) => {
      if (typeof file !== "string") return [file];
      return [...new Glob(file).scanSync({ cwd: repositoryRoot })].map((path) => ({
        path,
        target: path,
      }));
    })
    .filter((file) => !file.path.endsWith(".test.ts"))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * @name itemFiles
 * @description The source paths of a registry item, relative to the
 * repository root, without tests.
 *
 * @example
 * itemFiles(registryItems[0]) // ["src/shared/helpers/cn.ts", ...]
 */
export function itemFiles(item: RegistryItem) {
  return itemFileEntries(item).map((file) => file.path);
}
