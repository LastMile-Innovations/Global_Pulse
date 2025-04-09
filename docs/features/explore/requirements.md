# Requirements Document: Insight Exploration Hub (/explore)

**Version:** 1.0
**Status:** Requirements Defined (P1 Core, P2 AI Dashboards)

## 1. Introduction

This document outlines the functional and non-functional requirements for the Global Pulse "Insight Exploration Hub" feature, accessible via the `/explore` route. This hub serves as the primary interface for users to view, analyze, and understand the aggregated, anonymized public opinion data collected by the platform. Requirements incorporate best practices for performance and user experience using the target stack (Next.js 15, React 19, Drizzle, Supabase, Redis, AI SDK).

## 2. Goals

*   Provide a centralized and accessible location for users to explore aggregated insights.
*   Present complex data in clear, understandable, and visually appealing formats.
*   Enable users to discover relevant insights through search and filtering.
*   Offer real-time (or near real-time) updates for ongoing topics/surveys.
*   Leverage AI to provide deeper interpretation and summarization of data.
*   Ensure a high-performance, responsive user experience.

## 3. Functional Requirements (FR)

### 3.1 Discovery & Navigation

*   **REQ-EXPL-NAV-01:** The system must provide a dedicated interface accessible via the `/explore` route.
*   **REQ-EXPL-NAV-02:** The Explore Hub must display an overview of available topics or survey results upon entry.
*   **REQ-EXPL-NAV-03:** Users must be able to search the available topics/questions by keywords.
*   **REQ-EXPL-NAV-04:** Users must be able to filter the displayed topics/questions based on criteria such as Topic/Category or date range.
*   **REQ-EXPL-NAV-05:** Users must be able to select a specific topic/question from the overview to navigate to a detailed results view.

### 3.2 Data Display & Visualization

*   **REQ-EXPL-DISP-01:** The detailed results view must clearly display the original text of the question(s) being analyzed.
*   **REQ-EXPL-DISP-02:** The system must fetch and display aggregated, anonymized data (e.g., response counts, percentages, averages) corresponding to the selected question(s).
*   **REQ-EXPL-DISP-03:** Aggregated data must be presented using appropriate visualization types (e.g., bar charts, pie charts, distribution histograms) based on the question type. Charting libraries must be performant.
*   **REQ-EXPL-DISP-04:** Visualizations must be interactive, providing specific values upon user interaction (e.g., hover tooltips).
*   **REQ-EXPL-DISP-05 (Real-time):** For topics/questions marked as "live" or ongoing, the displayed aggregated data and visualizations must update automatically in near real-time as new relevant answers are submitted, without requiring a manual page refresh.

### 3.3 AI-Powered Interpretation

*   **REQ-EXPL-AI-01 (Summary):** The detailed results view must provide an option (e.g., a button) for the user to trigger the generation of an AI-powered text summary of the key findings from the displayed aggregated data.
*   **REQ-EXPL-AI-02 (Summary Action):** A secure backend Server Action (`app/actions/explore/generateSummary.ts`) must exist to fetch relevant data, interact with an LLM via the AI SDK (`generateText`), and return the generated summary text.
*   **REQ-EXPL-AI-03 (Dashboard - P2):** The detailed results view must provide an option (e.g., a button) for the user to trigger the generation of a dynamic AI-powered dashboard.
*   **REQ-EXPL-AI-04 (Dashboard Action - P2):** A secure backend Server Action (`app/actions/explore/generateDashboard.ts`) must exist to fetch relevant data, interact with an LLM via the AI SDK (`streamText` with tools), and stream back instructions (text and tool invocations) to render specific insight components.
*   **REQ-EXPL-AI-05 (Dashboard Rendering - P2):** The frontend must be able to consume the streamed dashboard data and dynamically render the specified UI components (e.g., Insight Cards, Comparison Widgets).

### 3.4 Data Aggregation Backend

*   **REQ-EXPL-BACKEND-01:** Backend logic (API Routes or Server Actions/Functions) must exist to compute aggregated statistics (counts, percentages, averages) from the `survey_responses` table based on `questionId`.
*   **REQ-EXPL-BACKEND-02:** Aggregation queries must be performant and utilize appropriate database indexing. Consider using pre-aggregated summary tables/materialized views for optimization if necessary.
*   **REQ-EXPL-BACKEND-03:** All data returned by aggregation endpoints must be strictly anonymized, containing no PII.

### 3.5 (Optional) Personal Contextualization

*   **REQ-EXPL-OPT-PC-01:** If implemented, the system must allow logged-in users viewing results for a question they've answered to optionally see their own anonymized response contextualized against the aggregate (e.g., highlighted bar, text indicator). This must be done securely without compromising overall anonymity.

## 4. Non-Functional Requirements (NFR)

*   **REQ-NFR-EXPL-PERF-01 (Load Time):** The initial load time for the `/explore` overview page and detailed results views must be fast, optimizing for Core Web Vitals (LCP, TTFB). Leverage Next.js RSC and optimized asset loading.
*   **REQ-NFR-EXPL-PERF-02 (Interaction Speed):** Filtering, searching, and triggering AI features must feel responsive. Leverage React `useTransition` for actions involving server communication or significant computation. Target low INP.
*   **REQ-NFR-EXPL-PERF-03 (Aggregation Speed):** Backend queries for data aggregation must execute quickly, even with large datasets. This mandates efficient **Drizzle** queries and effective **Supabase** indexing.
*   **REQ-NFR-EXPL-PERF-04 (Real-time Latency):** Real-time updates on visualizations should have minimal perceived delay (target < 1-2 seconds from submission to visual update). Requires efficient backend triggers and real-time infrastructure (**Supabase Realtime** / **Redis Pub/Sub**).
*   **REQ-NFR-EXPL-PERF-05 (AI Speed):** AI summary generation should complete within a reasonable timeframe (e.g., target < 5-10 seconds). AI Dashboard generation (P2) should start streaming UI components quickly (< 2-3 seconds for first component).
*   **REQ-NFR-EXPL-SCALE-01 (Scalability):** The Explore Hub backend (data fetching, aggregation, AI calls) must scale to handle a large number of concurrent viewers and requests.
*   **REQ-NFR-EXPL-REL-01 (Reliability):** Data visualizations must accurately reflect the underlying aggregated data. Real-time updates should be reliable. AI generation features should handle potential LLM errors gracefully.
*   **REQ-NFR-EXPL-SEC-01 (Security):** Access to detailed views might require authentication depending on data sensitivity. All backend endpoints/actions must enforce necessary authorization.
*   **REQ-NFR-EXPL-PRIV-01 (Privacy):** Ensure only properly anonymized, aggregated data is displayed. Personal contextualization (if implemented) must not compromise user privacy.
*   **REQ-NFR-EXPL-USE-01 (Usability):** The interface must be intuitive for browsing, filtering, and interpreting data visualizations and AI summaries.
*   **REQ-NFR-EXPL-ACC-01 (Accessibility):** All components, including data visualizations and AI-generated content display areas, must adhere to WCAG 2.1 AA standards.
*   **REQ-NFR-EXPL-MAINT-01 (Maintainability):** Code should be well-structured, utilize TypeScript, follow project conventions, and leverage reusable components. Server Actions for AI features should reside in `app/actions/explore/`.
*   **REQ-NFR-EXPL-TEST-01 (Testability):** Backend aggregation logic, Server Actions, and frontend components (including visualizations) should be testable (unit, integration, E2E). Mock AI SDK responses for reliable testing.
```