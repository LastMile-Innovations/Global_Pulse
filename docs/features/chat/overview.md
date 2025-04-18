# Feature Breakdown: Conversational Chat Interface

**Version:** 1.0
**Status:** Core Implementation (P1), Research Tools (P3)

This document provides a detailed breakdown of the features constituting the Global Pulse Conversational Chat Interface (`/chat`), explaining their function and technical underpinnings.

---

### 1. Real-time Chat UI & Messaging

*   **Feature:** Standard, two-sided chat interface displaying user and AI ("Pulse") messages chronologically.
*   **Purpose:** Provides a familiar and intuitive environment for user-AI interaction.
*   **Function:**
    *   **Frontend (`ChatInterface`, `ChatMessage`):** Uses the `useChat` hook (Vercel AI SDK UI) to manage the message list (`messages` array). Renders messages based on `role` ('user' or 'assistant'). Automatically scrolls to the latest message. Implemented using React components (e.g., `components/chat/[id]/chat-interface.tsx`).
    *   **User Input (`ChatInput`):** Textarea for user input, managed by `useChat`'s `input` state and `handleInputChange`. Located in `components/chat/[id]/chat-input.tsx`.
    *   **Submission:** Send button or Enter key triggers `useChat`'s `handleSubmit`, which POSTs the current message list (including the new user message) to the backend API route (`/api/chat/[id]/route.ts`).
*   **User Experience:** Instant visual feedback as the user types. Sent messages appear immediately in the UI (optimistically via `useChat`). Smooth scrolling keeps the latest messages in view.

### 2. Streaming AI Responses

*   **Feature:** AI ("Pulse") responses are displayed token-by-token as they are generated, rather than waiting for the full response.
*   **Purpose:** Improves perceived performance significantly, making the AI feel much more responsive and engaging.
*   **Function:**
    *   **Backend API (`/api/chat/[id]/route.ts`):** Uses `streamText` (Vercel AI SDK Core) to call the selected LLM (e.g., OpenAI, Anthropic). Returns the result using `result.toDataStreamResponse()`, which creates a streaming HTTP response compatible with `useChat`. Uses `result.consumeStream()` to ensure server-side completion (e.g., `onFinish` runs).
    *   **Frontend (`useChat` Hook):** Consumes the streaming response from the API. Progressively updates the `content` of the last message object (role: 'assistant') in its internal `messages` array as new text tokens arrive.
    *   **Rendering (`ChatMessage` Component):** Re-renders efficiently (leveraging React 19 Compiler) as the `content` of the last message updates, displaying the accumulating text.
*   **User Experience:** Users start seeing Pulse's response almost immediately after sending their message, creating a dynamic and interactive feel, avoiding frustratingly long waits.

### 3. AI Agent "Pulse" - Core Conversational Logic

*   **Feature:** The backend AI logic that understands user input, maintains context, follows conversational rules (neutrality), and generates appropriate responses, potentially invoking tools.
*   **Purpose:** To facilitate a natural, unbiased, and insightful conversation aimed at understanding the user's perspective on a given topic.
*   **Function:**
    *   **Backend API (`/api/chat/[id]/route.ts`):**
        *   **LLM Call:** Uses `streamText` with the configured LLM provider (e.g., `openai('gpt-4o')`, `anthropic('claude-3.5-sonnet')`) instance from the AI SDK Core.
        *   **System Prompt:** A detailed, carefully crafted system prompt defines Pulse's persona (neutral facilitator), core objective (gather nuanced opinion), conversational strategy (open-ended questions first, neutral clarification), constraints (no opinions), and guidelines for using tools (Intelligent Question Sourcing, GenUI invocation, future Research tools). This prompt is passed to `streamText`.
        *   **Context Management:** The current `messages` array (full conversation history) received from the client is passed to `streamText`, allowing the LLM to understand the preceding context.
        *   **Response Generation:** The LLM generates the next text response based on the system prompt, message history, and the latest user message. It may also decide to call a tool based on its instructions and context.
*   **User Experience:** The user interacts with an AI that seems curious, listens attentively, asks relevant questions, and remains objective, fostering a sense of trust and encouraging authentic sharing.

### 4. Embedded Generative UI (GenUI) Invocation & Rendering

*   **Feature:** The AI's ability to seamlessly embed interactive UI elements (polls, sliders, buttons) within its chat messages to ask structured questions.
*   **Purpose:** To collect specific, quantitative data points directly within the natural flow of the conversation, capturing nuance contextually.
*   **Function:**
    *   **Tool Definition (Backend):** Tools representing GenUI components (e.g., `displayMultipleChoice`, `displaySliderScale`) are defined using the AI SDK `tool()` helper. These tools *do not* have an `execute` function as they are handled client-side. They have clear `description`s for the LLM and `parameters` defined with Zod schemas (e.g., `{ questionId: z.string(), questionText: z.string(), options: z.array(z.object({ id: z.string(), text: z.string() })) }`).
    *   **Agent Logic (Backend - during `streamText`):** Based on conversation context and the result of "Intelligent Question Sourcing", the LLM decides to call one of the defined GenUI tools. The AI SDK formats this as a `tool_invocation` within the streamed response. The `args` for the invocation contain the necessary parameters sourced/generated from the `questions` database (e.g., `{ questionId: 'q123', questionText: 'Rate effectiveness...', options: [...] }`).
    *   **Frontend (`useChat` Hook):** The hook parses the streamed response, identifying `tool_invocation` parts within the assistant's message. These are added to the `messages` array with `type: 'tool-invocation'`.
    *   **Frontend (`ChatMessage` Component):** When rendering an assistant message, it checks for message parts with `type === 'tool-invocation'`. If found, it dynamically renders the corresponding interactive React component (e.g., `<MultipleChoiceInput>`, `<SliderInput>` located in `components/chat/[id]/components/generative-ui/`) passing the `args` from the `tool_invocation` as props.
*   **User Experience:** Interactive elements appear naturally within Pulse's message bubble. Users can directly interact (click options, move slider) without disrupting the chat flow. It feels like part of the conversation.

### 5. Intelligent Question Sourcing Integration (Within Agent Logic)

*   **Feature:** The AI agent prioritizes finding and reusing existing, relevant, unanswered structured questions from the database before generating new ones for GenUI invocation.
*   **Purpose:** Ensures data consistency, efficiency, prevents survey fatigue from slight variations, and builds a reusable, quality-controlled question bank.
*   **Function:**
    *   **Trigger (Backend - Agent Logic):** During `streamText` processing, when the LLM/logic identifies a need for structured data on a specific sub-topic.
    *   **Database Search (Backend):** Before invoking a GenUI tool, the backend logic triggers a query (using Drizzle) against the `questions` table.
        *   The query uses conversational context (topic tags, keywords from recent messages - potentially requiring NLP or LLM extraction) and filters by the desired `questionType`.
        *   Crucially, it joins with `survey_responses` (or a `user_answered_questions` lookup table) to **exclude** questions already answered by the current `userId`.
        *   (P2/P3) May involve semantic search using vector embeddings (`pgvector`) for more nuanced matching.
    *   **Evaluation (Backend/Agent Logic):**
        *   **Match Found:** If a suitable, unanswered existing question is retrieved, its definition (`questionId`, `text`, `parameters`) is used for the GenUI tool invocation.
        *   **No Match Found:** If no match, the agent uses the LLM (`generateObject` or structured prompting within `streamText`) to create a new question definition (text, type, parameters) based on the conversational context. This new definition is immediately saved to the `questions` table via Drizzle (with appropriate topic tags). The newly saved question definition is then used for the GenUI tool invocation.
*   **User Experience:** Largely invisible, but results in more consistent, relevant, and non-repetitive structured questions appearing within chats over time.

### 6. Structured Answer Submission (Via GenUI)

*   **Feature:** Capturing the user's input from the embedded GenUI components and saving it as structured data.
*   **Purpose:** To persist the quantitative data gathered contextually within the chat to the central `survey_responses` table.
*   **Function:**
    *   **Frontend (GenUI Components like `<MultipleChoiceInput>`):** On user interaction (e.g., option click, slider release), the component captures the `questionId` (passed as prop) and the selected `answer` value.
    *   **Server Action Call:** The component directly invokes the `submitSurveyResponse` Server Action (defined in `actions/survey.ts`), passing the `userId`, `questionId`, and `answer`.
    *   **Backend (Server Action `actions/survey.ts`):**
        *   Receives `userId`, `questionId`, `answer`.
        *   Validates the input data (e.g., using Zod).
        *   Re-authenticates/authorizes the user.
        *   Uses Drizzle (`db.insert`) to insert a new record into the `survey_responses` table, setting `source` to 'chat' and including the `chatId`.
        *   (Potentially) Updates a `user_answered_questions` lookup table or relies on unique constraints in `survey_responses` to track answered questions.
    *   **UI Feedback:** The GenUI component might update its appearance (e.g., disable options, show selection, display a small checkmark) based on its internal state after successfully triggering the action. The chat history itself doesn't typically show the submitted answer unless Pulse explicitly acknowledges it in the next turn (which is generally avoided to keep flow natural).
*   **User Experience:** User interacts with the embedded UI element; their structured answer is saved silently in the background without interrupting the primary chat flow. Confirmation is subtly provided via the UI element's state change.

### 7. Context Management

*   **Feature:** Maintaining the flow and relevance of the conversation over multiple turns within a single chat session.
*   **Purpose:** Enables coherent, meaningful, and non-repetitive dialogue.
*   **Function:**
    *   **Frontend (`useChat` Hook):** Maintains the list of all messages (`messages` array) in the current session's state.
    *   **Backend API (`/api/chat/[id]/route.ts`):** Receives the full `messages` history from the client on each request payload. Passes this complete history array to the `streamText` function's `messages` parameter.
    *   **LLM:** Uses the provided message history to understand the preceding context, remember user statements, and generate contextually appropriate responses and tool calls. (Note: Standard LLMs have finite context windows).
*   **User Experience:** Pulse remembers what was said earlier in the *current session*, leading to more natural and less repetitive conversations. Users don't have to repeat themselves frequently within the same chat.

### 8. Loading & Error States

*   **Feature:** Providing visual feedback during AI processing and handling potential errors gracefully.
*   **Purpose:** Manages user expectations during potentially slow operations and provides recovery options or clear feedback when things go wrong.
*   **Function:**
    *   **Frontend (`useChat` Hook):** Provides `isLoading` boolean state. `ChatInterface` uses this to display a loading indicator (e.g., "Pulse is thinking...", animated dots) while waiting for the backend stream to start after submission.
    *   **Frontend (`useChat` Hook):** Provides `error` object state. `ChatInterface` displays a user-friendly error message (e.g., "Sorry, something went wrong.") if the `error` state is populated (e.g., API request fails, stream terminates unexpectedly).
    *   **Frontend (`ChatInterface`):** May include a `reload` button (calling `useChat`'s `reload` function) which resubmits the last user message, allowing retries on error.
    *   **Backend API:** Implements `try...catch` around `streamText` calls and uses the `onError` callback within `streamText` options to log server-side errors (e.g., to Sentry) and potentially send structured error information via the stream's data channel if needed for specific client handling. Rate limiting errors (`429`) should be handled distinctly.
*   **User Experience:** User sees clear indicators when the AI is processing. If an error occurs, they receive helpful feedback and potentially an option to retry, preventing frustration.

### 9. (Future - P3) External Tool Integration (Research)

*   **Feature:** Pulse's ability to use external APIs (News, Web Search) to fetch real-time information relevant to the conversation.
*   **Purpose:** To provide accurate, neutral context during conversations, grounding discussion in facts and potentially triggering more informed user responses.
*   **Function:**
    *   **Backend (Tool Definition):** Define tools (e.g., `performWebSearch`, `fetchNewsHeadlines`) using AI SDK `tool()`, including Zod parameters (`query`, `maxResults`, etc.).
    *   **Backend (Tool Execution):** Implement server-side `execute` functions for these tools within the backend API. These functions call the external APIs (e.g., Serper, NewsAPI), process the results into a concise, structured format, and handle API key management securely.
    *   **Agent Logic (Backend - `streamText` Prompting):** The system prompt guides Pulse on *when* (e.g., user asks factual question, context needed for sensitive topic) and *how* to use these tools. Crucially, it instructs Pulse to synthesize and present the results *neutrally* and *briefly* before asking a user-centric follow-up question.
*   **User Experience:** Pulse might occasionally offer brief, factual context ("Recent studies suggest X...", "News reports indicate Y...") before asking for the user's opinion on the matter, enhancing the conversation's depth and demonstrating awareness of the external world without introducing bias.