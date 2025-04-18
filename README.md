**Global Pulse is the definitive, instantaneous barometer of global human perspective.**

It's a dynamic platform architected for extreme performance, designed to capture, analyze, and visualize authentic public opinion on any topic in real-time. By seamlessly blending sophisticated AI-driven conversations with streamlined direct polling, Global Pulse provides both nuanced qualitative understanding ("the why") and broad quantitative data ("the what"), making complex global sentiment accessible and explorable with an "instant feel" user experience.

## The Problem

Understanding genuine, timely global opinion is fragmented, slow, and often lacks depth. Traditional surveys have significant lag, social media is an algorithmic echo chamber, and news offers curated snapshots. This leaves individuals and decision-makers operating with incomplete or outdated information in a world demanding immediate understanding.

## Our Solution: A High-Performance Dual-Mode Platform

Global Pulse tackles this with a unique, two-pronged approach built on a cutting-edge tech stack:

1.  **Conversational AI ("Pulse"):** Users engage in dynamic, natural language conversations with "Pulse," our meticulously designed neutral AI agent (powered by **Vercel AI SDK**). Pulse facilitates discussions, asks clarifying questions, and utilizes embedded **Generative UI** components (polls, sliders appearing directly within the chat) to capture structured data contextually. **Intelligent Question Sourcing** prioritizes reusing relevant questions from our central database (**Drizzle + Supabase**) before generating new ones on the fly.
2.  **Dedicated Survey Feed:** For users preferring rapid input, a separate, filterable feed (`/survey`) presents structured questions sequentially, enabling efficient, broad-scale quantitative data collection.

## Key Features

*   **Conversational Chat Interface:** Real-time, streaming AI chat with "Pulse" agent.
*   **Embedded Generative UI (GenUI):** Interactive polls, sliders, buttons seamlessly integrated within chat responses.
*   **Intelligent Question Sourcing:** AI agent reuses/generates relevant structured questions dynamically.
*   **Dedicated Survey Feed:** Streamlined, sequential interface for rapid structured question answering.
*   **Insight Exploration Hub (`/explore`):** Centralized dashboard for viewing aggregated, anonymized results with dynamic visualizations.
*   **Real-time Updates:** Live updates on the Explore Hub reflecting incoming data (via **Supabase Realtime** / **Redis Pub/Sub**).
*   **AI-Powered Summaries & Dashboards (P2):** On-demand LLM-generated text summaries and dynamic UI dashboards interpreting aggregated data in the Explore Hub.
*   **User Dashboard (`/dashboard`):** Personalized landing page showing trending topics, activity summary, and quick access to features.
*   **Insights Marketplace:** Ethical marketplace for Buyers to purchase anonymized datasets (min. answer counts per question, unique anonymous user identifiers for correlation). Participants/Sellers provide explicit consent and share in the value generated. (Core P1, Payments/Payouts P2/P3).
*   **Secure Authentication & Profile Management:** Robust user registration, login, session management (via **Supabase Auth** & **`@supabase/ssr`** with HttpOnly cookies), and profile settings including marketplace consent control.
*   **Central Questions Repository:** Unified database storing all structured question definitions, managed via **Drizzle ORM**.
*   **(Future - P3) Agent Research Tools:** AI agent capability to use external APIs (Web Search, News) for neutral context presentation.

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) 15.x (App Router, Server Components, Client Components, Server Actions, PPR, Edge Functions)
*   **UI Library:** [React](https://react.dev/) 19 (Hooks, Suspense, `useTransition`, `useOptimistic`, Compiler)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe SQL query builder)
*   **Auth & Backend Services:** [Supabase](https://supabase.com/) (Auth, Realtime, Storage)
*   **Caching / Rate Limiting / PubSub:** [Upstash Redis](https://upstash.com/) (`@upstash/redis`, `@upstash/ratelimit`)
*   **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) (Core, UI - `streamText`, `generateText`, `generateObject`, Tools, `useChat`)
*   **Schema Validation:** [Zod](https://zod.dev/) (Used with Drizzle, AI SDK Tools, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Package Manager:** [pnpm](https://pnpm.io/)

## Architecture Overview

Global Pulse leverages a server-centric architecture optimized for performance and scalability using the Next.js App Router:

*   **Frontend & Backend Framework:** Next.js serves both the React frontend (Client Components for interactivity, RSCs for static content/data fetching) and the backend logic (API Routes, Server Actions).
*   **Database Interaction:** Drizzle ORM provides a type-safe interface to the Supabase PostgreSQL database for all CRUD operations and complex queries, primarily executed server-side (RSCs, Server Actions, API Routes).
*   **Backend as a Service (BaaS):** Supabase provides core backend functionalities:
    *   **Authentication:** Secure user management via Supabase Auth, integrated tightly with Next.js using `@supabase/ssr` for cookie-based session handling via Middleware.
    *   **Database:** Managed PostgreSQL instance.
    *   **Realtime:** Used for pushing live updates to the Explore Hub.
    *   **Storage:** (Potential use for user avatars or downloaded marketplace datasets).
*   **Caching & Speed Layer:** Upstash Redis is used for:
    *   **Caching:** Reducing load on Supabase by caching frequent Drizzle query results (e.g., trending topics, aggregates).
    *   **Rate Limiting:** Protecting API endpoints and Server Actions from abuse.
    *   **Pub/Sub:** Alternative mechanism for triggering real-time updates.
    *   **Session Data (Optional):** Potentially storing minimal session data for ultra-fast checks in Middleware.
*   **AI Integration:** Vercel AI SDK handles interactions with Large Language Models (LLMs like OpenAI/Anthropic):
    *   **Core SDK:** Used server-side in API Routes/Server Actions for `streamText`, `generateText`, `generateObject`, defining tools (GenUI, Research), and managing AI agent logic.
    *   **UI SDK:** Hooks like `useChat` are used in React Client Components to manage streaming responses, tool invocations, and user input for the chat interface.
*   **Server Actions:** Used extensively for mutations (survey submissions, consent updates, marketplace actions) and AI generation triggers, providing a secure RPC mechanism from Client Components to the server.
*   **Performance Focus:** Relies heavily on RSCs, efficient Drizzle queries with proper Supabase indexing, multi-layered caching (Next.js Data Cache, Redis), streaming UI (`Suspense`, `loading.js`, AI SDK streams), React 19 Compiler, and potentially Partial Prerendering (PPR).

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v20.x or later recommended)
*   [pnpm](https://pnpm.io/installation)
*   [Supabase](https://supabase.com/) Account & Project
*   [Upstash](https://upstash.com/) Account & Redis Database
*   LLM API Key (e.g., [OpenAI](https://platform.openai.com/), [Anthropic](https://console.anthropic.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/global-pulse.git
    cd global-pulse
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Environment Variables

1.  **Copy the example environment file:**
    ```bash
    cp .env.local.example .env.local
    ```
2.  **Fill in the required values** in `.env.local`. See the comments in the example file for details on each variable. **Crucially, set up:**
    *   Supabase Project URL and Anon Key (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    *   Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY` - **Keep this secret!**)
    *   Database Connection Strings (Direct for migrations `MIGRATE_DATABASE_URL`, Pooled for application `DATABASE_URL`) - Obtain from Supabase Dashboard (Database -> Connection Pooling -> Use Supavisor tab for `DATABASE_URL` with Transaction mode).
    *   Upstash Redis REST URL and Token (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
    *   LLM API Keys (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)
    *   Other necessary configuration (e.g., `NEXTAUTH_SECRET` if using NextAuth alongside, JWT secrets if needed, site URL).

### Database Setup

1.  **Apply Drizzle Migrations:** Ensure your `.env.local` has the correct `MIGRATE_DATABASE_URL` (direct connection, port 5432).
    ```bash
    pnpm db:migrate
    ```
    This will apply all pending SQL migrations located in `db/migrations/` to your Supabase database.

2.  **Initialize All Databases (Recommended for Production):**
    To set up both PostgreSQL (Drizzle migrations) and Neo4j (UIG schema), run:
    ```bash
    pnpm exec tsx scripts/initialize-databases.ts
    ```
    This script will:
    - Run all Drizzle migrations (PostgreSQL)
    - Set up the Neo4j UIG schema (calls `scripts/setup-neo4j.ts` internally)

3.  **(Optional) Manual Neo4j Schema Setup:**
    If you only want to set up the Neo4j UIG schema, run:
    ```bash
    pnpm exec tsx scripts/setup-neo4j.ts
    ```



1.  **Start the development server:**
    ```bash
    pnpm dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables Reference

See `.env.local.example` for a full list and descriptions. Key variables include:

*   `NEXT_PUBLIC_SUPABASE_URL`: Public URL for your Supabase project.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for your Supabase project.
*   `SUPABASE_SERVICE_ROLE_KEY`: **SECRET** Service Role key for backend operations bypassing RLS (use with extreme caution).
*   `DATABASE_URL`: **Pooled** database connection string (Supavisor, port 6543, `?pgbouncer=true`). Used by the application.
*   `MIGRATE_DATABASE_URL`: **Direct** database connection string (port 5432). Used *only* for Drizzle Kit migrations/generation.
*   `UPSTASH_REDIS_REST_URL`: URL for your Upstash Redis database.
*   `UPSTASH_REDIS_REST_TOKEN`: Token for your Upstash Redis database.
*   `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: API keys for your chosen LLM providers.
*   `SITE_URL`: The public URL of your deployment (used for email links, etc.).

## Database Migrations (Drizzle Kit)

This project uses Drizzle Kit to manage database schema changes.

1.  **Modify Schema:** Edit table definitions in `lib/db/schema.ts`.
2.  **Generate Migration:** Run `pnpm db:generate`. This compares your schema file to the database (**using `MIGRATE_DATABASE_URL`**) and generates a new SQL migration file in `db/migrations/`.
3.  **Review Migration:** Check the generated SQL file for correctness.
4.  **Apply Migration:** Run `pnpm db:migrate` to apply the migration to your database (**using `MIGRATE_DATABASE_URL`**).

**Note:** For development iterations where data loss is acceptable, `pnpm db:push` can directly sync schema changes, but **do not use `db:push` in production or collaborative environments.**

## Available Scripts

*   `pnpm dev`: Starts the Next.js development server.
*   `pnpm build`: Creates a production build of the application.
*   `pnpm start`: Starts the production server (requires `pnpm build` first).
*   `pnpm lint`: Runs ESLint and Prettier checks.
*   `pnpm db:generate`: Generates SQL migration files based on schema changes.
*   `pnpm db:migrate`: Applies pending migrations to the database.
*   `pnpm db:push`: Pushes schema changes directly to the database (for prototyping).
*   `pnpm db:studio`: Launches Drizzle Studio GUI to browse/edit database data.
*   `pnpm db:check`: Checks if the database schema is in sync with the Drizzle schema definition.
*   `pnpm exec tsx scripts/initialize-databases.ts`: Runs all-in-one setup for PostgreSQL and Neo4j (recommended for production).
*   `pnpm exec tsx scripts/setup-neo4j.ts`: Sets up only the Neo4j UIG schema.
*   `pnpm exec tsx scripts/migrate-users-standalone.ts`: Backfills user records from Supabase Auth into local tables.

## Project Structure

```
pulse/
├── actions/                  # Server Actions (auth.ts, survey.ts, explore/, profile/)
├── app/                      # Next.js App Router: Routes, Pages, Layouts, API Routes
│   ├── (auth)/               # Authentication specific routes & layout
│   ├── (marketing)/          # Marketing/public pages & layout
│   ├── api/                  # API Route handlers (e.g., chat, topics)
│   ├── auth/                 # Auth callback route
│   ├── chat/                 # Chat interface routes & components
│   ├── dashboard/            # User dashboard route & layout
│   ├── explore/              # Insight exploration hub route
│   ├── survey/               # Dedicated survey feed route
│   ├── account/              # User account routes (settings, earnings) - Implied
│   ├── error.tsx             # App error boundary
│   ├── fonts.ts              # Font configuration (next/font)
│   ├── global-error.tsx      # Root error boundary
│   ├── globals.css           # Global CSS styles (Tailwind base)
│   └── layout.tsx            # Root layout component
├── components/               # Shared & Feature-specific React components
│   ├── auth/                 # Auth form components, schemas, etc.
│   ├── dashboard/            # Dashboard specific UI components
│   ├── features/             # UI components for marketing features page
│   ├── layout/               # Header, Footer, Nav components
│   ├── marketing/            # Components used on marketing pages
│   ├── mock/                 # Mock UI components for demos/placeholders
│   ├── profile/              # Profile/Settings components (e.g., ConsentToggle) - Implied
│   ├── survey/               # Survey feed components & question type inputs
│   ├── ui/                   # Base UI components (shadcn/ui)
│   ├── client-wrappers.tsx   # Potential client-side wrapper components
│   ├── database-error-fallback.tsx # Specific error fallback component
│   └── theme-provider.tsx    # Theme context provider
├── db/                       # Drizzle configuration and migrations
│   └── migrations/           # Generated SQL migration files
├── docs/                     # Project documentation
│   └── features/             # Detailed feature documentation (auth, chat, etc.)
├── hooks/                    # Custom React hooks (use-mobile, use-toast)
├── lib/                      # Core libraries, utilities, configurations
│   ├── db/                   # Drizzle ORM setup (schema.ts, index.ts, migrate.ts)
│   ├── redis/                # Redis client setup (client.ts, rate-limit.ts)
│   ├── supabase/             # Supabase client helpers (@supabase/ssr setup)
│   ├── ai/                   # AI SDK setup, prompts, etc. - Implied
│   ├── utils.ts              # General utility functions
│   └── types/                # Shared TypeScript types/interfaces - Implied
├── public/                   # Static assets (images, icons)
├── styles/                   # (Potentially redundant if only globals.css is used)
├── components.json           # shadcn/ui configuration
├── drizzle.config.ts         # Drizzle Kit configuration
├── middleware.ts             # Next.js middleware (for Supabase session handling)
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── plan.md                   # (Project planning document)
├── pnpm-lock.yaml            # Lockfile for pnpm
├── postcss.config.mjs        # PostCSS configuration (for Tailwind)
├── README.md                 # This file
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  Connect your Git repository to Vercel.
2.  Configure the Environment Variables in the Vercel project settings (ensure all required variables from `.env.local` are set, especially secrets).
3.  Set the Build Command (`pnpm build`) and Install Command (`pnpm install`).
4.  Ensure the correct Node.js version is selected.
5.  Deploy!

**Note:** Database migrations (`pnpm db:migrate`) typically need to be run manually against your production database or integrated into your deployment pipeline *before* the application pointing to the new schema goes live. Vercel deployment hooks or manual execution via a secure connection are common approaches.

## Contributing

<!-- Placeholder: Add contribution guidelines if applicable -->
Contributions are welcome! Please refer to `CONTRIBUTING.md` for details on how to contribute to this project.

## License

<!-- Placeholder: Choose and specify your license -->
