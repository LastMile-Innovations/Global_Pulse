# Feature Overview: User Dashboard (/dashboard)

**Version:** 1.0
**Status:** Core Implementation (P1)

## 1. Core Purpose

To serve as the personalized landing page and central hub for authenticated users within the Global Pulse platform. The dashboard provides a quick overview of relevant information, summaries of user activity, and easy access points to core features like the Conversational Chat, Dedicated Survey Feed, Insight Exploration Hub, and account settings. It is designed for high performance using **Next.js 15**, **React 19**, **Drizzle ORM**, **Supabase**, and **Upstash Redis**.

## 2. User Experience

*   **Access:** Users are typically directed to `/dashboard` immediately after successful login, or can navigate to it via primary navigation when logged in.
*   **Layout:** Presents information in a clear, scannable layout, often using cards or distinct sections (`shadcn/ui` components) for different types of information (e.g., "Start Participating", "Your Activity", "Trending Topics").
*   **Personalization:** Displays information relevant to the logged-in user, such as their name, contribution summary, and potentially marketplace earnings.
*   **Action-Oriented:** Provides clear calls-to-action and entry points into the main participation modes (Chat, Survey Feed) and other key areas (Explore, Settings).
*   **Performance:** Designed for a fast load time, presenting key information quickly upon arrival using optimized data fetching (**Drizzle** + **Redis** caching), rendering strategies (**Next.js RSC**, **PPR**), and **React 19** features. Feels responsive during interactions.

## 3. Key Functional Components & Features

*   **Personalized Greeting:** Displays a simple welcome message addressing the user (e.g., "Welcome back, [User Name]!"), fetched server-side via Supabase Auth helpers within an RSC.
*   **Trending Topics / Prompts:**
    *   Displays a list or carousel of currently trending topics relevant for discussion or surveys.
    *   **Data Fetching:** Fetches trending topic data (potentially from a dedicated `topics` table or derived from recent activity) server-side via **Drizzle** ORM (`lib/db/index.ts`). Results likely cached using **Upstash Redis** (`lib/redis/client.ts`, e.g., `redis.get("trending_topics")`) or **Next.js `unstable_cache`** for performance, as this data is often global.
    *   **UI (`components/dashboard/TrendingTopics.tsx`):** Links directly to initiate a chat session (`/chat?topic=...`) or filter the survey feed (`/survey?topic=...`) for the selected topic.
*   **Participation Entry Points:**
    *   Prominent buttons/cards linking directly to:
        *   `/chat` (to start a new chat session).
        *   `/survey` (to jump into the survey feed).
        *   `/explore` (to view aggregated insights).
    *   **Implementation:** Implemented as standard **Next.js `<Link>`** components within the dashboard component structure (`components/dashboard/EntryPoints.tsx`).
*   **User Activity Summary (Optional/P2):**
    *   Displays simple statistics summarizing the user's participation (e.g., "You've answered X structured questions," "Y chat sessions completed").
    *   **Data Fetching:** Requires efficient backend queries (using **Drizzle** with `count()`) against `survey_responses` and `chats` tables, filtered by the authenticated `userId`. These aggregate counts are good candidates for **Upstash Redis** caching (keyed by `userId`) with appropriate invalidation triggered by **Server Actions** using Redis `DEL` or **Next.js** `revalidateTag`.
    *   **UI (`components/dashboard/ActivitySummary.tsx`):** Presented concisely within a dedicated card or section, rendered via RSC.
*   **Marketplace Earnings Snapshot (Links to Marketplace Feature - P1/P2):**
    *   Displays the user's current total available earnings from marketplace participation (if Marketplace feature is enabled/consented).
    *   **Data Fetching:** Calls a backend API endpoint (`/api/user/earnings`) or, more likely, a dedicated **Server Action** (e.g., `app/actions/user.ts#getEarnings`) to fetch the user's current earnings total. This backend logic queries the `marketplace_earnings` ledger using **Drizzle**. The result is specific to the user and likely fetched client-side (`components/dashboard/EarningsSnapshot.tsx` using `useEffect` or SWR) or via a **Server Action** triggered from a Client Component wrapper (using **React `useTransition`** or **React 19 `use`** hook with **Suspense** for PPR).
    *   **UI (`components/dashboard/EarningsSnapshot.tsx`):** Shows the earnings amount and provides a direct link to the detailed `/account/earnings` page. Displays loading/error states appropriately.
*   **Quick Links:**
    *   Provides direct links (`components/dashboard/QuickLinks.tsx`) to essential user areas like `/account/settings` (including consent management) and `/account/earnings`.

## 4. Technical Flow Summary (Dashboard Load - PPR Example)

1.  **User:** Navigates to `/dashboard`.
2.  **Next.js:** App Router routes to `app/dashboard/page.tsx`. **Middleware** (`middleware.ts`) ensures the user is authenticated using `@supabase/ssr` and checks session (potentially hitting **Upstash Redis** cache).
3.  **Server-Side Rendering (RSC / PPR Shell):**
    *   The main page component (`app/dashboard/page.tsx`), likely an **RSC** enabled for **PPR**, executes.
    *   Authenticates the user server-side using Supabase helpers (`createClient`, `getUser` from `lib/supabase/server.ts`).
    *   Fetches static/globally cached data for the shell:
        *   Trending Topics (queries **Drizzle**, likely hitting **Redis** cache).
    *   Renders the static shell (layout, greeting, entry points, quick links) and `<Suspense>` boundaries for dynamic parts. Sends this shell to the client immediately.
4.  **Server-Side Rendering (PPR Dynamic Segments):**
    *   Concurrently, the server fetches data for dynamic segments wrapped in `<Suspense>`:
        *   User Activity Summary (queries **Drizzle** or hits **Redis** cache).
        *   Marketplace Earnings (calls **Server Action** which queries **Drizzle**).
    *   As data becomes ready, the server streams the rendered content for these segments to the client.
5.  **Client-Side:**
    *   The browser receives and displays the static shell instantly (fast FCP/LCP).
    *   The browser receives streamed dynamic content and renders it within the `<Suspense>` boundaries as it arrives.
    *   **React 19** hydrates the components. Client Components (like the potentially client-fetched Earnings Snapshot if not using PPR/`use`) become interactive.

## 5. Relationship to Other Features

*   **Entry Point:** Acts as a primary launchpad into the **Conversational Chat Interface** and **Dedicated Survey Feed**.
*   **Information Hub:** Provides quick links and summary data related to the **Insight Exploration Hub** and the **Insights Marketplace** (earnings).
*   **Account Management:** Links directly to user **Account Settings** for profile and consent management.
*   **Authentication:** Requires successful **User Authentication** via Supabase Auth (`@supabase/ssr`) for access.
*   **Data Sources:** Fetches data aggregated or derived from `topics`, `survey_responses`, `chats`, and `marketplace_earnings` tables via **Drizzle**, potentially utilizing **Upstash Redis** caching.

## 6. Performance Considerations

*   **Server Components:** Leverage RSCs extensively for the initial page structure and server-side data fetching (Trending Topics, potentially Activity Summary) to optimize TTFB and minimize client JS.
*   **Efficient Data Fetching:** Use optimized **Drizzle** queries with specific field selection (`select({})`). Implement caching (**Upstash Redis** for global data like topics, potentially `unstable_cache` or Redis for user-specific aggregates) to reduce **Supabase** database load.
*   **Client Component Boundaries:** Keep Client Components small and focused (e.g., the earnings snapshot component might be separate) to optimize hydration and rendering. Leverage **React 19 Compiler**.
*   **Minimize Client-Side Fetching:** Prefer fetching data server-side (RSC or via **Server Actions** called during SSR/RSC render using **React 19 `use`** hook) where possible. Client-side fetching introduces potential waterfalls unless carefully managed.
*   **PPR Opportunity:** The dashboard is a good candidate for **Partial Prerendering (PPR)**. The main shell and less dynamic elements (like Trending Topics) can be static, while highly personalized sections (Activity Summary, Earnings) can be dynamic streams within **`<Suspense>`** boundaries.