import type { ElementType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const displayVariants = cva("font-display tracking-display", {
  variants: {
    size: {
      xl: "text-display-xl",
      lg: "text-display-lg",
      md: "text-display-md",
      sm: "text-display-sm",
    },
  },
  defaultVariants: { size: "md" },
});

export function Display({
  as: Tag = "h1",
  size,
  className,
  children,
}: {
  as?: ElementType;
  size?: VariantProps<typeof displayVariants>["size"];
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn(displayVariants({ size }), className)}>{children}</Tag>;
}

const eyebrowVariants = cva("font-mono tracking-widest uppercase", {
  variants: {
    tone: {
      accent: "text-text-accent",
      secondary: "text-text-secondary",
      primary: "text-text-primary",
    },
    // "base" is the quiet section-label size used everywhere; "md" is for
    // the rarer case where a mono-caps line needs to carry real weight of
    // its own — a hero subtitle sitting under a display headline, not a
    // dev label or a card caption.
    size: {
      base: "text-label",
      md: "text-sm",
    },
  },
  defaultVariants: { tone: "accent", size: "base" },
});

/**
 * The small mono-caps label pattern used throughout the styleguide for
 * section headers and dev labels — common enough to earn its own component.
 */
export function Eyebrow({
  as: Tag = "p",
  tone,
  size,
  className,
  children,
}: {
  as?: ElementType;
  tone?: VariantProps<typeof eyebrowVariants>["tone"];
  size?: VariantProps<typeof eyebrowVariants>["size"];
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn(eyebrowVariants({ tone, size }), className)}>{children}</Tag>;
}

const bodyVariants = cva("font-body", {
  variants: {
    tone: {
      secondary: "text-text-secondary",
      primary: "text-text-primary",
    },
    size: {
      base: "text-body",
      sm: "text-body-sm",
    },
  },
  defaultVariants: { tone: "secondary", size: "base" },
});

/** Plain body copy — replaces the `font-body text-text-secondary` paragraph markup repeated across sections. */
export function Body({
  tone,
  size,
  className,
  children,
}: {
  tone?: VariantProps<typeof bodyVariants>["tone"];
  size?: VariantProps<typeof bodyVariants>["size"];
  className?: string;
  children: ReactNode;
}) {
  return <p className={cn(bodyVariants({ tone, size }), className)}>{children}</p>;
}

/** A more prominent intro paragraph — for the one line under a heading that needs to read first, not just next. */
export function Lead({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-body text-text-secondary text-lg", className)}>{children}</p>;
}
