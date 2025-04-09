# Feature Documentation: Dedicated Survey Feed

**Version:** 1.0
**Status:** Core Implementation (P1)

## 1. Core Purpose

To offer a distinct, streamlined interface for users to efficiently provide structured answers to individual survey questions sequentially. This complements the conversational chat mode by providing a focused, rapid data collection method, contributing significantly to the platform's overall quantitative data pool and catering to users who prefer direct interaction over extended chat.

## 2. User Experience

*   **Navigation:** Users access this feature via a dedicated "Survey" or "Answer Questions" section (e.g., `/survey`) in the application navigation.
*   **Interface:** Presents one question at a time in a clear, card-based format (`SurveyQuestionCard`).
*   **Filtering:** Users can filter the feed by Topic/Category to focus on areas of interest.
*   **Interaction:** Users interact directly with the input element appropriate for the question type (e.g., selecting a radio button, dragging a slider, clicking a button).
*   **Submission:** Upon selecting an answer, a "Submit" or "Submit & Next" button is used (or auto-submission for simple types like buttons). React's `useTransition` ensures the UI remains responsive during submission.
*   **Progression:** After a successful submission (handled via Server Action `actions/survey.ts`), the card updates (e.g., shows a loading skeleton via `<Suspense>` or a loading state) and is quickly replaced by the next available, *unanswered* question matching the active filters.
*   **Completion:** When no more unanswered questions match the filter criteria, a clear completion message is displayed (e.g., "You're all caught up in this topic!").

## 3. Key Functional Components & Features

*   **Dedicated Survey Page (`/survey`):**
    *   **Layout:** Contains filter controls and the area where the `SurveyQuestionCard` is dynamically rendered.
    *   **Initial Load:** Leverages **Next.js Server Components (RSC)** to fetch and render the *first* available, unanswered question server-side for optimal initial load performance (TTFB).
*   **Filter Controls:**
    *   Client Components (`'use client'`) allowing users to select topic tags or categories.
    *   Filter selections are maintained in client state and passed to the logic that fetches subsequent questions.
*   **Question Fetching Logic:**
    *   **Initial Fetch (Server-Side):** Done within the RSC rendering the `/survey` page. Uses **Drizzle** to query `questions` table, applying default filters and excluding questions already answered by the user (joining/checking `survey_responses` or a dedicated `user_answered_questions` table).
    *   **Subsequent Fetch (Client-Triggered):** After an answer is submitted, a client-side function (potentially wrapped in `useTransition`) triggers a mechanism (e.g., a dedicated Server Action or API Route Handler `getNextSurveyQuestion`) to fetch the *next* unanswered question based on current filters and user ID.
*   **Survey Question Card (`SurveyQuestionCard`):**
    *   A **Client Component** (`'use client'`) responsible for displaying a single question.
    *   Receives the question object (ID, text, type, parameters) as props.
    *   Dynamically renders the appropriate interactive input component based on `question.type`.
    *   Manages the user's currently selected answer in its local state (`useState`).
    *   Contains the "Submit" button logic.
*   **Interactive Input Components (`SurveyMultipleChoice`, `SurveySliderScale`, etc.):**
    *   Specific Client Components nested within `SurveyQuestionCard`.
    *   Handle the actual user interaction (radio clicks, slider drags).
    *   Update the parent `SurveyQuestionCard`'s state with the selected answer.
*   **Answer Submission Logic:**
    *   **Trigger:** User clicks the "Submit" button in `SurveyQuestionCard`.
    *   **Action:** Invokes the `submitSurveyResponse` **Server Action** (defined in `actions/survey.ts`). This is the *same* action used by the Chat GenUI components.
    *   **Payload:** Sends `userId`, `questionId`, `answerValue`, and `source: 'survey'`.
    *   **State Management:** Uses **React `useTransition`** hook to manage the pending state during submission, keeping the UI interactive. The `isPending` state can disable the submit button and show loading indicators.
*   **Backend (`actions/survey.ts` - `submitSurveyResponse` Server Action):**
    *   Receives submission payload.
    *   **Validation:** Uses **Zod** schemas (potentially generated from Drizzle schema) to validate input.
    *   **Authorization:** Re-validates user authentication (**Supabase Auth**).
    *   **Database Interaction:** Uses **Drizzle** to:
        *   Insert the validated answer into the `survey_responses` table.
        *   Record that the user answered the question (e.g., insert into `user_answered_questions` or rely on unique constraint).
    *   Uses `db.transaction` if multiple database writes are needed for atomicity.
    *   Returns success/error status to the client.
    *   **Rate Limiting:** Applies rate limiting using **Upstash Redis** (`@upstash/ratelimit`) to prevent abuse.
*   **State Management (Client-Side - Page Level):**
    *   Manages the `currentQuestion` object.
    *   Manages `isLoadingNextQuestion` state (potentially derived from `useTransition`'s pending state).
    *   Manages `isFeedComplete` state.
    *   Manages `error` state for fetching/submitting.
    *   Manages applied `filters`.
*   **Loading/Completion/Error States:**
    *   Uses skeleton loaders (e.g., `shadcn/ui Skeleton`) within `<Suspense>` boundaries or conditional rendering based on pending/loading states while fetching the next question.
    *   Displays clear messages for "All Caught Up" or error scenarios.

## 4. Technical Flow Summary (Submitting One Answer)

1.  **User:** Interacts with the `SurveyQuestionCard` (Client Component) and selects an answer. Client state updates.
2.  **User:** Clicks "Submit & Next".
3.  **Frontend:** `startTransition` is called:
    *   UI enters pending state (button disabled, loader shown).
    *   `submitSurveyResponse` Server Action (`actions/survey.ts`) is invoked with `userId`, `questionId`, `answerValue`, `source='survey'`.
4.  **Backend (Server Action):**
    *   Validates input (Zod). Authorizes user (Supabase).
    *   Uses Drizzle within `db.transaction` to insert into `survey_responses` and update `user_answered_questions`.
    *   Returns success status.
5.  **Frontend:**
    *   Receives success from Server Action.
    *   Still within `startTransition`, triggers `getNextSurveyQuestion` (Server Action/API Route Handler).
6.  **Backend (`getNextSurveyQuestion`):**
    *   Authorizes user.
    *   Uses Drizzle to query `questions` table, applying filters and *excluding* all `questionId`s found in `user_answered_questions` for the `userId`. Orders appropriately. Fetches `LIMIT 1`.
    *   Returns the next question object or indicates completion.
7.  **Frontend:**
    *   Receives the next question object (or completion signal).
    *   Updates the `currentQuestion` state (or `isFeedComplete` state).
    *   `useTransition` completes, UI exits pending state, and the new `SurveyQuestionCard` (or completion message) renders.

## 5. Relationship to Other Features

*   **Data Source:** Contributes quantitative data to the central `survey_responses` table, alongside the Chat Interface's GenUI.
*   **Question Database:** Reads available questions from the central `questions` table.
*   **Answer Tracking:** Relies on the same answer tracking mechanism (`survey_responses` or `user_answered_questions`) used by the Chat Interface to prevent duplication.
*   **Insights Hub (`/explore`):** Data submitted via the Survey Feed directly contributes to the aggregated results displayed on the Explore page.
*   **User Authentication:** Requires users to be authenticated via Supabase Auth to track answered questions and submit data.
*   **Server Actions:** Uses the shared `actions/survey.ts` for answer submission, promoting code reuse.