import "server-only";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import * as z from "zod";
import { site } from "@/shared/config/site";
import { buildContext } from "./context";
import { loadModel, MissingKeyError } from "./model";
import { checkLimit } from "./rate-limit";

const defaultMaxContextChars = 60_000;
const defaultMaxOutputTokens = 1024;
const maxMessages = 12;
const maxMessageChars = 2000;

const requestSchema = z.object({
  url: z.string().max(300).optional(),
  messages: z
    .array(
      z.object({
        id: z.string().max(100),
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.object({ type: z.string(), text: z.string().optional() })),
      }),
    )
    .min(1),
});

function fail(status: number, error: string, headers?: Record<string, string>) {
  return Response.json({ error }, { status, headers });
}

function toMessages(parsed: z.infer<typeof requestSchema>) {
  return parsed.messages.slice(-maxMessages).map((message): UIMessage => {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("")
      .slice(0, maxMessageChars);
    return { id: message.id, role: message.role, parts: [{ type: "text", text }] };
  });
}

function lastQuestion(messages: UIMessage[]) {
  const last = messages.findLast((message) => message.role === "user");
  return last?.parts.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";
}

function buildInstructions(context: string, extra: string | undefined) {
  return [
    `You answer questions about the ${site.name} documentation.`,
    "Use only the documentation below. If it does not contain the answer, say so plainly and do not guess.",
    "Be concise. Use Markdown, put code in fenced blocks, and link pages as Markdown links using the paths in the documentation.",
    extra,
    "Documentation:",
    context,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * @name handleAsk
 * @description The `POST /api/ask` handler. Checks the rate limit, loads the
 * documentation that matches the question and streams the model's answer as
 * AI SDK UI messages. Answers 404 when Ask AI is not configured.
 *
 * @example
 * export { handleAsk as POST } from "@/modules/ask-ai/server/handler"
 */
export async function handleAsk(request: Request) {
  const config = site.askAI;
  if (!config) return fail(404, "Ask AI is not enabled.");

  const limit = await checkLimit(request, config.limit);
  if (!limit.allowed) {
    return fail(429, "Too many questions. Try again later.", {
      "Retry-After": String(limit.retryAfter),
    });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(400, "Invalid request.");

  const messages = toMessages(parsed.data);
  const question = lastQuestion(messages);
  if (!question.trim()) return fail(400, "Ask a question first.");

  try {
    const model = await loadModel(config);
    const context = await buildContext(
      question,
      parsed.data.url,
      config.maxContextChars ?? defaultMaxContextChars,
    );
    const result = streamText({
      model,
      instructions: buildInstructions(context, config.instructions),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: config.maxOutputTokens ?? defaultMaxOutputTokens,
    });
    return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
  } catch (error) {
    if (error instanceof MissingKeyError) return fail(503, error.message);
    console.error(error);
    return fail(500, "Ask AI failed. Try again.");
  }
}
