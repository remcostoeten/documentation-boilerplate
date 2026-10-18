"use client";

import { useRecentPages } from "../hooks/use-recent-pages";

export function RecentPagesTracker() {
  useRecentPages();
  return null;
}
