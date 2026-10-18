"use server";

import type { ActionResult } from "@/shared/types/result";
import { type Feedback, feedbackSchema } from "../types";
import { handleFeedback } from "./feedback-handler";

/**
 * @name submitFeedback
 * @description Validates and stores page feedback, returning a result the
 * widget can show without throwing.
 *
 * @example
 * const result = await submitFeedback({ url: "/docs", rating: "helpful" })
 */
export async function submitFeedback(input: Feedback): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That feedback could not be read." };

  try {
    await handleFeedback(parsed.data);
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[feedback]", error);
    return { ok: false, error: "Feedback could not be saved. Try again later." };
  }
}
