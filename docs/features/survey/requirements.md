# Requirements Document: Dedicated Survey Feed

**Version:** 1.0
**Status:** Requirements Defined (P1 Core)

## 1. Introduction

This document outlines the functional and non-functional requirements for the Global Pulse "Dedicated Survey Feed" feature. This interface provides a streamlined, sequential way for users to answer structured questions, complementing the Conversational Chat Interface and contributing to the platform's data pool. Requirements incorporate best practices for performance and maintainability using the target stack (Next.js 15, React 19, Drizzle, Supabase, Redis).

## 2. Goals

*   Provide an efficient, focused interface for rapid structured data contribution.
*   Maximize user participation by offering an alternative to the chat interface.
*   Ensure a smooth, continuous user experience navigating between questions.
*   Maintain data consistency by drawing from the central Questions database.
*   Contribute reliably to the platform's overall dataset (`survey_responses` table).

## 3. Functional Requirements (FR)

### 3.1 User Interface & Interaction

*   **REQ-SURV-UI-01:** The system must provide a dedicated interface, accessible via a distinct route (e.g., `/survey`).
*   **REQ-SURV-UI-02:** The interface must display only one structured question at a time, presented clearly within a container component (`SurveyQuestionCard`).
*   **REQ-SURV-UI-03:** The interface must dynamically render the correct interactive input controls (e.g., multiple choice radios, slider, buttons) based on the `questionType` of the currently displayed question.
*   **REQ-SURV-UI-04:** Users must be able to select or input their answer using the displayed interactive controls. Client-side state must reflect the user's selection. The submission process must utilize React `useTransition` to maintain UI responsiveness.
*   **REQ-SURV-UI-05:** Upon successful answer submission, the interface must automatically fetch and display the next appropriate unanswered question based on current filters, providing smooth visual transitions (e.g., skeleton loaders, leveraging React `<Suspense>` where applicable).
*   **REQ-SURV-UI-06:** The system must display a clear completion message (e.g., "You're all caught up!") when no more unanswered questions match the user's filters.
*   **REQ-SURV-UI-07:** Users must be able to apply filters (e.g., by Topic/Category) to the questions presented in the feed.
*   **REQ-SURV-UI-08:** The interface must provide clear loading and error states during question fetching and answer submission.

### 3.2 Backend Logic & Data Handling

*   **REQ-SURV-BACKEND-01 (Question Fetching API):** A dedicated backend API endpoint (e.g., `/api/survey/next-question`) must exist to fetch the next appropriate question for the *authenticated* user.
*   **REQ-SURV-BACKEND-02 (Question Sourcing Query):** The question fetching API must execute an efficient Drizzle query against the `questions` table, performing the following:
    *   Filter based on parameters provided by the client (e.g., topicTag).
    *   **Filter out questions already answered by the authenticated user** (using `userId` context from Supabase Auth and checking against `survey_responses` or a dedicated tracking table).
    *   Apply appropriate ordering logic.
    *   Select only necessary fields from the `questions` table.
    *   Return only a single question (`limit(1)`).
*   **REQ-SURV-BACKEND-03 (Answer Submission Action):** A Next.js Server Action (`actions/survey.ts#submitSurveyResponse`) must handle the submission of structured answers.
*   **REQ-SURV-BACKEND-04 (Submission Validation & Auth):** The `submitSurveyResponse` Server Action must:
    *   Re-authenticate the user making the request.
    *   Validate the incoming payload (`questionId`, `answerValue`) using Zod/Valibot schemas, ensuring the answer format matches the question type.
*   **REQ-SURV-BACKEND-05 (Submission Persistence):** The `submitSurveyResponse` Server Action must:
    *   Insert the validated answer into the `survey_responses` table via an efficient Drizzle `insert` query, including `userId`, `questionId`, `answerValue`, and `source='survey'`.
    *   Ensure the user/question combination is reliably marked as answered (e.g., via the insert or updating a tracking table).
    *   Handle potential database errors (e.g., unique constraint violations) gracefully.
    *   Return a clear success or error status to the client.

## 4. Non-Functional Requirements (NFR)

*   **REQ-NFR-SURV-PERF-01 (Responsiveness):** The UI must remain responsive during answer submission and while fetching the next question (leveraging `useTransition`, skeleton loaders). Target INP improvements.
*   **REQ-NFR-SURV-PERF-02 (Query Speed):** The backend query to find the next unanswered question must be highly performant, even with large numbers of users, questions, and answers. This requires effective **database indexing** on relevant columns (`questions.topicTag`, `survey_responses.userId`, `survey_responses.questionId`). Target API P95 response time < 500ms.
*   **REQ-NFR-SURV-PERF-03 (Client Performance):** Frontend components must be optimized using React 19 best practices (e.g., relying on **React Compiler**, ensuring component purity) to minimize re-renders.
*   **REQ-NFR-SURV-SCALE-01 (Scalability):** The backend API and database queries must scale efficiently to handle a large number of concurrent users using the survey feed.
*   **REQ-NFR-SURV-REL-01 (Reliability):** Answer submission must be reliable. Errors during submission or question fetching should be handled gracefully with clear user feedback.
*   **REQ-NFR-SURV-SEC-01 (Security):** The question fetching API and the answer submission Server Action must be securely protected, ensuring users can only fetch questions intended for them and submit answers as themselves. RLS policies on underlying tables must provide defense-in-depth.
*   **REQ-NFR-SURV-SEC-02 (Rate Limiting):** Consider applying rate limiting (e.g., using Upstash Redis via Middleware or directly in the API/Action) to prevent abuse of the question fetching or submission endpoints.
*   **REQ-NFR-SURV-USE-01 (Usability):** The interface should be simple, intuitive, and require minimal effort for users to navigate and submit answers.
*   **REQ-NFR-SURV-ACC-01 (Accessibility):** The survey feed interface, including all interactive question types, must adhere to WCAG 2.1 AA standards.
*   **REQ-NFR-SURV-MAINT-01 (Maintainability):** Code should follow project standards, utilize TypeScript effectively, and leverage reusable components. Use `server-only` and `client-only` packages where appropriate to enforce boundaries.
*   **REQ-NFR-SURV-TEST-01 (Testability):** Backend logic (API route, Server Action) and frontend components should be unit/integration testable. E2E tests should cover the core flow of answering several questions sequentially.