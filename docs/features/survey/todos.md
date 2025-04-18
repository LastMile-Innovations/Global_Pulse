# TODO List: Dedicated Survey Feed Implementation

**Objective:** Implement the Dedicated Survey Feed feature, providing users with a streamlined interface to answer structured questions sequentially, ensuring high performance, reliability, and adherence to best practices.

**Note:** This list breaks down the feature into sub-components and tasks. Phasing (P1) indicates core implementation. It assumes prerequisite features like Authentication and the central `Questions` database schema are in place. References the Server Action file `actions/survey.ts`.

---

### 1. Backend - Next Question API (`/api/survey/next-question/route.ts`) (P1)

*   [ ] **API Route Setup:** Create the Next.js API Route file (`app/api/survey/next-question/route.ts`).
*   [ ] **Authentication:** Implement request handling (`GET`) and ensure the endpoint requires user authentication using Supabase Auth helpers (`@supabase/ssr`). Extract authenticated `userId`.
*   [ ] **Filter Handling:** Accept and parse filter parameters (e.g., `topicTag`) from the request query string.
*   [ ] **Drizzle Query Implementation:**
    *   [ ] Construct the Drizzle query to select from `schema.questions`.
    *   [ ] Apply filtering based on request parameters (`where` clause).
    *   [ ] **Implement Answer Exclusion:** Add logic (subquery or LEFT JOIN) using `schema.surveyResponses` to exclude questions where `survey_responses.userId` matches the authenticated user and `survey_responses.questionId` matches `questions.id`.
    *   [ ] **Select Specific Fields:** Ensure the query only selects necessary `questions` columns (`id`, `questionText`, `questionType`, `parameters`). Avoid `select()`.
    *   [ ] Apply ordering logic (e.g., `orderBy(desc(schema.questions.createdAt))`).
    *   [ ] Apply `.limit(1)` to fetch only the next question.
*   [ ] **Database Indexing Check (Crucial for Performance):**
    *   [ ] Verify necessary indexes exist in Supabase for efficient query execution:
        *   On `questions` table for filterable columns (e.g., `topicTag`).
        *   Composite index on `survey_responses(userId, questionId)` for fast answer exclusion lookup.
    *   [ ] Use `EXPLAIN ANALYZE` in Supabase SQL Editor to confirm query plan and index usage during development.
*   [ ] **Response Handling:** Return the fetched question object (if found) or a consistent empty/null response (if no more questions match) with appropriate status codes. Implement `try...catch` for database errors.
*   [ ] **Rate Limiting (Optional but Recommended):** Consider applying rate limiting (`@upstash/ratelimit` with Redis) to this endpoint to prevent abuse.

### 2. Backend - Answer Submission Server Action (`actions/survey.ts`) (P1)

*   [ ] **Server Action Definition:** Create/update `actions/survey.ts` and define the `submitSurveyResponse` async function with the `'use server'` directive.
*   [ ] **Input Parameters:** Define function signature to accept necessary parameters (e.g., `questionId: number`, `answerValue: unknown`). `userId` will be obtained server-side.
*   [ ] **Authentication & Authorization:** Use Supabase server helpers (`createClient`, `getUser`) within the action to get the authenticated `userId`. Throw an error if no user is found.
*   [ ] **Input Validation (Zod/Valibot):**
    *   [ ] Define Zod/Valibot schemas for the expected `answerValue` based on the `questionId` (requires fetching question type or having validation logic). Ideally, generate base schemas using `drizzle-zod`.
    *   [ ] Parse and strictly validate the incoming `answerValue` against the appropriate schema. Return validation errors clearly.
*   [ ] **Database Insert (Drizzle):**
    *   [ ] Use `db.insert(schema.surveyResponses).values(...)` to store the validated answer.
    *   [ ] Ensure `userId`, `questionId`, validated `answerValue`, and `source: 'survey'` are included.
    *   [ ] Wrap the database operation in a `try...catch` block to handle potential errors (e.g., unique constraint violations if using `user_answered_questions` alternative, general DB errors).
*   [ ] **Answer Tracking:** Ensure the mechanism for tracking answered questions (`survey_responses` insert or `user_answered_questions` update) is reliably handled within the action, potentially within a Drizzle transaction (`db.transaction`) if multiple steps are needed.
*   [ ] **Return Value:** Return a clear success status or a structured error object (e.g., `{ success: false, error: 'Validation failed', details: [...] }` or `{ success: false, error: 'Database error' }`) for the frontend to handle.

### 3. Frontend - UI Components (`/app/survey/`) (P1)

*   [ ] **Page Component (`app/survey/page.tsx`):**
    *   [ ] Set up the main Client Component (`'use client'`) to manage feed state.
    *   [ ] Implement state hooks (`useState`, `useReducer`) for `currentQuestion`, `isLoading`, `error`, `isComplete`, `selectedFilters`.
    *   [ ] Implement initial data fetch logic (e.g., in `useEffect` or triggered by filter change) to call `/api/survey/next-question`.
*   [ ] **Filter Components (`components/survey/filters.tsx`):**
    *   [ ] Create UI components for selecting filters (e.g., topic dropdown).
    *   [ ] Connect filter components to update the client state and trigger refetching of the next question.
*   [ ] **Question Card (`components/survey/SurveyQuestionCard.tsx`):**
    *   [ ] Create the component to display the current question.
    *   [ ] Receive `question` object as prop.
    *   [ ] Implement conditional rendering logic based on `question.questionType` to display the correct input component.
    *   [ ] Pass necessary `question.parameters` to the specific input component.
    *   [ ] Include the "Submit / Next" button, linking its `onClick` to the submission handler. Disable button during submission (`isPending` from `useTransition`).
*   [ ] **Input Components (`components/survey/inputs/*.tsx`):**
    *   [ ] Create specific components for each supported `questionType` (e.g., `SurveyMultipleChoice.tsx`, `SurveySliderScale.tsx`).
    *   [ ] Receive `parameters` (options, min/max) as props.
    *   [ ] Manage local input state (`useState`) to track the user's selection.
    *   [ ] Provide the selected value back to the parent (`SurveyQuestionCard` or Page) via a callback prop (`onAnswerChange`).
*   [ ] **Loading / Skeleton State:** Implement skeleton components (`components/ui/skeleton`) matching the `SurveyQuestionCard` layout to display during loading states. Integrate potentially with React `<Suspense>`.
*   [ ] **Error State:** Display user-friendly error messages based on error state.
*   [ ] **Completion State:** Render the "All caught up!" message when `isComplete` state is true.

### 4. Frontend - State Management & Flow Logic (P1)

*   [ ] **Data Fetching Logic:** Implement robust fetching logic for `/api/survey/next-question`, handling loading, success (updating `currentQuestion`), and error states.
*   [ ] **Submission Handler:**
    *   [ ] Create the function that will be called by the "Submit" button.
    *   [ ] Wrap the call to the `submitSurveyResponse` Server Action within `startTransition` hook from React.
    *   [ ] Use the `isPending` state from `useTransition` to disable UI elements during submission.
*   [ ] **Action Result Handling:** Process the success/error response returned by the `submitSurveyResponse` Server Action.
*   [ ] **Feed Progression Logic:** Upon successful submission, trigger the data fetching logic again to load the next question.
*   [ ] **Filter Integration:** Ensure changing filters correctly clears the current question (if desired) and triggers a refetch based on the new filter values.
*   [ ] **React Compiler Prep:** Ensure all components and hooks are written following React Rules (purity, immutability) to maximize benefits from the React 19 Compiler.

### 5. Testing (P1 & Ongoing)

*   [ ] **Backend API Tests:**
    *   [ ] Test `/api/survey/next-question` authentication.
    *   [ ] Test filtering logic (mocking Drizzle).
    *   [ ] Test answer exclusion logic (mocking Drizzle responses).
    *   [ ] Test response formats (question found vs. not found).
*   [ ] **Server Action Tests (`actions/survey.ts`):**
    *   [ ] Test `submitSurveyResponse` validation logic (pass/fail cases).
    *   [ ] Test authorization check.
    *   [ ] Test successful database insertion path (mocking Drizzle).
    *   [ ] Test database error handling path (mocking Drizzle errors).
*   [ ] **Frontend Component Tests (React Testing Library):**
    *   [ ] Test rendering of `SurveyQuestionCard` with different question types.
    *   [ ] Test interaction and state updates within specific input components.
    *   [ ] Test filter component interactions.
    *   [ ] Test loading, error, and completion state rendering in the main page component.
*   [ ] **E2E Tests (Playwright):**
    *   [ ] Simulate loading the survey page.
    *   [ ] Simulate applying filters.
    *   [ ] Simulate answering multiple questions sequentially, verifying the UI updates correctly between questions.
    *   [ ] Verify loading and completion states appear correctly.

### 6. Performance & Optimization (Ongoing)

*   [ ] **Database Indexing:** Continuously monitor and verify necessary indexes are in place and used effectively (see Step 1).
*   [ ] **API Performance:** Monitor response times for `/api/survey/next-question`.
*   [ ] **Server Action Performance:** Monitor execution time for `submitSurveyResponse`.
*   [ ] **Frontend Responsiveness:** Use React DevTools Profiler and browser performance tools to ensure smooth rendering and identify any bottlenecks caused by state updates or component rendering. Verify low INP metric.
*   [ ] **Bundle Size:** Ensure survey-specific components are reasonably sized and consider code-splitting if complex, non-critical UI elements are added later.