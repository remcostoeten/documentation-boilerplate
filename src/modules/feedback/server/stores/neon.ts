import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { FeedbackCounts, FeedbackStore } from "../../types";

let sql: NeonQueryFunction<false, false> | undefined;
let ready: Promise<unknown> | undefined;

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  sql ??= neon(url);
  ready ??= sql`
    create table if not exists feedback (
      id serial primary key,
      url text not null,
      rating text not null,
      created_at timestamptz not null default now()
    )
  `.catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  return { sql, ready };
}

function toCounts(rows: { rating: string; total: number }[]): FeedbackCounts {
  const counts: FeedbackCounts = { helpful: 0, "not-helpful": 0 };
  for (const row of rows) {
    if (row.rating === "helpful" || row.rating === "not-helpful") counts[row.rating] = row.total;
  }
  return counts;
}

/**
 * @name neonStore
 * @description Saves one row per vote to the `feedback` table of the Neon database at
 * `DATABASE_URL` over HTTP, creating the table on first use.
 *
 * @example
 * await neonStore.save({ url: "/docs", rating: "helpful" })
 */
export const neonStore: FeedbackStore = {
  async save(feedback) {
    const { sql, ready } = connect();
    await ready;
    await sql`
      insert into feedback (url, rating)
      values (${feedback.url}, ${feedback.rating})
    `;
  },
  async counts(url) {
    const { sql, ready } = connect();
    await ready;
    const rows = await sql`
      select rating, count(*)::int as total from feedback
      where url = ${url} group by rating
    `;
    return toCounts(rows as { rating: string; total: number }[]);
  },
};
