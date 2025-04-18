import React from "react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  // MVP: Just render children in a container, with optional blog header
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Blog Header (MVP, can be styled or replaced as needed) */}
      <header className="w-full max-w-3xl px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">Global Pulse Blog</h1>
        <p className="text-muted-foreground text-center text-base">
          Insights, updates, and stories from the Global Pulse team.
        </p>
      </header>
      {/* Blog content */}
      <section className="w-full max-w-3xl px-4 flex-1">
        {children}
      </section>
    </main>
  );
}