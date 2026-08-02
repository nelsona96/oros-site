import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Registers Phase 12c's fluid type-scale tokens (text-display-*, text-body,
 * text-body-sm, text-label, leading-display, leading-body, tracking-display)
 * as real font-size/leading/tracking class groups. Without this, tailwind-merge
 * doesn't know e.g. `text-display-md` conflicts with a `text-5xl` override
 * passed via className — both classes would just sit side by side, and
 * whichever wins does so by CSS source order rather than an actual merge
 * (the same "spacing overrides winning by luck" bug Section/Container had).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-xl", "display-lg", "display-md", "display-sm", "body", "body-sm", "label"] },
      ],
      tracking: [{ tracking: ["display"] }],
      leading: [{ leading: ["display", "body"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
