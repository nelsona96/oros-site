import type { ElementType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const displayVariants = cva("font-display leading-display tracking-display", {
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

const eyebrowVariants = cva("font-mono text-label tracking-widest uppercase", {
  variants: {
    tone: {
      accent: "text-text-accent",
      secondary: "text-text-secondary",
      primary: "text-text-primary",
    },
  },
  defaultVariants: { tone: "accent" },
});

/**
 * The small mono-caps label pattern used throughout the styleguide for
 * section headers and dev labels — common enough to earn its own component.
 */
export function Eyebrow({
  as: Tag = "p",
  tone,
  className,
  children,
}: {
  as?: ElementType;
  tone?: VariantProps<typeof eyebrowVariants>["tone"];
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn(eyebrowVariants({ tone }), className)}>{children}</Tag>;
}

const bodyVariants = cva("font-body leading-body", {
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
  return <p className={cn("font-body leading-body text-text-secondary text-lg", className)}>{children}</p>;
}
