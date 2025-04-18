import type React from "react"
import { ChatSidebar } from "@/components/chat/chat-sidebar"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 md:ml-64">{children}</main>
    </div>
  )
}
