import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/sanity/types";

const LINK_CLASSES =
  "font-mono text-xs tracking-widest uppercase outline-none transition-colors rounded-control focus-visible:ring-2 ring-focus-ring";

/**
 * DESIGN.md §6: "No category icons on the services block" — same rule
 * applies here, text links only. Plain hrefs with a `category` search
 * param, no client JS: the active state comes from the current page's own
 * server-rendered `active` prop, matching whichever category the URL
 * already requested.
 */
export function CategoryFilter({ active }: { active?: Category }) {
  return (
    <nav className="flex flex-wrap gap-4">
      <Link
        href="/portfolio/photos"
        className={`${LINK_CLASSES} ${!active ? "text-text-light" : "text-text-secondary hover:text-text-primary"}`}
      >
        All
      </Link>
      {CATEGORIES.map((category) => (
        <Link
          key={category.value}
          href={`/portfolio/photos?category=${category.value}`}
          className={`${LINK_CLASSES} ${
            active === category.value ? "text-text-light" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}
