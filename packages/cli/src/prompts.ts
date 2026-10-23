import * as clack from "@clack/prompts";

type Choice = { value: string; label: string; hint?: string };

function settle<Answer>(answer: Answer): Exclude<Answer, symbol> {
  if (clack.isCancel(answer)) {
    clack.cancel("Cancelled.");
    process.exit(0);
  }
  // isCancel ruled out the cancel symbol, the only symbol clack prompts return
  return answer as Exclude<Answer, symbol>;
}

/**
 * @name text
 * @description Asks for a line of text, with a default used when the answer is
 * empty. Exits when the prompt is cancelled.
 *
 * @example
 * const name = await text("Site name", "Docs")
 */
export async function text(message: string, fallback: string) {
  const answer = settle(
    await clack.text({ message, placeholder: fallback, defaultValue: fallback }),
  );
  return answer.trim() || fallback;
}

/**
 * @name select
 * @description Asks for one of several options and returns its value.
 *
 * @example
 * const docs = await select("Docs content", [{ value: "starter", label: "A starter page" }])
 */
export async function select(message: string, options: Choice[]) {
  return settle(await clack.select<string>({ message, options }));
}

/**
 * @name multiselect
 * @description Asks for any number of options, with some picked up front.
 *
 * @example
 * const features = await multiselect("Features", options, ["feedback"])
 */
export async function multiselect(message: string, options: Choice[], initialValues: string[]) {
  return settle(
    await clack.multiselect<string>({
      message,
      options,
      initialValues,
      required: false,
    }),
  );
}

/**
 * @name confirm
 * @description Asks a yes or no question.
 *
 * @example
 * if (await confirm("Install dependencies?", true)) install()
 */
export async function confirm(message: string, initialValue: boolean) {
  return settle(await clack.confirm({ message, initialValue }));
}

export { intro, log, note, outro, spinner } from "@clack/prompts";
