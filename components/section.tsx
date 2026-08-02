import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("py-16 md:py-24", className)}>{children}</section>;
}
