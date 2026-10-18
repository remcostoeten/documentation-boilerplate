import * as z from "zod";

export const feedbackSchema = z.object({
  url: z.string().startsWith("/"),
  rating: z.enum(["helpful", "not-helpful"]),
  message: z.string().trim().max(1000).optional(),
});

export type Feedback = z.infer<typeof feedbackSchema>;

export type FeedbackRating = Feedback["rating"];
