import { z } from "zod";
import { CATEGORIES, type Category } from "./sanity/types";

/** The four verticals, reused as the inquiry-type options per SPEC.md §5. */
const INQUIRY_TYPES = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

/**
 * Singular framing for anywhere copy describes *this one* inquiry — the
 * "Type of shoot" dropdown, the notification email's triage row, the
 * auto-reply's "your ___ inquiry" — distinct from `categoryLabel` (lib/film.ts),
 * whose plural framing is correct for a portfolio *category* of many photos
 * or films. Only "Weddings" actually differs: a person inquires about their
 * wedding, not their "weddings."
 */
const INQUIRY_TYPE_LABELS: Record<Category, string> = {
  weddings: "Wedding",
  commercial: "Commercial",
  portrait: "Portrait",
  ministry: "Ministry",
};

export function inquiryTypeLabel(category: Category): string {
  return INQUIRY_TYPE_LABELS[category];
}

/** Conventional for photography/videography inquiry forms — lets a studio triage fit before the first call. */
export const BUDGET_RANGES = ["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+", "Not sure yet"] as const;

/**
 * Shared between ContactForm (client validation) and /api/contact (server
 * validation) per SPEC.md §5. `company` is the honeypot — a public form on
 * a photography site attracts bots immediately, so it's never rendered
 * visibly and must arrive empty from a real submission.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().optional(),
  inquiryType: z.enum(INQUIRY_TYPES, "Choose what this is about."),
  location: z.string().trim().optional(),
  // Free text, not a date picker — the couple/client often hasn't locked an
  // exact date yet ("next spring", "TBD"), and this is triage context for a
  // human, never parsed as a real date.
  eventDate: z.string().optional(),
  budget: z.enum(BUDGET_RANGES).optional(),
  message: z.string().trim().min(10, "Say a bit more about what you're planning."),
  company: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
