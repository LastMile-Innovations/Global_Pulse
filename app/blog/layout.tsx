import React from "react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground">
      {/* You could add a blog-specific header or sidebar here if needed */}
      {children}
    </div>
  );
} 