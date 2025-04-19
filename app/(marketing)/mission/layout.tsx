import type { ReactNode } from 'react';

export default function MissionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
} 