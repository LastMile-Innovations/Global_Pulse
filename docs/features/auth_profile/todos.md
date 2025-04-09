# TODO List: Authentication & Profile Management Implementation

**Objective:** Implement secure user registration, login, session management, and profile settings (including marketplace consent) using Supabase Auth, `@supabase/ssr`, Drizzle ORM, Next.js 15, React 19, and Upstash Redis.

**Note:** This list breaks down the feature into sub-components and tasks. Phasing (P1 Core) assumes this is foundational. Assumes basic Next.js project setup, Drizzle initialization (`lib/db/`), Supabase client helpers (`lib/supabase/`), and Redis setup (`lib/redis/`).

---

### 1. Supabase & Environment Setup (P1)

*   [ ] **Configure Supabase Auth:**
    *   [ ] Enable Email/Password provider in Supabase Dashboard -> Authentication -> Providers.
    *   [ ] Configure password complexity requirements.
    *   [ ] **Enable/Configure Email Confirmations** (Recommended) in Supabase Dashboard -> Authentication -> Settings -> Email Templates/Settings. Set site URL correctly.
    *   [ ] Configure redirect URLs (e.g., `SITE_URL`) in Supabase Dashboard -> Authentication -> URL Configuration.
*   [ ] **Environment Variables (`.env.local`):**
    *   [ ] Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
    *   [ ] Ensure `DATABASE_URL` (pooled, for Drizzle app, e.g., port 6543) ` (direct, for Drizzle Kit, e.g., port 5432) are set correctly based on Supabase local/prod setup.
    *   [ ] Ensure Redis variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) are set.
    *   [ ] Ensure `APP_SECRET` or similar is set for general security.

### 2. Core Authentication Integration (`@supabase/ssr`) (P1)

*   [ ] **Install Package:** `pnpm add @supabase/ssr @supabase/supabase-js`
*   [ ] **Implement Middleware (`middleware.ts`):**
    *   [ ] Create `middleware.ts` in the project root.
    *   [ ] Import `updateSession` from `@supabase/ssr` and `createClient` from `lib/supabase/middleware.ts`.
    *   [ ] Implement the `middleware` function calling `updateSession(request, response)` using the middleware client.
    *   [ ] (Optional) Integrate Redis session check for performance optimization.
    *   [ ] (Optional) Integrate Redis rate limiting (`@upstash/ratelimit`) for relevant paths.
    *   [ ] Configure the `matcher` in `middleware.ts` to run on appropriate paths (usually most paths, excluding static assets and specific public routes).
*   [ ] **Create Supabase Client Helpers (`lib/supabase/`):**
    *   [ ] Verify `lib/supabase/client.ts` for the Browser Client (`createBrowserClient`).
    *   [ ] Verify `lib/supabase/server.ts` for the Server Client (`createServerClient` using cookie functions from `next/headers`).
    *   [ ] Verify `lib/supabase/middleware.ts` for the Middleware Client (`createMiddlewareClient`).
    *   [ ] Ensure these helpers correctly import necessary functions from `@supabase/ssr` and `next/headers`.

### 3. Database (`profiles` Table) (P1)

*   [ ] **Define Drizzle Schema (`lib/db/schema.ts`):**
    *   [ ] Add `pgTable` definition for `profiles`.
    *   [ ] Include `user_id` (uuid, primary key, references `auth.users(id)`).
    *   [ ] Add `full_name` (text, nullable).
    *   [ ] Add `avatar_url` (text, nullable).
    *   [ ] Add `marketplace_consent_structured_answers` (boolean, notNull, default false).
    *   [ ] Define `relations` if needed (linking back to `users` conceptually).
*   [ ] **Generate & Apply Migration:**
    *   [ ] Run `pnpm db:generate` to create the SQL migration.
    *   [ ] Review the generated SQL.
    *   [ ] Run `pnpm db:migrate` to apply the migration to Supabase.
*   [ ] **Implement Row Level Security (RLS) in Supabase SQL:**
    *   [ ] In Supabase SQL Editor, enable RLS on the `profiles` table (`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`).
    *   [ ] Create `SELECT` policy: `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);`
    *   [ ] Create `UPDATE` policy: `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`
    *   [ ] **Handle INSERT:** Determine strategy - either allow users to insert their own profile row if it doesn't exist (requires `INSERT` policy) or create the profile row via a trigger/function when a user signs up in `auth.users`. (Trigger is often cleaner).
        *   [ ] *If using Trigger:* Create a Supabase Function (e.g., `handle_new_user`) that inserts into `profiles` and a trigger on `auth.users` that calls this function `AFTER INSERT`.

### 4. Authentication UI Components (`components/auth/`, `app/(auth)/`) (P1)

*   [ ] **Create Auth Layout:** Set up layout `app/(auth)/layout.tsx` for auth pages if needed (e.g., centered content).
*   [ ] **Signup Form (`components/auth/SignupForm.tsx`, `app/(auth)/signup/page.tsx`):**
    *   [ ] Create **React 19** Client Component form (`'use client'`).
    *   [ ] Use `shadcn/ui` Form components (`useForm` from `react-hook-form`, `<FormField>`, `<Input type="email">`, `<Input type="password">`).
    *   [ ] Implement client-side validation using Zod/Valibot schema (`components/auth/signup-schema.ts`).
    *   [ ] Import and use the Supabase Browser Client from `lib/supabase/client.ts`.
    *   [ ] Implement `onSubmit` handler calling `supabase.auth.signUp()`. Consider using **React 19** `useActionState` if wrapping in a client-side action.
    *   [ ] Handle loading state (`isSubmitting`) and display errors returned from `signUp`.
    *   [ ] Display success message (e.g., "Check your email for confirmation").
*   [ ] **Login Form (`components/auth/LoginForm.tsx`, `app/(auth)/login/page.tsx`):**
    *   [ ] Create Client Component form (`'use client'`).
    *   [ ] Use `shadcn/ui` Form components.
    *   [ ] Implement client-side validation using Zod/Valibot schema (`components/auth/login-schema.ts`).
    *   [ ] Import and use the Supabase Browser Client.
    *   [ ] Implement `onSubmit` handler calling `supabase.auth.signInWithPassword()`.
    *   [ ] Use `useRouter` from `next/navigation` for redirection on success (e.g., `router.push('/dashboard')`).
    *   [ ] Handle loading state and display generic "Invalid login credentials" error.
    *   [ ] Include a `<Link>` to `/forgot-password`.
*   [ ] **Forgot Password Form (`components/auth/ForgotPasswordForm.tsx`, `app/(auth)/forgot-password/page.tsx`):**
    *   [ ] Create Client Component form with email input.
    *   [ ] Implement client-side validation using Zod/Valibot schema (`components/auth/forgot-password-schema.ts`).
    *   [ ] Use Supabase Browser Client.
    *   [ ] Implement `onSubmit` calling `supabase.auth.resetPasswordForEmail()`, passing the correct `redirectTo` (e.g., `/update-password`).
    *   [ ] Handle loading state and display confirmation/error message.
*   [ ] **Update Password Form (`components/auth/UpdatePasswordForm.tsx`, `app/(auth)/update-password/page.tsx`):**
    *   [ ] Create Client Component form with new password and confirmation fields.
    *   [ ] Implement client-side validation using **Zod/Valibot** schema (`components/auth/update-password-schema.ts`).
    *   [ ] Verify token handling (`@supabase/ssr` usually handles this automatically if user clicks the link).
    *   [ ] Use Supabase Browser Client.
    *   [ ] Implement `onSubmit` calling `supabase.auth.updateUser({ password: newPassword })`.
    *   [ ] Handle loading state, password mismatch validation, and success/error feedback. Redirect to login on success.
*   [ ] **Logout Button (`components/auth/LogoutButton.tsx`):**
    *   [ ] Create Client Component button.
    *   [ ] Use Supabase Browser Client.
    *   [ ] Implement `onClick` handler calling `supabase.auth.signOut()`.
    *   [ ] Use `useRouter` for redirection on success (e.g., `router.push('/')`).
    *   [ ] Handle potential errors during sign out.
    *   [ ] Integrate this button into the main application layout/header.

### 5. Profile Settings UI (e.g., `/account/settings`) (P1)

*   [ ] **Create Settings Page (`app/account/settings/page.tsx`):**
    *   [ ] Create the page, likely using **RSC** for initial data fetch.
    *   [ ] Use Supabase Server Client (`lib/supabase/server.ts`) to `getUser()`.
    *   [ ] Use **Drizzle** client (`lib/db/index.ts`) to fetch the user's `profiles` data within the RSC.
    *   [ ] Pass fetched data (user email, current consent status) down to Client Components.
    *   [ ] Implement layout using `shadcn/ui`.
*   [ ] **Consent Toggle Component (e.g., `components/profile/ConsentToggle.tsx` - *implied path*):**
    *   [ ] Create Client Component (`'use client'`).
    *   [ ] Receive `initialConsentStatus: boolean` as prop.
    *   [ ] Use `useState` for the toggle state.
    *   [ ] Use **React `useTransition`** hook to manage pending state during updates.
    *   [ ] Render a `shadcn/ui Switch` or checkbox bound to the state.
    *   [ ] Render explanatory text.
    *   [ ] Implement `onCheckedChange` handler:
        *   Call `startTransition()` from `useTransition`.
        *   Inside transition, call the `updateConsent` Server Action (see Step 6).
        *   Handle success/error response from the action (e.g., show toast notification using `sonner`, revert state on error).
*   [ ] **(Optional) Profile Update Components:** If allowing name/avatar updates:
    *   [ ] Create forms similar to auth forms (Client Components).
    *   [ ] Trigger specific **Server Actions** (e.g., in `app/actions/profile.ts`) to update `profiles` table via **Drizzle**. Use `useTransition`. Validate input with Zod/Valibot.

### 6. Consent Update Server Action (`app/actions/profile.ts`) (P1)

*   [ ] **Create Server Action File:** `app/actions/profile.ts`.
*   [ ] **Define Action Function:** Create `async function updateConsent(newConsentStatus: boolean)` with `'use server'` directive within the file.
*   [ ] **Authentication:** Use Supabase Server Client (`lib/supabase/server.ts`) to `getUser()` inside the action. Throw/return error if no user.
*   [ ] **Input Validation:** Define a **Zod/Valibot** schema for the input (`z.boolean()`) and validate `newConsentStatus`. Return validation error if invalid.
*   [ ] **Rate Limiting (Optional):** Integrate `@upstash/ratelimit` using **Redis** client (`lib/redis/client.ts`).
*   [ ] **Drizzle Update:**
    *   [ ] Import Drizzle client (`db`) and schema (`schema`) from `lib/db`.
    *   [ ] Use `db.update(schema.profiles).set({ marketplaceConsentStructuredAnswers: newConsentStatus }).where(eq(schema.profiles.userId, user.id))`.
    *   [ ] Wrap in `try...catch` for database errors.
*   [ ] **Return Value:** Return `{ success: true }` or `{ success: false, error: '...' }`.

### 7. Route Protection & Access Control (P1)

*   [ ] **Protected Routes:** Ensure layouts or page components for protected routes (e.g., `/dashboard`, `/account/*`, `/survey`, `/chat`) check for an authenticated user using Supabase Server Client (`lib/supabase/server.ts`) and redirect to `/login` if no user session exists.
*   [ ] **Public Routes:** Ensure public routes (e.g., `/`, `/login`, `/signup`, marketing pages) are accessible without authentication.
*   [ ] **Middleware Paths:** Verify the `matcher` in `middleware.ts` correctly covers all necessary paths requiring session management.

### 8. Testing (Ongoing)

*   [ ] **Auth UI Tests (React Testing Library):** Test form rendering, input handling, basic client validation, and submission states.
*   [ ] **Server Action Tests:** Unit/Integration test `updateConsent` action (mock Drizzle, Supabase client). Test validation logic.
*   [ ] **E2E Tests (Playwright/Cypress):**
    *   [ ] Simulate full Signup flow (including email confirmation handling if enabled).
    *   [ ] Simulate Login -> Navigate -> Logout flow.
    *   [ ] Simulate Password Reset flow.
    *   [ ] Simulate navigating to settings and toggling consent, verifying feedback.
*   [ ] **RLS Testing:** Manually test RLS policies in Supabase SQL Editor using `SET ROLE` to ensure users cannot access/modify data they shouldn't.

### 9. Security & Performance Review (Ongoing)

*   [ ] **Verify HttpOnly Cookies:** Check browser DevTools to confirm Supabase session cookies are HttpOnly.
*   [ ] **Review RLS Policies:** Double-check RLS policies on `profiles` are correct and restrictive enough.
*   [ ] **Check Middleware Performance:** Ensure middleware execution time is minimal, especially if Redis checks are added.
*   [ ] **Review Server Action Security:** Ensure all Server Actions re-authenticate, authorize, and validate input correctly.
*   [ ] **Review Rate Limiting:** Ensure rate limits are applied appropriately to prevent abuse.