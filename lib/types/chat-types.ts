export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  metadata?: {
    isCheckIn?: boolean
    reviewInteractionId?: string
    feedbackSent?: boolean
    responseRationaleSource?: string
    fitFeedbackSubmitted?: boolean
  }
  // Add the data property for streamed metadata
  data?: any[]
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}
