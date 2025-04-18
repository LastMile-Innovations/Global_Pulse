# Feature Breakdown: Conversational Chat Interface

**Version:** 1.0
**Status:** Core Implementation (P1), Research Tools (P3)

This document provides a detailed breakdown of the features constituting the Global Pulse Conversational Chat Interface (`/chat`), explaining their function and technical underpinnings.

---

### 1. Real-time Chat UI & Messaging

*   **Feature:** Standard, two-sided chat interface displaying user and AI ("Pulse") messages chronologically.
*   **Purpose:** Provides a familiar and intuitive environment for user-AI interaction.
*   **Function:**
    *   **Frontend (`ChatInterface`, `ChatMessage`):** Uses the `useChat` hook (Vercel AI SDK) to manage the message list (`messages` array). Renders messages based on `role` ('user' or 'assistant'). Automatically scrolls to the latest message.
    *   **User Input (`ChatInput`):** Textarea for user input, managed by `useChat`'s `input` state and `handleInputChange`.
    *   **Submission:** Send button or Enter key triggers `useChat`'s `handleSubmit`, which POSTs the current message list (including the new user message) to the backend API (`/api/chat/[id]/route.ts`).
*   **User Experience:** Instant visual feedback as the user types. Sent messages appear immediately in the UI (optimistically via `useChat`).

### 2. Streaming AI Responses

*   **Feature:** AI ("Pulse") responses are displayed token-by-token as they are generated, rather than waiting for the full response.
*   **Purpose:** Improves perceived performance significantly, making the AI feel much more responsive and engaging.
*   **Function:**
    *   **Backend API (`/api/chat/[id]/route.ts`):** Uses `streamText` (Vercel AI SDK Core) to call the LLM. Returns the result using `result.toDataStreamResponse()`, which creates a streaming response compatible with `useChat`.
    *   **Frontend (`useChat`):** Receives the streaming response and progressively updates the content of the last message object in its `messages` array as new tokens arrive.
    *   **Rendering (`ChatMessage`):** Re-renders efficiently as the content of the last message updates, displaying the accumulating text.
*   **User Experience:** Users start seeing Pulse's response almost immediately after sending their message, creating a dynamic and interactive feel.

### 3. AI Agent "Pulse" - Core Conversational Logic

*   **Feature:** The backend AI logic that understands user input, maintains context, follows conversational rules (neutrality), and generates appropriate responses.
*   **Purpose:** To facilitate a natural, unbiased, and insightful conversation aimed at understanding the user's perspective.
*   **Function:**
    *   **Backend API (`/api/chat/[id]/route.ts`):**
        *   **LLM Call:** Uses `streamText` with the selected LLM provider (e.g., `openai('gpt-4o')`).
        *   **System Prompt:** A detailed prompt defines Pulse's persona, neutrality rules, objective (gather nuanced opinion), conversational strategy (open-ended first, clarification), and guidelines for using tools (GenUI, Research).
        *   **Context:** The `messages` array (conversation history) is passed to `streamText` to provide context for the LLM.
        *   **Response Generation:** The LLM generates the next response based on the prompt, history, and latest user message.
*   **User Experience:** The user interacts with an AI that seems curious, listens, asks relevant questions, and avoids taking sides or expressing opinions.

### 4. Embedded Generative UI (GenUI) Invocation & Rendering

*   **Feature:** The AI's ability to seamlessly embed interactive UI elements (polls, sliders, buttons) within its chat messages to ask structured questions.
*   **Purpose:** To collect specific, quantitative data points directly within the natural flow of the conversation, capturing nuance contextually.
*   **Function:**
    *   **Agent Logic (Backend):** Based on conversation context and the result of "Intelligent Question Sourcing", the agent logic includes a `tool_invocation` (AI SDK v3 `tool_call`) in the `streamText` response. This invocation specifies:
        *   `toolName`: e.g., `multiple_choice_question`, `slider_scale_question`.
        *   `args`: An object containing parameters sourced/generated from the `questions` database (e.g., `{ questionId: 'q123', questionText: 'Rate effectiveness...', options: [...] }`).
    *   **Frontend (`useChat`):** The hook parses the streamed response, identifying `tool_invocation` parts within the assistant's message.
    *   **Frontend (`ChatMessage`):** When rendering an assistant message, it checks for `tool_invocation` parts. If found, it dynamically renders the corresponding React component (e.g., `<MultipleChoiceInput>`, `<SliderInput>`) passing the `args` as props.
*   **User Experience:** Interactive elements appear naturally within Pulse's message bubble. Users can directly interact (click options, move slider) without disrupting the chat flow.

### 5. Intelligent Question Sourcing Integration (Within Agent Logic)

*   **Feature:** The AI agent prioritizes finding and reusing existing, relevant, unanswered structured questions from the database before generating new ones for GenUI invocation.
*   **Purpose:** Ensures data consistency, efficiency, and builds a reusable question bank.
*   **Function:**
    *   **Backend API (During `streamText` processing):**
        *   Before deciding to generate a GenUI tool call, the agent logic triggers a database query (via Drizzle) to the `questions` table.
        *   Query uses conversational context (topic, keywords) and filters out questions already in `survey_responses` for the current `userId`.
        *   If a suitable existing question is found, its definition (`questionId`, `text`, `parameters`) is retrieved.
        *   If *no* suitable question is found, the agent uses the LLM (`generateObject`) to create a new question definition *and* saves it to the `questions` table (via Drizzle).
        *   The resulting question definition (retrieved or generated) is used to populate the `args` for the GenUI `tool_invocation`.
*   **User Experience:** Largely invisible, but results in more consistent and relevant structured questions appearing over time.

### 6. Structured Answer Submission (Via GenUI)

*   **Feature:** Capturing the user's input from the embedded GenUI components and saving it as structured data.
*   **Purpose:** To persist the quantitative data gathered contextually within the chat.
*   **Function:**
    *   **Frontend (GenUI Components like `<MultipleChoiceInput>`):** On user interaction (e.g., option click, slider release), the component captures the `questionId` (passed as prop) and the selected `answer` value.
    *   **Server Action Call:** The component directly invokes the `submitSurveyResponse` Server Action (`actions/survey.ts`).
    *   **Backend (Server Action):**
        *   Receives `userId`, `questionId`, `answer`.
        *   Validates the data.
        *   Uses Drizzle to insert a new record into the `survey_responses` table, setting `source` to 'chat' and including the `chatId`.
    *   **UI Feedback:** The GenUI component might update its appearance (e.g., disable options, show selection) based on its internal state after triggering the action. The chat history itself doesn't typically show the submitted answer unless Pulse explicitly acknowledges it in the next turn.
*   **User Experience:** User interacts with the embedded UI element; their structured answer is saved silently in the background without interrupting the primary chat flow.

### 7. Context Management

*   **Feature:** Maintaining the flow and relevance of the conversation over multiple turns.
*   **Purpose:** Enables coherent and meaningful dialogue.
*   **Function:**
    *   **Frontend (`useChat`):** Maintains the list of all messages (`messages` array) in the current session.
    *   **Backend API:** Receives the full `messages` history on each request. Passes this history to the `streamText` function, allowing the LLM to understand the preceding context.
    *   **LLM:** Uses the provided message history to generate contextually appropriate responses and tool calls.
*   **User Experience:** Pulse remembers previous turns within the current session, leading to more natural and less repetitive conversations.

### 8. Loading & Error States

*   **Feature:** Providing visual feedback during AI processing and handling potential errors gracefully.
*   **Purpose:** Manages user expectations and provides recovery options.
*   **Function:**
    *   **Frontend (`useChat`):** Provides `isLoading` boolean state. `ChatInterface` uses this to display a loading indicator (e.g., "Pulse is thinking...") while waiting for the stream to start.
    *   **Frontend (`useChat`):** Provides `error` object state. `ChatInterface` displays an error message if `error` is present.
    *   **Frontend (`ChatInterface`):** May include a `reload` button (calling `useChat`'s `reload` function) to allow retrying the last submission on error.
    *   **Backend API:** Implements `try...catch` and the `onError` callback in `streamText` to log server-side errors and potentially send structured error information via the stream if needed.
*   **User Experience:** User sees clear indicators when the AI is processing. If an error occurs, they receive feedback and potentially an option to retry.

### 9. (Future - P3) External Tool Integration (Research)

*   **Feature:** Pulse's ability to use external APIs (News, Web Search) to fetch real-time information.
*   **Purpose:** To provide accurate, neutral context during conversations, grounding discussion in facts.
*   **Function:**
    *   **Backend:** Define tools (e.g., `performWebSearch`) with `execute` functions calling external APIs.
    *   **Agent Logic:** Prompting guides Pulse on *when* and *how* to use these tools and, crucially, how to synthesize and present the results *neutrally* before asking a user-centric follow-up question.
*   **User Experience:** Pulse might occasionally offer brief, factual context ("Recent studies suggest X...") before asking for the user's opinion on the matter, enhancing the conversation's depth.