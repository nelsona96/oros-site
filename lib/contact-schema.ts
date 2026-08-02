import { z } from "zod";
import { CATEGORIES, type Category } from "./sanity/types";

/** The four verticals, reused as the inquiry-type options per SPEC.md §5. */
const INQUIRY_TYPES = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

/**
 * Shared between ContactForm (client validation) and /api/contact (server
 * validation) per SPEC.md §5. `company` is the honeypot — a public form on
 * a photography site attracts bots immediately, so it's never rendered
 * visibly and must arrive empty from a real submission.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter a valid email address."),
  inquiryType: z.enum(INQUIRY_TYPES, "Choose what this is about."),
  eventDate: z.string().optional(),
  message: z.string().trim().min(10, "Say a bit more about what you're planning."),
  company: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
