"use client";

import { useState, useTransition } from "react";
import { cn } from "@/shared/helpers/cn";
import { submitFeedback } from "../server/submit-feedback";
import type { FeedbackRating } from "../types";

type Props = {
  url: string;
};

type Status = "idle" | "rated" | "sent";

const choiceClass =
  "pressable inline-flex h-7 items-center rounded-md border border-foreground/10 px-3 text-xs text-foreground/60 hover:border-foreground/20 hover:bg-foreground/4 hover:text-foreground focus-visible:bg-foreground/8 focus-visible:text-foreground disabled:opacity-50 aria-pressed:border-foreground/30 aria-pressed:bg-foreground/8 aria-pressed:text-foreground";

export function Feedback({ url }: Props) {
  const [rating, setRating] = useState<FeedbackRating>();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function send(nextRating: FeedbackRating, note?: string) {
    setError(undefined);
    startTransition(async () => {
      const result = await submitFeedback({ url, rating: nextRating, message: note || undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(note === undefined ? "rated" : "sent");
    });
  }

  function rate(nextRating: FeedbackRating) {
    setRating(nextRating);
    send(nextRating);
  }

  if (status === "sent") {
    return (
      <output className="not-prose mt-12 block text-sm text-foreground/60">
        Thanks, your note was sent.
      </output>
    );
  }

  return (
    <section
      aria-label="Page feedback"
      className="not-prose mt-12 flex flex-col gap-3 rounded-xl border border-foreground/8 p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-sm text-foreground/70">Was this page helpful?</p>
        {(["helpful", "not-helpful"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={rating === option}
            disabled={pending}
            onClick={() => rate(option)}
            className={choiceClass}
          >
            {option === "helpful" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {status === "rated" && rating ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send(rating, message.trim());
          }}
        >
          <label htmlFor="feedback-message" className="text-xs text-foreground/55">
            {rating === "helpful"
              ? "Thanks! Anything we could add?"
              : "Sorry about that. What was missing?"}
          </label>
          <textarea
            id="feedback-message"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="resize-none rounded-md border border-foreground/10 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 focus-visible:border-foreground/30 focus-visible:outline-none"
            placeholder="Optional"
          />
          <button
            type="submit"
            disabled={pending || message.trim().length === 0}
            className={cn(choiceClass, "self-end")}
          >
            Send note
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="text-xs text-foreground/70" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
