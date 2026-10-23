import "server-only";
import postgres from "postgres";
import type { FeedbackCounts, FeedbackStore } from "../../types";

let sql: postgres.Sql | undefined;
let ready: Promise<unknown> | undefined;

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  sql ??= postgres(url);
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
 * @name postgresStore
 * @description Saves one row per vote to the `feedback` table of the Postgres database
 * at `DATABASE_URL`, creating the table on first use.
 *
 * @example
 * await postgresStore.save({ url: "/docs", rating: "helpful" })
 */
export const postgresStore: FeedbackStore = {
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
    const rows = await sql<{ rating: string; total: number }[]>`
      select rating, count(*)::int as total from feedback
      where url = ${url} group by rating
    `;
    return toCounts(rows);
  },
};
