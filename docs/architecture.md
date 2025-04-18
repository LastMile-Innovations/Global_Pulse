
# 🏛️ Global Pulse Architecture Overview

**Version:** 1.0

## 1. Introduction

This document provides a high-level overview of the technical architecture for the Global Pulse platform. It describes the major components, their responsibilities, and how they interact to deliver the platform's core features, focusing on achieving real-time insights, nuanced understanding, and uncompromising performance.

This document complements the detailed technology guides (e.g., `nextjs_15.md`, `drizzle.md`) and the `best_practices.md` by illustrating the *system design* rather than the implementation specifics.

## 2. Core Architectural Principles

*   **Server-Centric:** Leverages Next.js Server Components and Server Actions to keep business logic, data fetching, and sensitive operations primarily on the server, minimizing client-side load and enhancing security.
*   **Performance-First:** Employs multiple strategies for speed: edge computing (Vercel), aggressive caching (Redis, Next.js Data Cache), optimized data fetching (Drizzle, indexing), streaming UI (React Suspense, AI SDK), and efficient client-side code (React Compiler).
*   **Scalability:** Built using managed, serverless-friendly services (Supabase, Upstash Redis, Vercel) designed to handle variable load efficiently.
*   **Type Safety:** End-to-end TypeScript usage, strongly enforced at the database layer by Drizzle ORM.
*   **Modularity & Maintainability:** Clear separation of concerns between frontend components, backend logic (Server Actions, API Routes), data layer (Drizzle), caching (Redis), and external services (Supabase, LLMs).

## 3. Component Breakdown

The Global Pulse platform integrates several key technologies:

1.  **Vercel (Hosting & Edge Platform):**
    *   **Role:** Hosts the Next.js application, manages builds, deployments, and provides the global CDN.
    *   **Key Functions:** Serves static assets (HTML, CSS, JS, images) from the Edge Network, runs Next.js Server Functions (for SSR, API Routes, Server Actions) and Edge Functions (for Middleware). Integrates with GitHub for CI/CD. Provides observability (Logs, Analytics).

2.  **Next.js 15 (Web Framework - The Orchestrator):**
    *   **Role:** The core framework unifying frontend and backend development.
    *   **Key Functions:**
        *   **App Router:** Handles routing and layout structures.
        *   **React Server Components (RSC):** Executes on the server, performs data fetching (via Drizzle), calls AI SDK Core functions, and renders static UI parts. Minimal client footprint.
        *   **Client Components (`'use client'`):** Handle interactivity, browser APIs, and React state/hooks (`useState`, `useEffect`, `useTransition`, AI SDK UI Hooks like `useChat`). Rendered initially on the server (SSR/PPR), hydrated on the client.
        *   **Server Actions:** Secure RPC endpoints callable from Client Components. Used for data mutations (via Drizzle), triggering AI generation (via AI SDK Core), and other backend logic (`app/actions/`).
        *   **API Routes (`app/api/`):** Standard backend endpoints for webhooks (e.g., payment confirmation), specific client-side fetching needs not suitable for Server Actions, or streaming endpoints (like the core chat stream).
        *   **Middleware (`middleware.ts`):** Runs on the Edge before requests hit caching or server functions. Used for authentication checks (`@supabase/ssr`), basic redirects/rewrites, and potentially edge rate limiting (via Redis).
        *   **Built-in Caching:** Manages Data Cache (for `fetch` and `unstable_cache`) and Full Route Cache (for static/ISR pages).

3.  **React 19 (UI Library):**
    *   **Role:** Builds the user interface within Next.js components.
    *   **Key Functions:** Provides component model, state management (Hooks: `useState`, `useReducer`, `useOptimistic`), transition handling (`useTransition`), Suspense for asynchronous loading, and Actions integration (`useActionState`, `useFormStatus`). The **React Compiler** automatically optimizes component re-renders.

4.  **Supabase (Backend-as-a-Service):**
    *   **Role:** Provides core backend infrastructure.
    *   **Key Functions:**
        *   **Postgres Database:** The primary persistent datastore for `users`, `profiles`, `questions`, `survey_responses`, `chats`, `marketplace_earnings`, etc. Leverages advanced Postgres features (JSONB, `pgvector`, RLS).
        *   **Authentication:** Manages user identity, sign-up, login, password reset, and secure session handling via JWTs. Integrated seamlessly using `@supabase/ssr`.
        *   **Realtime:** Listens for database changes (via Postgres Logical Replication) and broadcasts events over WebSockets to subscribed clients. Used for live updates in the Explore Hub.
        *   **Storage (Optional):** Could be used for storing user avatars or other static assets if needed.
        *   **Edge Functions (Optional):** Could host specific backend logic, but Next.js API Routes/Server Actions are the primary choice here.

5.  **Drizzle ORM (Database Interface):**
    *   **Role:** The type-safe SQL query builder and ORM providing the interface between the Next.js application (server-side) and the Supabase Postgres database.
    *   **Key Functions:** Defines the database schema in TypeScript (`lib/db/schema.ts`), generates and runs SQL migrations (`drizzle-kit`), provides a fluent API for building performant SQL queries (`db.select`, `db.insert`, `db.query`), ensures type safety for database interactions. Used exclusively in server environments (RSCs, Server Actions, API Routes).

6.  **Upstash Redis (In-Memory Data Store & More):**
    *   **Role:** Provides a high-speed, low-latency layer for caching, state management, and specialized tasks.
    *   **Key Functions:**
        *   **Caching:** Stores frequently accessed Drizzle query results (e.g., trending topics, aggregate stats), user sessions for fast middleware checks. Reduces load on Supabase DB.
        *   **Rate Limiting:** Powers `@upstash/ratelimit` for protecting APIs and Server Actions against abuse. Checked in Middleware or at the start of Actions/Routes.
        *   **Pub/Sub:** Can be used as an alternative or complement to Supabase Realtime for broadcasting events (e.g., "aggregates updated"). Requires a separate WebSocket layer for client communication.
        *   **(Advanced):** Distributed locks, queues, leaderboards (Sorted Sets).

7.  **Vercel AI SDK (AI Interface):**
    *   **Role:** Simplifies interaction with various Large Language Models (LLMs).
    *   **Key Functions:**
        *   **Core (`ai/core`):** Used server-side (Server Actions, API Routes). Provides functions like `streamText`, `generateText`, `generateObject`, `embed`, `tool` definition. Handles provider integration, streaming logic, tool calling orchestration.
        *   **UI (`ai/react`):** Provides React Hooks (`useChat`, `useCompletion`, `useObject`) for Client Components. Manages frontend state, streams data from backend endpoints, handles user input, and simplifies building interactive AI interfaces.

8.  **Large Language Models (LLMs - External):**
    *   **Role:** The AI "brains" providing conversational ability, text generation, summarization, analysis, and function/tool calling capabilities.
    *   **Key Functions:** Accessed *via* the Vercel AI SDK. Examples include OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini). Chosen based on task requirements (speed, cost, capability).

## 4. Key Interaction Flows

Here are simplified flows for key user actions, illustrating component interactions:

### Flow 1: User Sends Chat Message (Leading to GenUI)

1.  **User Input:** Types message in `ChatInput` (React Client Component). State managed by `useChat` hook. Clicks Send.
2.  **`useChat` Submission:** `handleSubmit` calls the backend API Route (`/api/chat/[id]/route.ts`) via `fetch`, sending message history.
3.  **Middleware:** Runs, checks auth using session cookies (potentially hitting **Redis** via `@supabase/ssr` helpers), checks rate limit (**Redis** via `@upstash/ratelimit`).
4.  **API Route (`/api/chat/...`):**
    *   Re-authenticates user using Server Client (`@supabase/ssr`).
    *   **(Intelligent Sourcing):** Optionally queries **Supabase DB** via **Drizzle** to find existing relevant questions, excluding answered ones.
    *   Calls **AI SDK Core `streamText`**, passing prompt, history, and GenUI tool definitions.
    *   **LLM:** Processes input, decides to respond with text and invoke a GenUI tool based on sourcing results/context.
    *   **AI SDK Core:** Orchestrates the LLM response/tool call.
    *   API Route returns a streaming response using `toDataStreamResponse()`. Calls `consumeStream()` for server completion.
5.  **Frontend (`useChat`):** Receives the stream, updates `messages` state with text tokens and `tool_invocation` part.
6.  **UI Render:** `ChatMessage` (Client Component) renders incoming text and the corresponding GenUI component (e.g., `<MultipleChoiceInput>`) based on the tool invocation.
7.  **User GenUI Interaction:** User clicks an option in `<MultipleChoiceInput>`.
8.  **Server Action Call:** GenUI component calls `submitSurveyResponse` **Server Action** (in `app/actions/survey.ts`).
9.  **Server Action (`submitSurveyResponse`):**
    *   Authenticates user. Validates input (Zod). Checks rate limit (**Redis**).
    *   Uses **Drizzle** to insert answer into `survey_responses` table in **Supabase DB**.
    *   Returns success/error.
10. **UI Feedback:** GenUI component updates visually (e.g., disabled state) based on action result.

### Flow 2: User Answers in Survey Feed

1.  **User Interaction:** Selects answer in `SurveyQuestionCard` (Client Component). Clicks "Submit & Next".
2.  **Server Action Call:** `onClick` handler (wrapped in `useTransition`) calls `submitSurveyResponse` **Server Action**.
3.  **Server Action (`submitSurveyResponse`):** (Same as steps 9a-e in Flow 1, but `source` is 'survey').
4.  **Frontend (Post-Action):** On success, triggers fetch for next question via `/api/survey/next-question` API Route.
5.  **API Route (`/api/survey/next-question`):**
    *   Authenticates user.
    *   Queries **Supabase DB** via **Drizzle** for the next unanswered question matching filters.
    *   Returns question data or completion signal.
6.  **UI Update:** Survey page (Client Component) updates state with the new question, rendering the next `SurveyQuestionCard`.

### Flow 3: Explore Hub Loads (with Real-time)

1.  **User Request:** Browser requests `/explore/[id]`.
2.  **Middleware:** Checks auth.
3.  **Next.js Page Render (RSC):**
    *   Fetches static question details via **Drizzle**.
    *   Fetches initial aggregate data via **Drizzle** (potentially hitting **Redis** cache).
    *   Renders page structure, passing aggregate data to Client Components.
4.  **Client Hydration:** Page hydrates. Chart Component (Client Component) renders initial aggregates.
5.  **Real-time Subscription:** Chart Component subscribes to relevant **Supabase Realtime** channel (e.g., `aggregates:question:<id>`).
6.  **(Later) New Answer Submitted:** `submitSurveyResponse` Action writes to `survey_responses`.
7.  **Real-time Trigger:** DB Trigger (or backend logic) sends message via **Supabase Realtime**.
8.  **Client Receives Event:** Chart Component receives event, triggers refetch of aggregates via API/Action.
9.  **UI Update:** Chart component re-renders with updated data.

## 5. Architecture Diagram Placeholder

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1D4ED8', 'lineColor': '#4B5563', 'textColor': '#1F2937'}}}%%
graph LR
    subgraph Browser/Client
        ReactUI[React 19 UI Components<br/>(Client Components, Hooks - useChat, useTransition)]
        NextLink[Next.js Link/Router]
        SupabaseClient[Supabase Browser Client<br/>(Auth Calls)]
    end

    subgraph Vercel Edge
        Middleware[Next.js Middleware<br/>(@supabase/ssr, Rate Limit Check)]
        CDN[Vercel CDN<br/>(Static Assets)]
    end

    subgraph Vercel Serverless/Node.js
        NextServer[Next.js Server<br/>(App Router, RSC, Server Actions, API Routes)]
        Drizzle[Drizzle ORM Client]
        AISDKCore[Vercel AI SDK Core<br/>(streamText, generate...)]
        SupabaseServerClient[Supabase Server Client<br/>(@supabase/ssr - getUser)]
        RedisClient[Upstash Redis Client]
    end

    subgraph External Services
        Supabase[Supabase]
        SupabaseDB[(Postgres DB<br/>RLS)]
        SupabaseAuth[Auth Service]
        SupabaseRT[Realtime Service]
        Redis[Upstash Redis<br/>(Cache, Rate Limit, Pub/Sub)]
        LLM[LLMs<br/>(OpenAI, Anthropic, ...)]
    end

    %% Interactions
    ReactUI -- Interaction --> NextLink
    ReactUI -- Auth Calls --> SupabaseClient
    ReactUI -- Server Action Calls --> NextServer
    ReactUI -- API Calls (e.g., Chat Stream) --> Middleware
    ReactUI -- Realtime Sub --> SupabaseRT

    NextLink -- Navigation Request --> Middleware

    Middleware -- Auth Check / Session --> SupabaseAuth
    Middleware -- Rate Limit Check --> RedisClient
    Middleware -- Forward Request --> NextServer
    Middleware -- Serve Static --> CDN

    NextServer -- DB Queries/Mutations --> Drizzle
    NextServer -- AI Calls --> AISDKCore
    NextServer -- Auth Context --> SupabaseServerClient
    NextServer -- Cache/Rate Limit/PubSub --> RedisClient

    Drizzle -- SQL --> SupabaseDB
    AISDKCore -- API Call --> LLM
    SupabaseServerClient -- Auth Verify --> SupabaseAuth

    SupabaseDB -- DB Changes --> SupabaseRT

    RedisClient -- Commands --> Redis

    %% Styling
    classDef client fill:#E0F2FE,stroke:#0EA5E9,color:#0C4A6E
    classDef edge fill:#F3F4F6,stroke:#9CA3AF,color:#374151
    classDef server fill:#DBEAFE,stroke:#3B82F6,color:#1E40AF
    classDef external fill:#E5E7EB,stroke:#6B7280,color:#4B5563
    class ReactUI,NextLink,SupabaseClient client
    class Middleware,CDN edge
    class NextServer,Drizzle,AISDKCore,SupabaseServerClient,RedisClient server
    class Supabase,SupabaseDB,SupabaseAuth,SupabaseRT,Redis,LLM external


## 6. Conclusion

The Global Pulse architecture leverages a modern, server-centric approach using Next.js, complemented by best-in-class managed services (Supabase, Redis) and specialized libraries (Drizzle, AI SDK). This design prioritizes performance through multiple layers of optimization (SSR/RSC, Edge execution, caching, streaming) while maintaining security and scalability. The clear separation of concerns allows for focused development and easier maintenance across the different technological domains.