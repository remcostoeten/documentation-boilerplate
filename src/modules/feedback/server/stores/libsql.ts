import "server-only";
import { type Client, createClient } from "@libsql/client";
import type { FeedbackCounts, FeedbackStore } from "../../types";

let client: Client | undefined;
let ready: Promise<unknown> | undefined;

function connect() {
  client ??= createClient({
    url: process.env.TURSO_DATABASE_URL || "file:feedback.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  ready ??= client
    .execute(
      `create table if not exists feedback (
        id integer primary key autoincrement,
        url text not null,
        rating text not null,
        created_at text not null default current_timestamp
      )`,
    )
    .catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  return { client, ready };
}

function toCounts(rows: { rating: string; total: number }[]): FeedbackCounts {
  const counts: FeedbackCounts = { helpful: 0, "not-helpful": 0 };
  for (const row of rows) {
    if (row.rating === "helpful" || row.rating === "not-helpful") counts[row.rating] = row.total;
  }
  return counts;
}

/**
 * @name libsqlStore
 * @description Saves one row per vote to the `feedback` table of the Turso database at
 * `TURSO_DATABASE_URL`, or to a local `feedback.db` file when it is not set,
 * creating the table on first use.
 *
 * @example
 * await libsqlStore.save({ url: "/docs", rating: "helpful" })
 */
export const libsqlStore: FeedbackStore = {
  async save(feedback) {
    const { client, ready } = connect();
    await ready;
    await client.execute({
      sql: "insert into feedback (url, rating) values (?, ?)",
      args: [feedback.url, feedback.rating],
    });
  },
  async counts(url) {
    const { client, ready } = connect();
    await ready;
    const result = await client.execute({
      sql: "select rating, count(*) as total from feedback where url = ? group by rating",
      args: [url],
    });
    return toCounts(
      result.rows.map((row) => ({ rating: String(row.rating), total: Number(row.total) })),
    );
  },
};
