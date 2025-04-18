```markdown
# TODO List: Insight Exploration Hub (/explore) Implementation

**Objective:** Implement the Insight Exploration Hub feature, allowing users to discover, view, and interpret aggregated, anonymized public opinion data with high performance and usability.

**Note:** This list breaks down the feature into sub-components and tasks. Phasing (P1, P2) indicates suggested implementation order. Assumes prerequisites like Authentication and the core data tables (`questions`, `survey_responses`) are in place. Server Actions related to this feature will reside in `app/actions/explore/`.

---

### 1. Backend - Data Aggregation & Access (P1 Core)

*   [ ] **Optimize `survey_responses` Indexing:** Ensure efficient indexing exists on `(questionId)` and potentially `(questionId, createdAt)` or relevant filtering columns in the `survey_responses` table in Supabase.
*   [ ] **Define Aggregation Logic:**
    *   [ ] Create reusable server-side functions (e.g., in `lib/data/aggregates.ts`) using Drizzle to calculate aggregates (counts per option, percentages, averages for scales) for a given `questionId`.
    *   [ ] Ensure these functions handle different question types correctly.
    *   [ ] Implement logic to exclude/handle potential invalid or test data if necessary.
    *   [ ] **Strictly ensure queries only return aggregated data, no PII.**
*   [ ] **(Optional/P2 Performance) Summary Tables/Materialized Views:**
    *   [ ] Evaluate if pre-aggregated summary tables or materialized views are needed for high-traffic questions.
    *   [ ] If yes, define the schema for these tables/views.
    *   [ ] Implement DB triggers or scheduled jobs (`pg_cron`) to keep them updated.
    *   [ ] Update aggregation logic to query these views/tables first.
*   [ ] **Topic/Survey List API/Function:**
    *   [ ] Create logic (API Route or server function called by RSC) to fetch a list of topics/questions available for exploration (e.g., those with > N responses).
    *   [ ] Include necessary metadata (title, tags, potentially cached response count).
    *   [ ] Implement filtering/search logic server-side using Drizzle.
*   [ ] **Detailed Aggregate API/Function:**
    *   [ ] Create logic (API Route or server function) to fetch detailed aggregates for a *specific* `questionId`.
    *   [ ] Call the reusable aggregation functions defined above.
*   [ ] **Caching Strategy (Aggregates):**
    *   [ ] Evaluate caching needs for aggregate data.
    *   [ ] Implement caching using **Upstash Redis** (for frequently accessed, non-live data) or **Next.js `unstable_cache`** (with appropriate tagging for invalidation) within the API/server functions fetching aggregates.

### 2. Backend - Server Actions (`app/actions/explore/`) (P1/P2)

*   [ ] **`generateSummary` Server Action (P1):**
    *   [ ] Create `app/actions/explore/generateSummary.ts`.
    *   [ ] Define the action function accepting `questionId` (or similar identifier).
    *   [ ] Implement authentication/authorization checks.
    *   [ ] Call aggregation logic/API to get data for the question.
    *   [ ] Construct an appropriate prompt for the LLM.
    *   [ ] Use **Vercel AI SDK Core `generateText`** to call the LLM.
    *   [ ] Implement error handling for the AI call.
    *   [ ] Return the generated summary text or an error state.
*   [ ] **`generateDashboard` Server Action (P2):**
    *   [ ] Create `app/actions/explore/generateDashboard.ts`.
    *   [ ] Define the action function accepting `questionId`.
    *   [ ] Implement authentication/authorization checks.
    *   [ ] Fetch necessary aggregated data (potentially more detailed than for summary) via Drizzle.
    *   [ ] **Define Dashboard UI Tools:** Define AI SDK `tool()` definitions for dashboard components (e.g., `displayInsightCard`, `displayComparisonWidget`) with Zod parameter schemas. These tools will *not* have `execute` functions.
    *   [ ] Construct a prompt instructing the LLM to analyze data and use the defined tools.
    *   [ ] Use **Vercel AI SDK Core `streamText`**, passing the dashboard UI tools.
    *   [ ] Return the response using `result.toDataStreamResponse()`.
    *   [ ] Use `result.consumeStream()` for server completion.
    *   [ ] Implement robust error handling.

### 3. Frontend - UI Structure & Navigation (P1)

*   [ ] **Explore Page (`app/explore/page.tsx`):**
    *   [ ] Create the main page component. Utilize RSC for initial topic list rendering.
    *   [ ] Implement layout for discovery (list/grid).
    *   [ ] Integrate search input and filter components (likely Client Components).
    *   [ ] Handle routing to detailed views (`<Link href={`/explore/${item.id}`}>`).
*   [ ] **Detailed View Page (`app/explore/[id]/page.tsx`):**
    *   [ ] Create the dynamic route page component.
    *   [ ] Fetch basic question details (text) server-side (RSC).
    *   [ ] Structure the layout to include sections for visualization, AI summaries, etc.
*   [ ] **Search/Filter Components (`components/explore/filters.tsx`):**
    *   [ ] Create Client Components for search input, topic selectors, etc.
    *   [ ] Manage filter state locally (`useState`).
    *   [ ] Trigger data refetching/update logic on the overview page when filters change.

### 4. Frontend - Data Visualization (P1)

*   [ ] **Charting Library Integration:** Choose and install a performant charting library (e.g., Recharts, Nivo).
*   [ ] **Chart Wrapper Components:** Create reusable Client Components (`'use client'`) that wrap the chosen library's charts (e.g., `<AggregateBarChart>`, `<AggregatePieChart>`).
    *   [ ] These components accept processed aggregate data as props.
    *   [ ] Handle chart configuration and rendering.
    *   [ ] Implement loading states (potentially using skeletons).
*   [ ] **Conditional Chart Rendering:** Implement logic in the detailed view page to fetch aggregate data and render the appropriate chart wrapper component based on the `questionType`.
*   [ ] **Styling:** Ensure charts are styled consistently with the application theme (Tailwind CSS).

### 5. Frontend - Real-time Integration (P1 Test / P2 Full)

*   [ ] **Real-time Service Setup:** Configure Supabase Realtime (enable for relevant tables/views, set up publications) or set up WebSocket connection logic for Redis Pub/Sub. Define channel naming conventions (e.g., `aggregates:question:<id>`).
*   [ ] **Frontend Subscription Hook:** Create a custom React hook (`useRealtimeAggregates`) or integrate subscription logic directly into the chart-displaying Client Component.
    *   [ ] Use Supabase client (`createClient`) or WebSocket client to subscribe to the appropriate channel based on the viewed `questionId`.
    *   [ ] Handle incoming messages/events.
    *   [ ] Implement logic to trigger a refetch of the aggregate data when an update signal is received.
    *   [ ] Handle subscription cleanup (`useEffect` return function).
*   [ ] **Backend Publishing:** Ensure the backend (DB trigger or Server Action `onFinish`) publishes an update event to the correct channel after a relevant `survey_response` is successfully inserted.

### 6. Frontend - AI Feature Integration (P1/P2)

*   [ ] **AI Summary UI (P1):**
    *   [ ] Add "Generate Summary" button to the detailed view Client Component.
    *   [ ] Implement state (`useState`) to store the generated summary text or error.
    *   [ ] Implement the `onClick` handler:
        *   Wrap the call to the `generateSummary` Server Action in `useTransition`.
        *   Update UI based on `isPending` state (show loading spinner/text).
        *   Update state with the returned summary text or display an error message.
    *   [ ] Add a designated area to display the summary text.
*   [ ] **AI Dashboard UI (P2):**
    *   [ ] Add "Generate Dashboard" button.
    *   [ ] Create a dedicated Client Component or hook (`useGenerativeDashboard`?) to handle the streaming response from the `generateDashboard` Server Action. This will be similar to `useChat`.
    *   [ ] Implement state management for the streamed UI parts (text, tool invocations).
    *   [ ] Create React components corresponding to the backend dashboard UI tools (e.g., `<InsightCard>`, `<ComparisonWidget>`).
    *   [ ] Implement logic within the dashboard component/hook to dynamically render the correct UI components based on incoming tool invocations.
    *   [ ] Integrate loading states and potentially `<Suspense>` for a smooth build-up experience.

### 7. Frontend - Optional Features (P2/P3)

*   [ ] **Personal Comparison UI:**
    *   [ ] Modify backend aggregation endpoint/function to optionally return the current user's answer alongside aggregates (requires authentication).
    *   [ ] Update frontend components (e.g., chart wrappers) to accept the user's answer as an optional prop.
    *   [ ] Implement conditional rendering logic to highlight or indicate the user's response within the visualization.

### 8. Testing (Ongoing)

*   [ ] **Backend Aggregation Tests:** Unit test aggregation functions with various data inputs. Test performance with realistic data volumes.
*   [ ] **Server Action Tests:** Test `generateSummary` and `generateDashboard` actions, mocking Drizzle and AI SDK calls. Test validation and error handling.
*   [ ] **Frontend Component Tests (React Testing Library):** Test rendering of discovery components, chart wrappers (with mock data), AI summary display, and dashboard component rendering.
*   [ ] **Real-time Tests:** Test subscription logic and UI updates upon receiving mock real-time events.
*   [ ] **E2E Tests (Playwright):** Simulate user flow: navigating to explore, filtering, viewing details, triggering AI summary/dashboard, potentially verifying real-time updates.

### 9. Performance & Optimization (Ongoing)

*   [ ] **Database Indexing Review:** Continuously monitor query performance (`pg_stat_statements`, `EXPLAIN ANALYZE`) and optimize indexes for aggregation queries.
*   [ ] **Caching Verification:** Ensure Redis / `unstable_cache` strategies are effective and invalidation works correctly. Monitor cache hit rates.
*   [ ] **Frontend Performance:** Profile React components using DevTools to identify rendering bottlenecks, especially around charts and real-time updates. Optimize based on findings and React Compiler guidance.
*   [ ] **Bundle Size Analysis:** Monitor the impact of charting libraries and other dependencies on the client bundle size (`@next/bundle-analyzer`). Code-split large components.
*   **Lighthouse/Core Web Vitals:** Regularly test `/explore` pages against performance benchmarks.
```