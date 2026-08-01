import { createClient } from "@sanity/client";

/**
 * useCdn is false so Next's own Data Cache + revalidateTag is the single
 * source of truth — Sanity's CDN has its own independent TTL that would
 * otherwise compete with on-demand revalidation. See docs/SPEC.md §7.
 */
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-08-15",
  useCdn: false,
});
