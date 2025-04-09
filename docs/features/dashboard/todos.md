# TODO List: User Dashboard (/dashboard) Implementation

**Objective:** Implement the User Dashboard feature, providing authenticated users with a personalized overview, activity summaries, and quick access points to core platform features, ensuring high performance and a smooth user experience.

**Note:** This list breaks down the feature into sub-components and tasks based on the overview and requirements documents. Phasing (P1 Core, Optional/P2) is noted. Assumes Authentication is implemented.

---

### 1. Backend - Data Fetching Logic (P1 Core, P2 Optional)

*   [ ] **Trending Topics Fetching Logic:**
    *   [ ] Create a server-side function (e.g., in `lib/data/topics.ts`) using Drizzle to fetch current trending topics (limit N, order by criteria).
    *   [ ] **Implement Caching:** Wrap the Drizzle query using **Upstash Redis** (e.g., `redis.get/setex("trending_topics", ...)`) or **Next.js `unstable_cache`** with a short time-based revalidation (e.g., 1-5 minutes) as this data is likely global.
*   [ ] **User Activity Summary Fetching Logic (Optional/P2):**
    *   [ ] Create a server-side function (e.g., in `lib/data/users.ts`) using Drizzle to calculate user-specific aggregates (e.g., `count` from `survey_responses` where `userId`).
    *   [ ] **Implement Caching:** Wrap the Drizzle query using **Upstash Redis** (keyed by `userId`, e.g., `HGETALL user_stats:<userId>`) or **Next.js `unstable_cache`** (keyed by `userId`, tagged appropriately for invalidation on survey submission/chat completion).
*   [ ] **Marketplace Earnings Fetching Logic (P1 Integration):**
    *   [ ] Create/Verify the API Route (`/api/user/earnings`) or Server Action responsible for fetching the user's current pending earnings total from the `marketplace_earnings` ledger.
    *   [ ] Ensure the backend query uses Drizzle and is optimized (indexed lookup on `anonymous_user_pseudonym`).
    *   [ ] Ensure endpoint requires authentication and fetches data only for the logged-in user.

### 2. Frontend - Page Structure & Layout (P1 Core)

*   [ ] **Create Dashboard Page:** Create the main page file `app/dashboard/page.tsx`.
*   [ ] **Authentication Guard:** Ensure the page (or a layout wrapping it) checks for user authentication using Supabase SSR helpers (`createClient`, `getUser`). Redirect unauthenticated users to login.
*   [ ] **Initial Structure (RSC Recommended):** Implement the page as a Next.js Server Component (RSC) to handle initial server-side data fetching (user data, trending topics).
*   [ ] **Basic Layout:** Define the overall structure using semantic HTML and Tailwind CSS/shadcn components (e.g., grid, flexbox) for organizing dashboard sections/cards.

### 3. Frontend - Dashboard Components (P1 Core, P2 Optional)

*   [ ] **Personalized Greeting Component (`components/dashboard/Greeting.tsx`):**
    *   [ ] Create a simple component to display "Welcome back, [User Name]!".
    *   [ ] Receive user name as a prop (fetched in the parent RSC).
*   [ ] **Trending Topics Component (`components/dashboard/TrendingTopics.tsx`):**
    *   [ ] Create a component to display the list/carousel of trending topics.
    *   [ ] Receive topic data (fetched in the parent RSC, potentially from cache) as props.
    *   [ ] Render each topic as a clickable `<Link>` component pointing to `/chat?topic=...` or `/survey?topic=...`.
    *   [ ] Implement basic styling for the list/cards.
*   [ ] **Participation Entry Points Component (`components/dashboard/EntryPoints.tsx`):**
    *   [ ] Create a component containing prominent buttons or cards.
    *   [ ] Use Next.js `<Link>` components to link directly to `/chat`, `/survey`, and `/explore`.
    *   [ ] Apply appropriate styling for clear calls-to-action.
*   [ ] **User Activity Summary Component (`components/dashboard/ActivitySummary.tsx` - Optional/P2):**
    *   [ ] Create a component to display user stats (e.g., questions answered).
    *   [ ] Receive aggregated data (fetched server-side, potentially cached) as props.
    *   [ ] Render the statistics clearly.
*   [ ] **Marketplace Earnings Snapshot Component (`components/dashboard/EarningsSnapshot.tsx`):**
    *   [ ] Create a **Client Component** (`'use client'`) for this potentially dynamic data.
    *   [ ] Implement state (`useState`) for earnings amount, loading, and error status.
    *   [ ] Implement data fetching logic (e.g., using `useEffect` to call the earnings API/Action, or integrate with SWR/React Query if used elsewhere).
    *   [ ] **Alternatively (PPR/Dynamic):** Implement as a component fetching data server-side wrapped in `<Suspense>`.
    *   [ ] Display loading state (e.g., skeleton text).
    *   [ ] Display fetched earnings amount.
    *   [ ] Display error message if fetching fails.
    *   [ ] Include a `<Link>` to the detailed `/account/earnings` page.
*   [ ] **Quick Links Component (`components/dashboard/QuickLinks.tsx`):**
    *   [ ] Create a component containing standard `<Link>` elements.
    *   [ ] Link to `/account/settings` and `/account/earnings`.

### 4. Frontend - Integration & State (P1 Core)

*   [ ] **Integrate Components:** Assemble the created components within the main `app/dashboard/page.tsx` RSC.
*   [ ] **Pass Server Data:** Pass data fetched server-side (user info, topics, activity summary) down as props to the relevant components.
*   [ ] **Handle Client-Side Fetching State:** Ensure the Earnings Snapshot component correctly handles its loading and error states.

### 5. Styling (P1 Core)

*   [ ] **Apply Tailwind CSS/shadcn:** Style all dashboard components according to the application's design system for a consistent look and feel.
*   [ ] **Responsiveness:** Ensure the dashboard layout adapts correctly to different screen sizes (mobile, tablet, desktop).

### 6. Performance & Optimization (Ongoing)

*   [ ] **Verify Caching:** Confirm that Redis or `unstable_cache` is working effectively for trending topics and user activity summaries. Check cache hit rates if possible.
*   [ ] **Analyze Load Performance:** Use browser DevTools (Network, Performance) and Vercel Analytics/Speed Insights to analyze dashboard load times (TTFB, LCP, TTI).
*   [ ] **Optimize Queries:** Ensure Drizzle queries used for dashboard data are indexed and efficient via `EXPLAIN ANALYZE`.
*   [ ] **Component Rendering:** Use React DevTools Profiler to check for unnecessary re-renders, especially in client components like the Earnings Snapshot. Rely on React Compiler where possible.
*   **Consider PPR:** Evaluate if the dashboard structure benefits significantly from Partial Prerendering (PPR) by wrapping dynamic/personalized sections (like Earnings) in `<Suspense>`.

### 7. Testing (Ongoing)

*   [ ] **Backend Data Fetching Tests:** Unit/Integration test the functions/API routes fetching topics, activity summaries, and earnings (mocking Drizzle/Redis).
*   [ ] **Frontend Component Tests (React Testing Library):**
    *   [ ] Test rendering of each dashboard component with mock data.
    *   [ ] Test loading and error states for the Earnings Snapshot.
    *   [ ] Test correct rendering of links and topic lists.
*   [ ] **Authentication Test:** Verify that unauthenticated users are redirected from `/dashboard`.
*   [ ] **E2E Tests (Playwright):**
    *   [ ] Simulate login and navigation to the dashboard.
    *   [ ] Verify core elements (greeting, topics, links) are present.
    *   [ ] Verify navigation links work correctly.
    *   [ ] Verify earnings data loads (may require mocking API response).