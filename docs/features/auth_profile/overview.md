# Feature Overview: Authentication & Profile Management

**Version:** 1.0
**Status:** Core Implementation (P1)

## 1. Core Purpose

To provide secure user registration, login, and session management using **Supabase Auth**, establishing a unique identity for each participant within the Global Pulse platform. It also encompasses basic profile management (leveraging **Drizzle ORM** and **Supabase Postgres**), critically including the mechanism for users to view and control their consent settings for features like the Insights Marketplace via **Next.js Server Actions**. This feature is fundamental for personalization, data attribution (even anonymized), and securing user-specific areas and actions across the application built with **Next.js 15** and **React 19**.

## 2. User Experience

*   **Registration:** New users encounter a straightforward signup form (`/signup`, using `components/auth/SignupForm.tsx`) requesting minimal details (email, password). Upon submission, they may need to confirm their email address (if enabled).
*   **Login:** Returning users use a simple login form (`/login`, using `components/auth/LoginForm.tsx`) with email and password. Successful login establishes a secure session and typically redirects them to their personalized dashboard (`/dashboard`). Error messages guide users on failed attempts.
*   **Password Reset:** Users who forget their password can initiate a reset process via a "Forgot Password" link, receiving instructions via email to set a new password securely on the `/update-password` page (using `components/auth/UpdatePasswordForm.tsx`).
*   **Logout:** Logged-in users can securely end their session via a clearly accessible logout button (`components/auth/LogoutButton.tsx`), typically in the user menu or header, redirecting them to a public page.
*   **Session Management:** Sessions are maintained securely across browser tabs and navigation using **HttpOnly cookies**, managed automatically by the framework integration (**`@supabase/ssr`**) and **Next.js Middleware**. Users generally remain logged in until explicit logout or session expiry.
*   **Profile Settings Access:** Logged-in users can access their account settings page (e.g., `/account/settings` or similar).
*   **Consent Management:** Within the settings page, users find a clear, understandable section dedicated to the Insights Marketplace, allowing them to easily toggle their opt-in consent for sharing anonymized structured data. Changes are saved via a dedicated **Server Action**, feeling instant due to **React `useTransition`**.

## 3. Key Functional Components & Features

*   **Core Authentication Service (Supabase Auth):**
    *   Leverages Supabase's built-in authentication service for user registration (email/password), secure login, password hashing, email confirmations, and password resets. Handles the underlying JWT generation and validation.
*   **Next.js Integration (`@supabase/ssr`):**
    *   **CRITICAL:** Utilizes the `@supabase/ssr` package designed specifically for Next.js App Router.
    *   **Middleware (`middleware.ts`):** Implements the `updateSession` function from `@supabase/ssr`. This middleware runs on requests, securely refreshing the user's session token using cookies and ensuring authentication state is available server-side (for RSCs, Server Actions, API Routes) *before* rendering or execution. It manages secure, HttpOnly cookies. May use **Upstash Redis** for enhanced session validation performance.
    *   **Server Client:** Provides helpers (`createServerClient` in `lib/supabase/server.ts`) to create Supabase clients within RSCs, Server Actions, and API Routes that correctly read authentication state from cookies managed by the middleware.
    *   **Browser Client:** Provides helpers (`createBrowserClient` in `lib/supabase/client.ts`) for client-side interactions with Supabase Auth (e.g., triggering login/signup/logout from Client Components).
*   **UI Components (`components/auth/`, `app/(auth)/...pages`):**
    *   **Forms:** **React 19 Client Components** (`'use client'`) for Signup (`SignupForm.tsx`), Login (`LoginForm.tsx`), Forgot Password (`ForgotPasswordForm.tsx`), and Update Password (`UpdatePasswordForm.tsx`), built using `shadcn/ui` components and standard form handling (potentially `react-hook-form`). Forms utilize the Supabase Browser Client (`signInWithPassword`, `signUp`, `resetPasswordForEmail`, `updateUser`, etc.). Include corresponding Zod schemas (`login-schema.ts`, etc.) for validation.
    *   **State Management:** Use **React 19** hooks (`useState`, potentially `useActionState` for forms directly tied to Server Actions, though auth often uses client-side SDK calls) to manage form inputs, loading states, and error messages.
*   **Profile & Settings Page (e.g., `/account/settings/page.tsx`):**
    *   **Structure:** Likely a mix of **RSC** (to fetch initial profile data using **Drizzle**) and Client Components (for interactive elements like the consent toggle).
    *   **Data Fetching:** Fetches user data (email from `auth.users` via Supabase server client, consent status from `profiles` table via **Drizzle**) within the RSC.
    *   **Consent Toggle:** A Client Component (`'use client'`, e.g., `components/profile/ConsentToggle.tsx` - *implied path*) displaying the current consent status and allowing the user to toggle it using **`useTransition`**.
*   **Consent Update Logic (Server Action - `app/actions/profile.ts`):**
    *   A dedicated **Server Action** (e.g., `updateConsent` function in `app/actions/profile.ts`) handles saving the user's consent choice.
    *   **Security:** Re-authenticates the user server-side within the action using Supabase server helpers. Validates input (**Zod/Valibot**). Potentially rate-limited using **Upstash Redis**.
    *   **Database Interaction:** Uses **Drizzle** ORM client (`lib/db/index.ts`) to update the `marketplace_consent_structured_answers` boolean field in the `profiles` table (`lib/db/schema.ts`) for the specific `userId`.
*   **Database (`profiles` Table):**
    *   A separate `profiles` table in Supabase Postgres, linked one-to-one with `auth.users` (via `user_id` FK).
    *   Managed using **Drizzle ORM** for schema definition (`lib/db/schema.ts`) and mutations (via **Server Actions**).
    *   Stores additional user information not handled by Supabase Auth, critically including `marketplace_consent_structured_answers`.
    *   Protected by **Row Level Security (RLS)** policies in **Supabase** ensuring users can only read/update their own profile.

## 4. Technical Flow Summary (Login Process Example)

1.  **User:** Enters email/password into the Login Form (`components/auth/LoginForm.tsx`, a Client Component) and clicks "Login".
2.  **Frontend:** Form's `onSubmit` handler prevents default submission. It calls `supabase.auth.signInWithPassword(...)` using the Supabase Browser Client (`lib/supabase/client.ts`). UI enters a loading state.
3.  **Supabase Auth Service:** Validates credentials. On success, generates session JWTs.
4.  **Frontend:** Receives success response from `signInWithPassword`. Handles potential errors (displaying messages). On success, typically initiates a redirect (e.g., `router.push('/dashboard')`) using `next/navigation`.
5.  **Next.js Request:** Browser requests `/dashboard`.
6.  **Next.js Middleware (`middleware.ts`):** Intercepts the request. The `updateSession` function from `@supabase/ssr` executes, using `createClient` from `lib/supabase/middleware.ts`. It inspects cookies, potentially validates/refreshes the token with Supabase Auth service (possibly checking **Redis** cache first), and sets secure, HttpOnly cookies containing the valid session information.
7.  **Next.js RSC Render (`/dashboard/page.tsx`):** The dashboard page (RSC) executes server-side. It can now use `createClient` from `lib/supabase/server.ts` and `getUser()` to securely access the user's session data (made available via the cookies set by the middleware). It may also use the **Drizzle** client (`lib/db`) to fetch profile data based on the `user.id`.
8.  **Page Load:** The dashboard renders with personalized data. The user has a valid, secure session managed by HttpOnly cookies.

## 5. Relationship to Other Features (Illustrative)

*   **Foundation:** Authentication is required for nearly all personalized features: **User Dashboard**, **Conversational Chat Interface** (tracking history/answers), **Dedicated Survey Feed** (tracking answers), **Insights Marketplace** (viewing earnings, consent), **Profile Settings**.
*   **Data Linkage:** The authenticated `userId` is the primary key linking user activity across `chats`, `survey_responses`, `profiles`, and (indirectly via pseudonym in `marketplace_earnings`).
*   **Consent Control:** The Profile Management aspect directly controls data eligibility for the **Insights Marketplace** feature via the `profiles.marketplace_consent_structured_answers` field updated by a **Server Action** using **Drizzle**.
*   **Security:** Underpins authorization checks performed in **Server Actions** and API Routes across all features. **Supabase RLS** policies rely heavily on `auth.uid()`.

## 6. Performance & Security Considerations

*   **Security (`@supabase/ssr`):** Using `@supabase/ssr` with Middleware is the recommended, most secure way for Next.js App Router. It ensures sessions are managed via HttpOnly cookies, mitigating XSS risks for token theft.
*   **Security (RLS):** RLS on the `profiles` table is crucial to prevent users from accessing or modifying other users' consent settings or profile data via direct database interaction or flawed **Drizzle** queries.
*   **Security (Server Actions):** Consent updates via **Server Actions** ensure the logic runs securely on the server, re-validating the user session before database writes (**Drizzle**). Input validation (**Zod/Valibot**) within actions is essential.
*   **Performance (Middleware):** The `updateSession` middleware is designed to be lightweight. It primarily deals with cookies and potentially quick token validation/refresh calls, avoiding heavy database queries. Utilizing **Upstash Redis** for session checks can further reduce latency.
*   **Performance (Profile Data):** Fetching basic profile data (like consent status) needed on multiple pages might benefit from request-scoped caching (**React 19 `cache`**) or potentially short-lived caching (**`unstable_cache`** or **Upstash Redis**) if appropriate, though direct fetching via RSC/Server Action using **Drizzle** is often sufficient and simpler.
*   **Rate Limiting:** Supabase Auth applies default rate limiting to auth endpoints. Consider additional custom rate limiting (e.g., using **Upstash Redis** via `@upstash/ratelimit` in Middleware or **Server Actions**) on profile update actions if abuse is a concern.