import type { ReactNode } from "react";
import { Container } from "@/components/container";
import { PortfolioTabs } from "@/components/portfolio-tabs";

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Container className="pt-8">
        <PortfolioTabs />
      </Container>
      {children}
    </div>
  );
}
