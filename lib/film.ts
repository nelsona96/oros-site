import { CATEGORIES, type Film } from "./sanity/types";

export function categoryLabel(category: Film["category"]) {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

/** "125" (seconds, from Mux) -> "2:05". Callers omit the badge entirely when duration is missing. */
export function formatDuration(seconds: number) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
