
# 🌍 Global Pulse - Documentation Hub

## Welcome!

Welcome to the central documentation repository for the Global Pulse project. This folder contains comprehensive information about the project's vision, architecture, features, technology stack, and best practices.

Whether you're a new developer onboarding, looking for specific feature details, or seeking guidance on performance optimization, this documentation aims to be your primary resource.

## Project Vision

> **Global Pulse** aims to be the definitive, instantaneous barometer of global human perspective. It's a dynamic platform architected for extreme performance (**Next.js 15, React 19, Drizzle, Supabase, Redis**), designed to capture, analyze, and visualize authentic public opinion on any topic—from breaking news to cultural shifts—in real-time. By seamlessly blending sophisticated AI-driven conversations (**Vercel AI SDK**) with streamlined direct polling, Global Pulse provides both nuanced qualitative understanding and broad quantitative data, making complex global sentiment accessible and explorable with an "instant feel" user experience.

## About This Documentation

This documentation serves as the **single source of truth** for understanding the technical aspects of the Global Pulse platform. It details:

*   **High-Level Architecture:** How the different services and technologies interact.
*   **Technology Stack:** Specific guides and best practices for Next.js, React, Drizzle, Supabase, Redis, and the AI SDK.
*   **Feature Implementation:** Detailed breakdowns of core features like Chat, Surveys, Exploration, Marketplace, etc., including their purpose, user experience, technical flow, requirements, and implementation tasks.
*   **Development Practices:** Guidelines for data modeling, security, performance, testing, and deployment.

## Navigating the Documentation

This documentation is organized into several key sections:

### 1. Core Concepts & Setup

*   **Vision & Overview:** (See `Project Vision` above) - Understand the goals and purpose of Global Pulse.
*   **Architecture:** (`./architecture.md`) - High-level overview of how the system components fit together.
*   **Getting Started:** (`./getting_started.md`) - Guide for setting up the development environment locally.
*   **Deployment:** (`./deployment.md` - **TODO**) - Instructions and considerations for deploying the application.

### 2. Technology Stack Guides & Best Practices

*   **🏆 Ultimate Performance Guide / Best Practices:** (`./best_practices.md`) - The overarching guide integrating best practices across the entire stack for achieving optimal performance. **Start here for optimization techniques.**
*   **Next.js 15:** (`./nextjs_15.md`) - Performance guide specifically focusing on Next.js 15 App Router features (RSC, Actions, Caching, PPR, etc.).
*   **React 19:** (`./react_19.md`) - Performance and best practices for React 19 (Compiler, Hooks, Actions, Concurrent Features).
*   **Drizzle ORM:**
    *   (`./drizzle.md`) - Core Drizzle performance and best practices guide.
    *   (`./drizzle_orm_guide.md`) - Integration guide explaining how Drizzle is used in this project, replacing Supabase JS for DB operations.
    *   (`./drizzle_migration_plan.md`) - The plan followed for migrating to Drizzle.
*   **Supabase (Postgres):** (`./Data_Modeling_Guide.md`) - Advanced guide covering schema design, indexing strategies, and handling complex data structures within Supabase Postgres, integrated with Drizzle.
*   **Upstash Redis:** (`./redis.md`) - Performance guide detailing caching strategies, rate limiting, real-time features, and optimization techniques for Upstash Redis.
*   **Vercel AI SDK:**
    *   (`./Vercel_AI_SDK.md`) - Comprehensive guide covering AI SDK Core (providers, text/object/tool generation, streaming) and UI Hooks (`useChat`, `useCompletion`, etc.).
    *   (`./ai_agent.md`) - Specific strategies for building performant AI *Agent* logic using the stack.
    *   (`./ai_tools.md`) - Specific strategies for defining and using AI *Tools* effectively within the stack.

### 3. Feature Documentation

Detailed documentation for each major user-facing feature:

*   **Authentication & Profile Management:** (`./features/auth_profile/`)
    *   [`overview.md`](./features/auth_profile/overview.md)
    *   [`features.md`](./features/auth_profile/features.md)
    *   [`requirements.md`](./features/auth_profile/requirements.md)
    *   [`userstories.md`](./features/auth_profile/userstories.md)
    *   [`todos.md`](./features/auth_profile/todos.md)
*   **Conversational Chat Interface:** (`./features/chat/`)
    *   [`overview.md`](./features/chat/overview.md)
    *   [`features.md`](./features/chat/features.md)
    *   [`requirements.md`](./features/chat/requirements.md)
    *   [`userstories.md`](./features/chat/userstories.md)
    *   [`todos.md`](./features/chat/todos.md)
*   **User Dashboard:** (`./features/dashboard/`)
    *   [`overview.md`](./features/dashboard/overview.md)
    *   [`features.md`](./features/dashboard/features.md)
    *   [`requirements.md`](./features/dashboard/requirements.md)
    *   [`userstories.md`](./features/dashboard/userstories.md)
    *   [`todos.md`](./features/dashboard/todos.md)
*   **Insight Exploration Hub:** (`./features/explore/`)
    *   [`overview.md`](./features/explore/overview.md)
    *   [`features.md`](./features/explore/features.md)
    *   [`requirements.md`](./features/explore/requirements.md)
    *   [`userstories.md`](./features/explore/userstories.md)
    *   [`todos.md`](./features/explore/todos.md)
*   **Insights Marketplace:** (`./features/marketplace/`)
    *   [`overview.md`](./features/marketplace/overview.md)
    *   [`features.md`](./features/marketplace/features.md)
    *   [`requirements.md`](./features/marketplace/requirements.md)
    *   [`userstories.md`](./features/marketplace/userstories.md)
    *   [`todos.md`](./features/marketplace/todos.md)
*   **Dedicated Survey Feed:** (`./features/survey/`)
    *   [`overview.md`](./features/survey/overview.md)
    *   [`features.md`](./features/survey/features.md)
    *   [`requirements.md`](./features/survey/requirements.md)
    *   [`userstories.md`](./features/survey/userstories.md)
    *   [`todos.md`](./features/survey/todos.md)

### 4. Cross-Cutting Concerns & Guides

*   **Security:** (`./security.md`) - Comprehensive guide covering security practices across the entire stack (Auth, RLS, Actions, Secrets, Rate Limiting, CSP, etc.).
*   **Data Modeling:** (`./Data_Modeling_Guide.md`) - Detailed guide on designing the database schema using Drizzle and advanced Postgres features on Supabase.
*   **Monitoring & Observability:** (`./monitoring_observability.md` - **TODO**) - Strategy for logging, metrics, tracing, and alerting across the application stack.
*   **Testing Strategy:** (`./testing_strategy.md` - **TODO**) - Approach to unit, integration, E2E, and performance testing.
*   **(Optional) UI Components & Styling:** (`./ui_components_styling.md` - **TODO**) - Conventions for using Tailwind CSS and `shadcn/ui`.
*   **Contributing:** (`./contributing.md`) - Guidelines for contributing to the project.

## How to Use These Docs

*   **New Developers:** Start with `Getting Started`, then review the `Architecture` overview, and finally the `Best Practices` guide. Explore feature overviews as needed.
*   **Feature Work:** Navigate to the specific feature folder (e.g., `./features/chat/`) and review its `overview.md`, `requirements.md`, and `features.md`. Refer to relevant technology guides (e.g., `Vercel_AI_SDK.md`, `react_19.md`, `drizzle.md`) for implementation details. Check the `todos.md` for outstanding tasks.
*   **Optimization/Performance:** Dive deep into the `best_practices.md` guide and the specific technology guides (`nextjs_15.md`, `redis.md`, `Data_Modeling_Guide.md`, etc.).
*   **Security Implementation:** Consult the `security.md` guide.
*   **Troubleshooting:** Refer to technology guides, `monitoring_observability.md`, and `testing_strategy.md`.

## Contributing

Contributions to improve this documentation are welcome! Please follow the guidelines outlined in `./contributing.md` or raise an issue/pull request.

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
    *   **Session Data (Optimization):** Potentially storing minimal session data for ultra-fast checks in Middleware.
*   **AI Integration:** Vercel AI SDK handles interactions with Large Language Models (LLMs like OpenAI/Anthropic):
    *   **Core SDK:** Used server-side in API Routes/Server Actions for `streamText`, `generateText`, `generateObject`, defining tools (GenUI, Research), and managing AI agent logic.
    *   **UI SDK:** Hooks like `useChat` are used in React Client Components to manage streaming responses, tool invocations, and user input for the chat interface.
*   **Server Actions:** Used extensively for mutations (survey submissions, consent updates, marketplace actions) and AI generation triggers, providing a secure RPC mechanism from Client Components to the server.
*   **Performance Focus:** Relies heavily on RSCs, efficient Drizzle queries with proper Supabase indexing, multi-layered caching (Next.js Data Cache, Redis), streaming UI (`Suspense`, `loading.js`, AI SDK streams), React 19 Compiler, and potentially Partial Prerendering (PPR).

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.17 or later recommended)
*   [pnpm](https://pnpm.io/installation)
*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/products/docker-desktop/) (Ensure Docker Desktop or Engine is running)
*   [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) (Ensure it's installed and updated)
*   [Supabase](https://supabase.com/) Account & Project (for production/preview, local handled by CLI)
*   [Upstash](https://upstash.com/) Account & Redis Database (Required for Caching, Rate Limiting etc.)
*   LLM API Key (e.g., [OpenAI](https://platform.openai.com/), [Anthropic](https://console.anthropic.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url> global-pulse
    cd global-pulse
    ```
    *(Replace `<repository-url>` with the actual repository URL)*
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Environment Variables

1.  **Copy the example environment file:**
    ```bash
    cp .env.local.example .env.local
    ```
    **Important:** `.env.local` contains secrets and is ignored by Git.
2.  **Fill in the required values** in `.env.local`. You will get local Supabase details from `supabase start`. For Upstash and AI keys, get them from their respective platforms. See `.env.local.example` for detailed descriptions.

    **Key Local Setup Variables:**
    *   `NEXT_PUBLIC_SUPABASE_URL`: Local Supabase URL (e.g., `http://localhost:54321`).
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Local Supabase anon key.
    *   `DATABASE_URL`: **Pooled** DB connection string (`postgresql://postgres:[PASSWORD]@localhost:6543/postgres?pgbouncer=true`). Use password from `supabase start`.
    *   `MIGRATE_DATABASE_URL`: **Direct** DB connection string (`postgresql://postgres:[PASSWORD]@localhost:5432/postgres`). Use password from `supabase start`.
    *   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: From your Upstash DB.
    *   `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: From AI providers.
    *   `APP_SECRET`: Generate a strong random secret (e.g., `openssl rand -base64 32`).

### Supabase Local Development Setup

1.  **(One time)** Login to Supabase CLI: `supabase login`
2.  Start Supabase services:
    ```bash
    supabase start
    ```
    This command uses Docker to run Supabase locally. It will output the necessary URLs and keys. **Copy these into your `.env.local file.**
3.  To stop services later: `supabase stop`

### Database Setup

1.  **Apply Drizzle Migrations:** Ensure Supabase is running (`supabase start`) and your `.env.local` has the correct `MIGRATE_DATABASE_URL`. Then run:
    ```bash
    pnpm db:migrate
    ```
    This applies the SQL migrations from `db/migrations/` to your local Supabase database. Run this after initial setup and whenever pulling new migrations.

### Running Locally

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
*   `DATABASE_URL`: **Pooled** database connection string (Supavisor/PgBouncer, port 6543, `?pgbouncer=true`). Used by the application via Drizzle.
*   `MIGRATE_DATABASE_URL`: **Direct** database connection string (port 5432). Used *only* for Drizzle Kit migrations/generation.
*   `UPSTASH_REDIS_REST_URL`: URL for your Upstash Redis database.
*   `UPSTASH_REDIS_REST_TOKEN`: Token for your Upstash Redis database.
*   `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: API keys for your chosen LLM providers.
*   `SITE_URL`: The public URL of your deployment (used for email links, etc.).
*   `APP_SECRET`: Application secret for misc security purposes.

## Database Migrations (Drizzle Kit)

This project uses Drizzle Kit to manage database schema changes.

1.  **Modify Schema:** Edit table definitions in `lib/db/schema.ts`.
2.  **Generate Migration:** Run `pnpm db:generate`. This compares your schema file to the database (**using `MIGRATE_DATABASE_URL`**) and generates a new SQL migration file in `db/migrations/`.
3.  **Review Migration:** Check the generated SQL file for correctness.
4.  **Apply Migration:** Run `pnpm db:migrate` to apply the migration to your database (**using `MIGRATE_DATABASE_URL`**).

**Note:** For development iterations where data loss is acceptable, `pnpm db:push` can directly sync schema changes, but **do not use `db:push` in production or collaborative environments.** Use `pnpm db:check` in CI to verify schema sync.

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

## Project Structure

```
pulse/
├── actions/                  # Next.js Server Actions (auth.ts, survey.ts, explore.ts, profile.ts)
├── app/                      # Next.js App Router: Routes, Pages, Layouts, API Routes
│   ├── (auth)/               # Authentication specific routes & layout
│   ├── (marketing)/          # Marketing/public pages & layout
│   ├── api/                  # API Route handlers (e.g., chat, topics, webhooks)
│   ├── auth/                 # Auth callback route
│   ├── chat/                 # Chat interface routes & components
│   │   └── [id]/             # Specific chat session route
│   │       ├── components/
│   │       │   ├── generative-ui/ # Embedded UI components (MultipleChoiceInput, etc.)
│   │       │   ├── chat-input.tsx
│   │       │   ├── chat-interface.tsx
│   │       │   └── chat-message.tsx
│   │       └── page.tsx
│   ├── dashboard/            # User dashboard route & layout
│   ├── explore/              # Insight exploration hub route
│   ├── survey/               # Dedicated survey feed route
│   ├── account/              # User account routes (settings, earnings) - Implied by needs
│   ├── error.tsx             # App error boundary
│   ├── fonts.ts              # Font configuration (next/font)
│   ├── global-error.tsx      # Root error boundary
│   ├── globals.css           # Global CSS styles (Tailwind base)
│   └── layout.tsx            # Root layout component
├── components/               # Shared & Feature-specific React components
│   ├── auth/                 # Auth form components, schemas (Zod), LogoutButton, etc.
│   ├── dashboard/            # Dashboard specific UI components (TrendingTopics, EarningsSnapshot)
│   ├── features/             # UI components for marketing features page
│   ├── layout/               # Header, Footer, Nav components, ThemeToggle
│   ├── marketing/            # Components used on marketing pages
│   ├── mock/                 # Mock UI components for demos/placeholders
│   ├── profile/              # Profile/Settings components (e.g., ConsentToggle) - Implied by needs
│   ├── survey/               # Survey feed components & question type inputs
│   ├── ui/                   # Base UI components (shadcn/ui primitives)
│   ├── client-wrappers.tsx   # Potential client-side wrapper components (e.g., Providers)
│   ├── database-error-fallback.tsx # Specific error fallback component
│   └── theme-provider.tsx    # Theme context provider
├── db/                       # Drizzle configuration and migrations
│   └── migrations/           # Generated SQL migration files (_journal.json, *.sql)
├── docs/                     # Project documentation (*.md)
│   └── features/             # Detailed feature documentation (auth_profile, chat, etc.)
├── hooks/                    # Custom React hooks (use-mobile, use-toast)
├── lib/                      # Core libraries, utilities, configurations
│   ├── db/                   # Drizzle ORM setup (schema.ts, index.ts, migrate.ts)
│   ├── redis/                # Redis client setup (client.ts, rate-limit.ts)
│   ├── supabase/             # Supabase client helpers (@supabase/ssr setup - client.ts, server.ts, middleware.ts)
│   ├── ai/                   # AI SDK setup, prompts, tools definitions - Implied by needs
│   ├── utils.ts              # General utility functions
│   └── types/                # Shared TypeScript types/interfaces - Implied by needs
├── public/                   # Static assets (images, icons, fonts)
├── styles/                   # (Potentially redundant if only globals.css is used)
├── components.json           # shadcn/ui configuration
├── drizzle.config.ts         # Drizzle Kit configuration
├── middleware.ts             # Next.js middleware (for Supabase session handling, potentially rate limiting)
├── next.config.mjs           # Next.js configuration (React Compiler, PPR, etc.)
├── package.json              # Project dependencies and scripts
├── plan.md                   # (Project planning document)
├── pnpm-lock.yaml            # Lockfile for pnpm
├── postcss.config.mjs        # PostCSS configuration (for Tailwind)
├── README.md                 # This file
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration


## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  Connect your Git repository to Vercel.
2.  Configure the Environment Variables in the Vercel project settings (ensure all required variables from `.env.local` are set, especially secrets like `SUPABASE_SERVICE_ROLE_KEY`, DB URLs, Redis tokens, AI keys).
3.  Set the Build Command (`pnpm build`) and Install Command (`pnpm install`).
4.  Ensure the correct Node.js version is selected (matching local development).
5.  Deploy!

**Important:** Database migrations (`pnpm db:migrate`) typically need to be run manually against your production database or integrated into your deployment pipeline *before* the application pointing to the new schema goes live. Vercel deployment hooks or manual execution via a secure connection using the `MIGRATE_DATABASE_URL` are common approaches. **Do not use `pnpm db:push` for production.**

