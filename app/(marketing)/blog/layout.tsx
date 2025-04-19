import type { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Global Pulse",
  description: "Insights, updates, and stories from the Global Pulse team.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <header className="w-full py-8 md:py-12 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Global Pulse Blog
          </h1>
          <p className="text-muted-foreground text-center text-lg max-w-2xl">
            Insights, updates, and stories from the Global Pulse team.
          </p>
        </header>
        <section className="w-full max-w-4xl lg:max-w-5xl flex-1 mb-12">
          {children}
        </section>
      </div>
    </main>
  );
}