import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1280px] px-5 sm:px-7 lg:px-10 ${className}`}>{children}</div>;
}

export function SectionHeading({ title, href }: { title: string; href?: ReactNode }) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-border-strong pb-3">
      <h2 className="kicker flex items-center gap-3 text-foreground before:h-1.5 before:w-1.5 before:bg-secondary-accent before:content-['']">{title}</h2>
      {href}
    </div>
  );
}
