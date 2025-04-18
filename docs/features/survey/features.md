# Feature Breakdown: Dedicated Survey Feed

**Version:** 1.0
**Status:** Core Implementation (P1)

This document provides a detailed breakdown of the features constituting the Global Pulse Dedicated Survey Feed (`/survey`), explaining their function and technical underpinnings, referencing best practices from the Ultimate Performance Guide.

---

### 1. Dedicated UI Section & Routing

*   **Feature:** A distinct `/survey` page accessible via main navigation, offering a focused interface for answering structured questions sequentially.
*   **Purpose:** Provides an alternative, high-throughput method for users to contribute structured data compared to the conversational chat interface.
*   **Function:**
    *   **Next.js Routing:** Utilizes the Next.js App Router to define the `/survey` route (`app/survey/page.tsx`).
    *   **Component Structure:** The page component likely acts as a container, managing the overall feed state and potentially fetching the initial question. It's likely a **Client Component** (`'use client'`) due to the need for interactive state management (current question, filters, loading states) although the initial shell could be server-rendered. Leverages **React 19** Hooks for state and transitions.
*   **User Experience:** Users navigate to a clear, purpose-built section for quickly answering questions.
*   **Performance:** Standard Next.js routing performance. Initial load optimized via RSCs/Client Component boundaries where applicable.

### 2. Single Question Display (`SurveyQuestionCard`)

*   **Feature:** Presents only one question at a time within a clear, self-contained card component.
*   **Purpose:** Focuses user attention, simplifies interaction, and structures the feed flow.
*   **Function:**
    *   **React Component:** A dedicated component (`components/survey/SurveyQuestionCard.tsx`) receives the current `question` object as a prop.
    *   **Rendering Logic:** Displays the `question.questionText` and dynamically renders the appropriate interactive input control based on `question.questionType` (see Feature 5).
*   **User Experience:** Clean, uncluttered interface presenting one task at a time.
*   **Performance:** Efficient rendering of a single component per step. Relies on **React Compiler** for optimizing re-renders of the card and its children.

### 3. Question Sourcing Logic (Backend API)

*   **Feature:** Backend logic to efficiently determine and fetch the *next* relevant, unanswered question for the specific user based on selected filters.
*   **Purpose:** Ensures users see a continuous, personalized stream of questions they haven't answered yet.
*   **Function:**
    *   **API Endpoint:** A dedicated API Route (`app/api/survey/next-question/route.ts`).
    *   **Authentication:** Endpoint validates the user session (using Supabase Auth helpers from `@supabase/ssr`).
    *   **Filtering Parameters:** Accepts filter parameters (e.g., `topicTag`) from the frontend request.
    *   **Database Query (Drizzle):**
        *   Constructs an efficient Drizzle query against the `questions` table.
        *   **CRITICAL: Selects Only Necessary Fields** from `questions` (e.g., `id`, `questionText`, `questionType`, `parameters`).
        *   Applies `WHERE` clauses based on user filters (e.g., `eq(schema.questions.topicTag, selectedTag)`).
        *   **CRITICAL: Excludes Answered Questions.** Uses a subquery or `LEFT JOIN` with `survey_responses` (or a dedicated `user_answered_questions` table) filtering by the authenticated `userId` and checks for `IS NULL` to find questions *not* answered. This join/subquery **must** operate on indexed columns (`survey_responses.userId`, `survey_responses.questionId`) for performance.
        *   Applies ordering logic (e.g., `orderBy(desc(schema.questions.createdAt))`).
        *   Uses `.limit(1)` to fetch only the next single question.
    *   **Response:** Returns the fetched question object or an empty response/specific status if no more questions match.
*   **User Experience:** Seamless transition between questions without seeing repeats (within applied filters).
*   **Performance:** Heavily dependent on **Supabase/Postgres Database Indexing** for efficient filtering and exclusion joins/subqueries. Lean Drizzle queries minimize overhead. Caching via `unstable_cache` or Redis is difficult here due to the highly personalized nature (depends on `userId` and previously answered state).

### 4. User Filtering Controls

*   **Feature:** UI elements allowing users to filter the types of questions presented in the feed (e.g., by topic).
*   **Purpose:** Allows users to focus their contributions on areas of interest.
*   **Function:**
    *   **React Components:** Standard UI controls (e.g., `<Select>`, `<Button>`) integrated into the `/survey` page.
    *   **State Management:** Client-side React state (`useState`) holds the currently selected filter values.
    *   **API Parameterization:** Selected filter values are passed as query parameters to the `/api/survey/next-question` endpoint whenever a new question is requested.
*   **User Experience:** Users can easily narrow the scope of questions they engage with.
*   **Performance:** Minimal client-side overhead. Backend query performance depends on indexing the filtered columns in the `questions` table.

### 5. Dynamic Question Type Rendering

*   **Feature:** The ability to display different interactive UI controls based on the `questionType` field of the fetched question.
*   **Purpose:** Supports diverse structured data formats (multiple choice, scales, etc.).
*   **Function:**
    *   **Conditional Rendering (React):** The `SurveyQuestionCard` component uses conditional logic (e.g., `switch` statement or object mapping) based on `props.question.questionType`.
    *   **Dedicated Input Components:** Renders specific sub-components like `<SurveyMultipleChoice>`, `<SurveySliderScale>`, `<SurveySimpleButtons>` (located in `components/survey/inputs/`) passing the relevant `question.parameters` (e.g., options, min/max) as props.
*   **User Experience:** Users see the appropriate, intuitive interface for each question type.
*   **Performance:** Standard React conditional rendering. Well-structured components benefit from code splitting and React Compiler optimizations.

### 6. Answer Interaction & Client-Side Capture

*   **Feature:** Users interact directly with the rendered question input controls (click radio, move slider) to make their selection.
*   **Purpose:** Captures the user's response within the frontend before submission.
*   **Function:**
    *   **React State:** Each specific input component (e.g., `<SurveyMultipleChoice>`) manages its own local state (`useState`) to track the user's current selection (e.g., selected option ID, current slider value). `onChange` handlers update this state.
*   **User Experience:** Immediate visual feedback within the input control as the user makes a selection.
*   **Performance:** Efficient, standard React local state updates.

### 7. Answer Submission (Server Action)

*   **Feature:** Securely submitting the captured answer to the backend for validation and storage.
*   **Purpose:** Persists user contributions to the database.
*   **Function:**
    *   **Server Action (`actions/survey.ts`):** A dedicated `submitSurveyResponse` function defined with `'use server'`.
    *   **Invocation:** Triggered by a "Submit" or "Next" button onClick handler within the `SurveyQuestionCard` or specific input component. The call is wrapped in **React `useTransition`** to prevent UI blocking.
    *   **Payload:** Passes necessary data: `userId` (implicitly available via Supabase server auth helpers), `questionId`, the locally captured `answerValue`, and `source: 'survey'`.
    *   **Backend Logic (within Action):**
        *   **CRITICAL: Validate & Authorize:** Re-validates input using Zod/Valibot schemas (ideally derived from Drizzle schema). Re-checks user authentication.
        *   **Database Insert (Drizzle):** Uses `db.insert(schema.surveyResponses).values(...)` within a `try...catch` block. Enforces data integrity via Drizzle's type safety and DB constraints.
        *   **Answer Tracking:** Ensures the `user_answered_questions` state is updated (implicitly by the insert or explicitly).
        *   **Return Value:** Returns success status or structured error information.
*   **User Experience:** Clicking "Submit" feels responsive due to `useTransition`. Clear feedback is provided on success or failure.
*   **Performance:** Server Actions provide secure RPC. Drizzle ensures efficient DB writes. `useTransition` crucial for maintaining client responsiveness (INP).

### 8. Sequential Feed Progression

*   **Feature:** Automatically loading the next question after a successful answer submission.
*   **Purpose:** Creates a smooth, continuous flow for the user to answer multiple questions efficiently.
*   **Function:**
    *   **Client-Side Orchestration:** The main survey page component manages this flow.
    *   **Trigger:** On successful completion of the `submitSurveyResponse` Server Action (detected via the action's return value or state managed by `useActionState` if used).
    *   **Refetch:** Initiates a new fetch request to the `/api/survey/next-question` endpoint to get the subsequent question data.
    *   **State Update:** Updates the component's state with the newly fetched question, triggering a re-render of the `SurveyQuestionCard`.
*   **User Experience:** Feels like a continuous stream or "feed" of questions without manual intervention between submissions.
*   **Performance:** Depends on the speed of the Server Action + the subsequent API call for the next question. Efficient backend queries are key.

### 9. Loading, Error & Completion State Handling

*   **Feature:** Providing clear visual feedback to the user about the feed's current status.
*   **Purpose:** Manages user expectations and improves usability.
*   **Function:**
    *   **Loading State:**
        *   Uses `isPending` from `useTransition` during answer submission.
        *   Manages a separate loading state (`useState`) while fetching data from `/api/survey/next-question`.
        *   Displays skeleton loaders (`components/ui/skeleton`) or spinners within the `SurveyQuestionCard` area during loading. **React `<Suspense>`** can potentially be used if data fetching is integrated appropriately.
    *   **Error State:**
        *   Catches errors from the API fetch or the Server Action.
        *   Displays user-friendly error messages within the UI.
        *   May offer a "Retry" option.
    *   **Completion State:**
        *   When `/api/survey/next-question` returns no question, sets a state variable (e.g., `isComplete`).
        *   Renders a specific "You're all caught up!" message or component instead of the question card.
*   **User Experience:** User is always informed about what the system is doing (loading, submitting) or if there's an issue or no more content.
*   **Performance:** Skeleton loaders improve perceived performance by matching the expected layout. `useTransition` prevents UI freezes during submission.