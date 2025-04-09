# Feature Breakdown: Authentication & Profile Management

**Version:** 1.0
**Status:** Core Implementation (P1)

This document provides a detailed breakdown of the features constituting the Global Pulse Authentication and Profile Management system, explaining their function and technical underpinnings based on the target stack (**Next.js 15, React 19, Drizzle ORM, Supabase Auth/DB, Redis, `@supabase/ssr`**).

---

### 1. User Registration

*   **Feature:** Allows new users to create an account on the Global Pulse platform.
*   **Purpose:** Onboard new participants and establish a unique identity.
*   **Function:**
    *   **UI (`/signup` page, `components/auth/SignupForm.tsx`):** A **React 19** Client Component (`'use client'`) presents a form requesting email and password (with confirmation). Built using `shadcn/ui` components and potentially `react-hook-form`. Validated using a Zod/Valibot schema (`components/auth/signup-schema.ts`).
    *   **Client-Side Logic:** Uses the Supabase Browser Client (`createBrowserClient` from `@supabase/ssr`, initialized in `lib/supabase/client.ts`) to call `supabase.auth.signUp({ email, password, options: { emailRedirectTo: ... } })`. Manages form state (**React 19 `useState`** or potentially `useActionState` if wrapped in an action) and displays loading/error feedback.
    *   **Supabase Auth Service:** Handles the actual user creation in the `auth.users` table, securely hashes the password, and (if enabled) sends a confirmation email to the provided address.
    *   **Email Confirmation (Optional but Recommended):** If enabled in Supabase Auth settings, the user must click a link in the confirmation email to activate their account before they can log in. The `emailRedirectTo` option specifies where the user lands after clicking the link.
*   **User Experience:** User fills a simple form, potentially verifies email, and gains access. Clear error messages are provided for issues like duplicate email or weak password.

### 2. User Login

*   **Feature:** Allows registered users to securely access their accounts.
*   **Purpose:** Authenticate users and establish a persistent session.
*   **Function:**
    *   **UI (`/login` page, `components/auth/LoginForm.tsx`):** A React Client Component (`'use client'`) presents fields for email and password. Includes a link to the password reset flow (`/forgot-password`). Validated using a Zod/Valibot schema (`components/auth/login-schema.ts`).
    *   **Client-Side Logic:** Uses the Supabase Browser Client (`lib/supabase/client.ts`) to call `supabase.auth.signInWithPassword({ email, password })`. Manages form state and displays loading/error feedback (e.g., "Invalid login credentials").
    *   **Supabase Auth Service:** Verifies the provided credentials against the stored hash. On success, generates session JWTs.
    *   **Redirection:** Upon successful login response from Supabase, the client-side logic typically uses Next.js navigation (`router.push('/dashboard')`) to redirect the user.
    *   **Session Cookie Handling:** Subsequent requests trigger the Next.js Middleware (see Feature 4).
*   **User Experience:** User enters credentials, gets redirected to their dashboard on success, or sees an error message on failure.

### 3. User Logout

*   **Feature:** Allows logged-in users to securely terminate their session.
*   **Purpose:** Provides user control over session termination and enhances security.
*   **Function:**
    *   **UI (`components/auth/LogoutButton.tsx`):** A React Client Component (`'use client'`) providing a "Logout" button or menu item, typically placed in the application header or user dropdown menu.
    *   **Client-Side Logic:** The `onClick` handler calls `supabase.auth.signOut()` using the Supabase Browser Client (`lib/supabase/client.ts`). Handles loading/error state.
    *   **Supabase Auth & Middleware:** `signOut()` invalidates the local session state and instructs the browser to clear relevant session cookies. The middleware will subsequently detect the lack of a valid session on future requests.
    *   **Redirection:** After `signOut()` completes successfully, client-side logic typically redirects the user to a public page like `/login` or the homepage (`router.push('/')`).
*   **User Experience:** User clicks logout, session ends, and they are redirected away from protected areas.

### 4. Secure Session Management (`@supabase/ssr` & Middleware)

*   **Feature:** Maintaining a secure and persistent user session across server-side rendering (RSC), client-side navigation, API Routes, and Server Actions.
*   **Purpose:** Ensures a seamless logged-in experience while protecting session integrity.
*   **Function:**
    *   **`@supabase/ssr` Package:** The core integration library.
    *   **Middleware (`middleware.ts`):** **CRITICAL Component.** Uses `updateSession(request)` from `@supabase/ssr` with the client created via `lib/supabase/middleware.ts`.
        *   Runs on incoming requests matching its configured paths.
        *   Inspects request cookies for Supabase session tokens.
        *   Securely communicates with Supabase Auth service if needed to validate or refresh tokens. (May leverage **Upstash Redis** for faster session validation potentially).
        *   Sets/updates **secure, HttpOnly cookies** containing the valid session information for subsequent server-side code to read. This is key to preventing client-side script access to tokens (mitigating XSS impact).
    *   **Server Client (`createServerClient`):** Used in RSCs, **Server Actions**, API Routes. Reads session information directly from the cookies managed by the middleware. Initialized via helper in `lib/supabase/server.ts`.
    *   **Browser Client (`createBrowserClient`):** Used in Client Components. Interacts with Supabase Auth client-side and coordinates session state with cookies. Initialized via helper in `lib/supabase/client.ts`.
*   **User Experience:** Seamless login persistence. Users stay logged in as they navigate without needing to re-authenticate constantly. Security is enhanced behind the scenes.
*   **Performance:** Middleware is designed to be lightweight, involving primarily cookie handling and occasional quick token validation/refresh calls. Using **Upstash Redis** can further optimize session checks within the middleware.

### 5. Password Reset Flow

*   **Feature:** Allows users who have forgotten their password to regain access to their account securely.
*   **Purpose:** Account recovery mechanism.
*   **Function:**
    *   **UI ("Forgot Password" Link):** Link on the login page navigates to a password reset request page (`/forgot-password`).
    *   **Request Form (`components/auth/ForgotPasswordForm.tsx`):** Client Component form asking for the user's registered email address. Validated using `components/auth/forgot-password-schema.ts`.
    *   **Client-Side Logic:** Uses Supabase Browser Client (`lib/supabase/client.ts`) `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/update-password' })` to trigger the reset email. Shows confirmation/error messages.
    *   **Supabase Auth Service:** Sends an email containing a secure, time-limited password reset link to the user.
    *   **Update Password Page (`/update-password` page):** Page the user lands on after clicking the email link. The token is typically handled automatically by `@supabase/ssr`.
    *   **New Password Form (`components/auth/UpdatePasswordForm.tsx`):** Client Component form asking for the new password (and confirmation). Validated using `components/auth/update-password-schema.ts`.
    *   **Client-Side Logic:** Uses Supabase Browser Client (`lib/supabase/client.ts`) `supabase.auth.updateUser({ password: newPassword })` to set the new password. Handles success (e.g., redirect to login) and errors.
*   **User Experience:** Standard, secure flow for password recovery involving email verification.

### 6. Profile Data Storage (`profiles` Table)

*   **Feature:** Storing user-related information beyond the basic authentication details managed by `auth.users`.
*   **Purpose:** To store application-specific user attributes, such as display name, preferences, and crucially, marketplace consent status.
*   **Function:**
    *   **Database Schema (`lib/db/schema.ts`):** Defines a `profiles` table using **Drizzle ORM**. Includes columns like `user_id` (UUID, Primary Key, Foreign Key referencing `auth.users.id`), `full_name` (optional Text), `avatar_url` (optional Text), and `marketplace_consent_structured_answers` (Boolean, NOT NULL, default `false`). Managed via `drizzle-kit` migrations.
    *   **RLS Policy:** **CRITICAL.** Row Level Security is enabled on the `profiles` table in **Supabase**. Policies ensure users can only `SELECT` and `UPDATE` their *own* profile row (`USING (auth.uid() = user_id)`). `INSERT` is often best handled by a trigger or function upon user signup in `auth.users` to simplify application logic.
    *   **Data Access:** Application logic (RSCs, **Server Actions**) uses the **Drizzle** ORM client (`lib/db/index.ts`) to query and mutate data in the `profiles` table, respecting RLS.
*   **User Experience:** User profile data is stored securely and powers personalized aspects of the application. Consent setting is persistent.

### 7. Profile Settings Page (e.g., `/account/settings`)

*   **Feature:** A dedicated page where users can view and manage their profile information and application settings.
*   **Purpose:** Provides user control over their account details and preferences, including consent.
*   **Function:**
    *   **UI Structure:** A Next.js page (`app/account/settings/page.tsx`), likely using **RSC** for fetching initial data and **React 19 Client Components** for interactive elements. Utilizes **React 19** features and **`shadcn/ui`**.
    *   **Data Display:** Displays user information fetched server-side (e.g., email from `auth.users` via Supabase Auth helpers, consent status from `profiles` using **Drizzle**).
    *   **Editable Fields (Optional):** May include forms (Client Components) for updating `full_name` or `avatar_url`, which would trigger specific **Server Actions** to update the `profiles` table via **Drizzle**.
    *   **Consent Toggle Component:** (See Feature 8 below).
*   **User Experience:** Centralized location for users to manage their account-related information and settings, with clear feedback using **React 19 `useTransition`**.

### 8. Marketplace Consent Management

*   **Feature:** The specific mechanism within the Profile Settings page for users to opt-in/opt-out of the Insights Marketplace.
*   **Purpose:** To obtain and manage explicit user consent for data contribution, crucial for ethical data sharing.
*   **Function:**
    *   **UI Component (`components/profile/ConsentToggle.tsx` - *implied path*):** A React Client Component (`'use client'`).
        *   Receives the user's current `marketplace_consent_structured_answers` status as a prop (fetched server-side in the parent RSC using **Drizzle**).
        *   Renders a toggle switch (`shadcn/ui Switch`), checkbox, or similar control.
        *   Displays clear explanatory text regarding the implications of consent.
        *   Manages the toggle's visual state (`useState`).
    *   **State Update Logic:** On toggle change, the component invokes a dedicated **Server Action** (e.g., `app/actions/profile.ts#updateConsent`), passing the new boolean consent value. Uses **React `useTransition`** hook to manage the pending state and provide immediate UI feedback.
    *   **Server Action (`updateConsent`):**
        *   Defined in a file like `app/actions/profile.ts` with `'use server'`.
        *   Re-authenticates the user server-side using Supabase server helpers (`lib/supabase/server.ts`).
        *   Receives the new consent status (validated using **Zod/Valibot**).
        *   Uses **Drizzle** ORM client (`lib/db/index.ts`) (`db.update(schema.profiles)...`) to update the `marketplace_consent_structured_answers` field in the `profiles` table (`lib/db/schema.ts`) for the authenticated `userId`.
        *   Potentially uses **Upstash Redis** (`lib/redis/client.ts`, `@upstash/ratelimit`) for rate limiting the action.
        *   Returns success/error status.
    *   **Feedback:** The `ConsentToggle` component updates its visual state based on the Server Action's response (using `useTransition`'s pending state or **React 19 `useActionState`**) and potentially shows a success/error toast notification (`sonner`).
*   **User Experience:** Simple, clear, and reversible control over marketplace participation consent, with immediate feedback on changes, feeling responsive due to **React `useTransition`**.