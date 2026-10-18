import "server-only";
import type { Feedback } from "../types";

/**
 * @name handleFeedback
 * @description Stores one piece of page feedback. Logs to the server console
 * by default; replace the body to send it to a database, an issue tracker or
 * an analytics tool.
 *
 * @example
 * await handleFeedback({ url: "/docs", rating: "helpful" })
 */
export async function handleFeedback(feedback: Feedback) {
  console.info("[feedback]", JSON.stringify({ ...feedback, at: new Date().toISOString() }));
}
