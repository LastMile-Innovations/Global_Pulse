
# 🚀 Getting Started with Global Pulse Development

Welcome to the Global Pulse development team! This guide will walk you through setting up your local development environment so you can start contributing.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js:** Version 18.17 or later recommended (check with `node -v`).
*   **pnpm:** The preferred package manager for this project (check with `pnpm -v`). Install via `npm install -g pnpm` if needed.
*   **Git:** For cloning the repository and version control (check with `git --version`).
*   **Docker:** Required for running Supabase locally (check with `docker --version`). Ensure Docker Desktop (or Docker Engine) is running.
*   **Supabase CLI:** For managing the local Supabase environment (check with `supabase --version`). Install/update via instructions [here](https://supabase.com/docs/guides/cli/getting-started).

## 2. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone <repository-url> global-pulse
cd global-pulse
```

Replace `<repository-url>` with the actual URL of your Git repository.

## 3. Install Dependencies

Install the project dependencies using pnpm:

```bash
pnpm install
```

This command reads the `pnpm-lock.yaml` file and installs the exact versions of all required packages.

## 4. Environment Variable Setup (`.env.local`)

The application requires several environment variables for connecting to services like Supabase, Redis, and potentially AI providers.

1.  **Copy the Example File:**
    ```bash
    cp .env.local.example .env.local
    ```
    **Important:** The `.env.local` file contains sensitive credentials and should **never** be committed to Git. It's already included in the project's `.gitignore` file.

2.  **Fill in the Variables:** Open the newly created `.env.local` file and fill in the values. You'll get most of the Supabase and Database URLs after starting the local Supabase instance (see next step).

    *   **Supabase Variables:**
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your local Supabase URL (e.g., `http://localhost:54321`). Provided after `supabase start`.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your local Supabase anonymous key. Provided after `supabase start`.
        *   `DATABASE_URL`: **Pooled connection string** for the application (using Supavisor/PgBouncer). For local Supabase, this usually points to port `6543`. Format: `postgresql://postgres:[YOUR-POSTGRES-PASSWORD]@localhost:6543/postgres?pgbouncer=true`. Provided after `supabase start`. *(See `docs/drizzle_orm_guide.md` for details)*.
        *   `MIGRATE_DATABASE_URL`: **Direct connection string** for Drizzle Kit migrations. For local Supabase, this usually points to port `5432`. Format: `postgresql://postgres:[YOUR-POSTGRES-PASSWORD]@localhost:5432/postgres`. Provided after `supabase start`. *(See `docs/drizzle_orm_guide.md` for details)*.
        *   `SUPABASE_SERVICE_ROLE_KEY` (Optional Server-Side): Your local Supabase service role key if needed for specific backend operations bypassing RLS. Provided after `supabase start`. Use with extreme caution.

    *   **Redis Variables (Upstash):**
        *   `UPSTASH_REDIS_REST_URL`: URL for your Upstash Redis database.
        *   `UPSTASH_REDIS_REST_TOKEN`: Token for your Upstash Redis database.
        *   **Recommendation:** Create a free database on [Upstash](https://upstash.com/) for development. It's quick and mimics the production setup closely. Alternatively, for advanced users, local Redis via Docker can be used, but ensure the connection details match what `@upstash/redis` SDK expects or use the Upstash Redis Proxy.

    *   **AI SDK Variables:**
        *   `OPENAI_API_KEY`: Your key from OpenAI.
        *   `ANTHROPIC_API_KEY`: Your key from Anthropic.
        *   *(Add other AI provider keys as needed)*
        *   These are obtained from the respective AI platform websites. They might be optional depending on which features you are working on.

    *   **Next.js / Security Variables:**
        *   `NEXTAUTH_SECRET` or `APP_SECRET`: A secret key used for securing application internals (e.g., potentially session encryption if not fully relying on Supabase JWTs, draft mode secrets). Generate a strong random string using `openssl rand -base64 32` in your terminal.
        *   *(Add any other custom environment variables needed)*

## 5. Supabase Local Development Setup

We use the Supabase CLI to run the Supabase stack (Postgres database, Auth, etc.) locally within Docker containers.

1.  **Login (One-time):** If you haven't already, log in to the Supabase CLI:
    ```bash
    supabase login
    ```
    Follow the instructions to authenticate with your Supabase account via the browser.

2.  **Start Supabase Services:** Navigate to your project root (`global-pulse`) and run:
    ```bash
    supabase start
    ```
    This command initializes and starts the local Supabase services using Docker. It will take a minute or two the first time.

    **Crucially, `supabase start` will output the following details needed for your `.env.local` file:**
    *   API URL (`NEXT_PUBLIC_SUPABASE_URL`)
    *   Anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    *   DB URL (Direct) -> Use this to construct `MIGRATE_DATABASE_URL` (port `5432`)
    *   DB URL (Pooled) -> Use this to construct `DATABASE_URL` (port `6543`)
    *   Studio URL (for accessing a local database GUI)
    *   Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
    *   JWT Secret

    **Copy these values into your `.env.local` file now if you haven't already.** Pay close attention to the correct ports for `DATABASE_URL` (6543, pooled) and `MIGRATE_DATABASE_URL` (5432, direct). Use the DB password shown or the default `postgres`.

3.  **Stopping Supabase Services:** When you're done developing, you can stop the services:
    ```bash
    supabase stop
    ```

## 6. Database Migrations

Once Supabase is running locally and your `.env.local` file has the correct `MIGRATE_DATABASE_URL`, you need to apply the database schema migrations defined by Drizzle Kit.

```bash
pnpm db:migrate
```

This command executes the SQL files located in the `db/migrations` folder against your local Supabase Postgres database, ensuring your local database schema matches the definitions in `lib/db/schema.ts`.

**Run this command:**
*   After initially starting Supabase (`supabase start`).
*   Any time you pull new changes (`git pull`) that include new migration files.
*   After you manually generate new migrations (using `pnpm db:generate`) based on your own schema changes.

## 7. Running the Application

Now you can start the Next.js development server:

```bash
pnpm dev
```

This will start the application, typically available at `http://localhost:3000`.

The server will automatically reload when you make changes to the code.

## 8. Verification

1.  Open your browser and navigate to `http://localhost:3000`.
2.  You should see the Global Pulse homepage or login screen.
3.  Try signing up for a new account or logging in.
4.  Navigate to different sections like `/dashboard`, `/survey`, `/explore`.
5.  Check your browser's developer console and the terminal running `pnpm dev` for any errors.
6.  (Optional) Access the local Supabase Studio URL provided by `supabase start` to inspect the database directly.
7.  (Optional) Use `pnpm db:studio` to launch the Drizzle Studio GUI to browse your local database schema and data.

## 9. Next Steps

You're all set up! Now you can start developing. Here are some helpful next steps:

*   Review the **Architecture Overview** (`docs/architecture.md` - ) to understand how the components fit together.
*   Consult the **Best Practices Guide** (`docs/best_practices.md`) for optimization techniques.
*   Explore the documentation for specific **Features** (`docs/features/`) you'll be working on.
*   Familiarize yourself with the **Testing Strategy** (`docs/testing_strategy.md` - **TODO**).
*   Check the **Contribution Guidelines** (`docs/contributing.md` - *) if applicable.

Happy coding!
