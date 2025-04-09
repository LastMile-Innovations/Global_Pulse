# TODO List: Conversational Chat Interface Implementation

**Objective:** Implement the core Conversational Chat Interface feature, enabling users to interact with the AI agent "Pulse", receive streaming responses, and answer structured questions via embedded Generative UI components.

**Note:** This list focuses on the chat feature itself. Dependencies like Authentication, the central `Questions` database schema, and the `/api/survey/answer` endpoint (or `submitSurveyResponse` Server Action) are assumed to be implemented or planned separately but are essential prerequisites. Phasing (P1, P3) is noted where applicable.

---

### 1. Backend Setup & API Route (`/api/chat/[id]/route.ts`) (P1)

*   [ ] **API Route Structure:** Create the dynamic API route `app/api/chat/[id]/route.ts`.
*   [ ] **Request Handling:** Implement the `POST` handler to receive the `messages` array and potentially other parameters (e.g., `chatId` from the route parameter).
*   [ ] **Authentication & Authorization:** Secure the endpoint; ensure only the authenticated user associated with the `chatId` can interact. Fetch `userId`.
*   [ ] **AI SDK Provider Initialization:** Ensure AI SDK providers (e.g., OpenAI, Anthropic) are correctly initialized server-side.
*   [ ] **System Prompt Definition:** Craft the detailed system prompt for "Pulse" defining persona, neutrality rules, questioning strategy, and GenUI/tool usage guidelines. Store securely/accessibly.
*   [ ] **Tool Definitions (GenUI):**
    *   [ ] Define AI SDK tools (`tool()`) for each GenUI type (e.g., `displayMultipleChoice`, `displaySliderScale`, `displaySimpleButtons`).
    *   [ ] Define clear `description`s for each tool.
    *   [ ] Define Zod schemas for the `parameters` of each tool (e.g., `questionId`, `questionText`, `options`).
    *   [ ] Ensure these tools **do not** have server-side `execute` functions.
*   [ ] **Core `streamText` Call:**
    *   [ ] Integrate `streamText` from Vercel AI SDK Core.
    *   [ ] Pass the initialized model, system prompt, incoming `messages` history, and defined GenUI tools.
    *   [ ] Implement `onError` callback for logging server-side LLM/streaming errors.
    *   [ ] Implement `onFinish` callback (potentially for logging usage or final state checks, *not* for primary chat saving - see DB section).
*   [ ] **Streaming Response:** Return the `streamText` result using `result.toDataStreamResponse()` to create the AI SDK Data Stream.
*   [ ] **Server Completion:** Implement `result.consumeStream()` after returning the response to ensure `onFinish` and stream processing completes reliably.
*   [ ] **Chat History Persistence (Integration):**
    *   [ ] Add logic (likely within `onFinish` or after `consumeStream` awaits) to save the *assistant's final message* (including tool calls/results if needed) to the `chat_messages` table via Drizzle, associated with the `chatId`.
    *   [ ] Ensure user messages sent in the request payload are also saved reliably (potentially before the `streamText` call or transactionally).

### 2. Backend - Intelligent Question Sourcing Logic (P1/P2)

*   [ ] **Trigger Logic:** Determine *when* within the agent's processing flow to attempt sourcing (e.g., as a distinct step before the main LLM response generation, or guided by specific LLM output).
*   [ ] **Context Extraction:** Implement logic (potentially using NLP or another LLM call) to extract relevant keywords, topic tags, or user intent from the current conversation context.
*   [ ] **Database Query (Drizzle):**
    *   [ ] Implement the Drizzle query to search the `questions` table based on extracted context (keywords/tags), desired `questionType`.
    *   [ ] Implement the join/subquery to filter out questions already present in `survey_responses` for the current `userId`.
    *   [ ] (P2) Integrate semantic search capabilities if using `pgvector`.
*   [ ] **Result Evaluation:** Implement logic to evaluate the query results and select the best matching existing question, if any.
*   [ ] **Generation Fallback (AI SDK):**
    *   [ ] If no suitable question is found, implement the call to `generateObject` (or use structured prompting within `streamText`) to create a new question definition (text, options, etc.) based on the context.
*   [ ] **Persistence (Drizzle):**
    *   [ ] Implement the Drizzle `insert` call to save newly generated question definitions to the `questions` table. Ensure topic tags and other metadata are saved correctly.
*   [ ] **Integration with `streamText`:** Pass the sourced or newly generated question data correctly into the `args` of the GenUI `tool_invocation` within the main `streamText` call.

### 3. Frontend - Chat UI Components (P1)

*   [ ] **Main Interface (`ChatInterface`):**
    *   [ ] Create the main component (`components/chat/[id]/chat-interface.tsx`).
    *   [ ] Use the `useChat` hook.
    *   [ ] Implement the message scrolling area.
    *   [ ] Map over `messages` array from `useChat` to render `ChatMessage` components.
    *   [ ] Display loading indicators based on `useChat`'s `isLoading` state.
    *   [ ] Display error messages based on `useChat`'s `error` state.
    *   [ ] Include a retry mechanism (`reload` function from `useChat`).
*   [ ] **Message Component (`ChatMessage`):**
    *   [ ] Create the component (`components/chat/[id]/chat-message.tsx`).
    *   [ ] Differentiate rendering based on `message.role` ('user' vs 'assistant').
    *   [ ] Handle rendering different `message.parts` within an assistant message:
        *   [ ] Render standard text parts.
        *   [ ] Detect parts with `type: 'tool-invocation'`.
        *   [ ] Dynamically render the appropriate GenUI component (e.g., `<MultipleChoiceInput>`) based on `toolInvocation.toolName`, passing `toolInvocation.args` as props.
*   [ ] **Input Component (`ChatInput`):**
    *   [ ] Create the component (`components/chat/[id]/chat-input.tsx`).
    *   [ ] Use a `textarea` for user input, bound to `useChat`'s `input` state and `handleInputChange`.
    *   [ ] Implement the "Send" button, triggering `useChat`'s `handleSubmit` onClick.
    *   [ ] Implement submitting via Enter key (optional: Shift+Enter for newline).
    *   [ ] Disable input/button when `useChat` is loading.

### 4. Frontend - Generative UI Components (P1)

*   [ ] **Create Base Directory:** `components/chat/[id]/components/generative-ui/`
*   [ ] **Multiple Choice Component (`MultipleChoiceInput.tsx`):**
    *   [ ] Receives `questionId`, `questionText`, `options` array as props from `ChatMessage`.
    *   [ ] Renders the question text and clickable options (e.g., radio buttons, styled buttons).
    *   [ ] Manages local selection state.
    *   [ ] On selection/click, calls the `submitSurveyResponse` Server Action, passing necessary data.
    *   [ ] Provides visual feedback on submission (e.g., disable options, show selection).
    *   [ ] Handles potential errors returned from the Server Action.
*   [ ] **Slider Scale Component (`SliderInput.tsx`):**
    *   [ ] Receives `questionId`, `questionText`, `min`, `max`, `step` as props.
    *   [ ] Renders the question text and an interactive slider element.
    *   [ ] Manages local slider value state.
    *   [ ] On interaction end (e.g., `onPointerUp`, `onChangeCommitted`), calls the `submitSurveyResponse` Server Action.
    *   [ ] Provides visual feedback (e.g., disable slider, display selected value).
    *   [ ] Handles errors.
*   [ ] **Simple Buttons Component (`ButtonsInput.tsx`):**
    *   [ ] Receives `questionId`, `questionText`, `options` (button labels/values) as props.
    *   [ ] Renders question text and clickable buttons.
    *   [ ] On button click, calls the `submitSurveyResponse` Server Action.
    *   [ ] Provides visual feedback (e.g., disable buttons, highlight selected).
    *   [ ] Handles errors.
*   [ ] **(Add other GenUI types as needed)**

### 5. Frontend - State Management & Hook Integration (P1)

*   [ ] **`useChat` Hook Setup:**
    *   [ ] Initialize `useChat` in `ChatInterface`.
    *   [ ] Pass the correct `api` endpoint path (`/api/chat/${chatId}`).
    *   [ ] Configure options like `initialMessages` if needed (e.g., fetching history on load).
    *   [ ] Implement `onError` client-side logging/handling if needed beyond displaying the error state.
*   [ ] **Error Handling UI:** Ensure user-friendly messages are shown for different error scenarios (network error, server error, rate limit).
*   [ ] **Loading State UI:** Implement non-intrusive loading indicators (e.g., pulsing dots, "Pulse is thinking...").

### 6. Backend - Answer Submission (Server Action) (P1)

*   [ ] **Define Server Action:** Create `actions/survey.ts` (or similar) with `submitSurveyResponse(userId, questionId, answer)`.
*   [ ] **Validation:** Add Zod validation for incoming arguments.
*   [ ] **Authorization:** Verify the `userId` corresponds to the authenticated user.
*   [ ] **Database Interaction (Drizzle):**
    *   [ ] Implement `db.insert(schema.surveyResponses).values(...)` call.
    *   [ ] Include `source: 'chat'` and the `chatId`.
    *   [ ] Implement insertion into `user_answered_questions` lookup table (or handle via unique constraint on `survey_responses(userId, questionId)`).
*   [ ] **Error Handling:** Implement `try...catch` around DB operations.
*   [ ] **Return Value:** Return success status or specific error information to the calling GenUI component.

### 7. Testing (P1 & Ongoing)

*   [ ] **Backend API Tests:**
    *   [ ] Test API route authentication/authorization.
    *   [ ] Test basic streaming response (mocking LLM).
    *   [ ] Test tool invocation formatting (mocking LLM).
    *   [ ] Test intelligent sourcing logic (mocking DB and LLM).
    *   [ ] Test question generation and saving (mocking LLM).
*   [ ] **Server Action Tests:**
    *   [ ] Test `submitSurveyResponse` validation and DB insertion logic (mocking DB).
*   [ ] **Frontend Component Tests (React Testing Library):**
    *   [ ] Test rendering of `ChatMessage` with text and tool invocations.
    *   [ ] Test rendering and basic interaction of individual GenUI components.
    *   [ ] Test `ChatInterface` loading and error states.
*   [ ] **E2E Tests (Playwright):**
    *   [ ] Simulate a full chat conversation including text exchanges.
    *   [ ] Simulate interaction with an embedded GenUI component and verify answer submission (requires mocking backend response or checking DB state).
    *   [ ] Test streaming updates visually.

### 8. Future Enhancements (P3)

*   [ ] **Research Tool Integration:**
    *   [ ] Define external tools (Web Search, News) in the backend API.
    *   [ ] Implement `execute` functions for these tools, calling external APIs securely.
    *   [ ] Update Pulse's system prompt to guide neutral usage and presentation of research results.
*   [ ] **Advanced Context Management:** Explore strategies for managing longer conversations if context windows become limiting (e.g., summarization).
*   [ ] **Cross-Session Memory (Opt-in):** Investigate options for Pulse to remember user preferences or past topics across different chat sessions (requires significant privacy consideration and consent).