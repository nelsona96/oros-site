import type { ElementType, ReactNode } from "react";

export function Display({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`font-display ${className ?? ""}`}>{children}</Tag>;
}

/**
 * The small mono-caps label pattern used throughout the styleguide for
 * section headers and dev labels — common enough to earn its own component.
 */
export function Eyebrow({
  as: Tag = "p",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`font-mono text-xs tracking-widest text-text-accent uppercase ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
