"use client";

import { CATEGORIES, type Category } from "@/lib/sanity/types";

const BUTTON_CLASSES =
  "cursor-pointer touch-manipulation font-mono text-xs tracking-widest uppercase transition-colors rounded-control";

/**
 * DESIGN.md §6: "No category icons on the services block" — same rule
 * applies here, text only.
 *
 * Client-side state, not a `category` search param + <Link>: the whole
 * photo set is already on the page (see PhotoGallery), so filtering is
 * instant with no server round trip — a URL-driven filter would force a
 * dynamic re-render of the Server Component page on every tap, which reads
 * as a page reload rather than a tab flipping.
 */
export function CategoryFilter({
  active,
  onSelect,
}: {
  active?: Category;
  onSelect: (category?: Category) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-4">
      <button
        type="button"
        aria-pressed={!active}
        onClick={() => onSelect(undefined)}
        className={`${BUTTON_CLASSES} ${!active ? "text-text-light" : "text-text-secondary hover:text-text-primary"}`}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          type="button"
          aria-pressed={active === category.value}
          onClick={() => onSelect(category.value)}
          className={`${BUTTON_CLASSES} ${
            active === category.value ? "text-text-light" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {category.label}
        </button>
      ))}
    </nav>
  );
}
