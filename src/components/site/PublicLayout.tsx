import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="news-portal flex min-h-screen flex-col overflow-x-clip bg-background">
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
    <div className="mb-5 flex items-end justify-between border-b border-border pb-2">
      <h2 className="border-l-[6px] border-news-brand pl-3 text-xl font-bold leading-none text-foreground sm:text-2xl">
        {title}
      </h2>
      {href}
    </div>
  );
}
