import type { LucideIcon, LucideProps } from "lucide-react";

const DEFAULT_SIZE = 20;
const DEFAULT_STROKE_WIDTH = 1.5;

/**
 * Wraps lucide-react icons with DESIGN.md §6's fixed weight (1.5px stroke,
 * 16–20px) so every icon in the app stays consistent by default.
 */
export function Icon({
  icon: IconComponent,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  ...props
}: LucideProps & { icon: LucideIcon }) {
  return <IconComponent size={size} strokeWidth={strokeWidth} {...props} />;
}
