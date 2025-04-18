import { create } from "zustand"
import type { Message, ChatState } from "../types/chat-types"
import { v4 as uuidv4 } from "uuid"

interface ChatActions {
  addMessage: (role: Message["role"], content: string, timestamp?: string, id?: string, metadata?: any) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

const useChatStore = create<ChatState & ChatActions>((set) => ({
  messages: [
    {
      id: uuidv4(),
      role: "assistant",
      content:
        "Hello! I'm Pulse, your AI companion for deep self-discovery and collective insight. I'm here to help you explore your thoughts, feelings, and experiences in a safe and supportive environment. How are you feeling today?",
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  error: null,

  addMessage: (role, content, timestamp, id, metadata) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: id || uuidv4(),
          role,
          content,
          timestamp: timestamp || new Date().toISOString(),
          metadata,
        },
      ],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearMessages: () =>
    set({
      messages: [
        {
          id: uuidv4(),
          role: "assistant",
          content:
            "Hello! I'm Pulse, your AI companion for deep self-discovery and collective insight. I'm here to help you explore your thoughts, feelings, and experiences in a safe and supportive environment. How are you feeling today?",
          timestamp: new Date().toISOString(),
        },
      ],
    }),
}))

export default useChatStore
