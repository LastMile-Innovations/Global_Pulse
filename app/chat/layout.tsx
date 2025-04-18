import React from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:block md:w-64 h-full border-r border-border bg-background">
        <ChatSidebar />
      </aside>
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
