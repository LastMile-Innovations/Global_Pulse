# Requirements Document: Authentication & Profile Management

**Version:** 1.0
**Status:** Requirements Defined (P1 Core)

## 1. Introduction

This document outlines the functional and non-functional requirements for the Global Pulse user authentication, session management, and basic profile management features. These are foundational capabilities enabling user participation, personalization, data attribution, and security across the platform. It includes the critical component of managing user consent for features like the Insights Marketplace. Requirements consider best practices for the target stack (**Next.js 15, React 19, Supabase Auth, `@supabase/ssr`, Drizzle ORM, Redis**).

## 2. Goals

*   Provide a secure and reliable method for users to register, log in, and manage their sessions.
*   Establish a unique identity for each user.
*   Enable personalized experiences and data attribution (even when anonymized).
*   Provide users with control over basic profile settings and data sharing consent.
*   Ensure robust security against common authentication vulnerabilities.
*   Offer a smooth and user-friendly experience for all authentication and profile-related tasks.

## 3. Functional Requirements (FR)

### 3.1 Registration

*   **REQ-AUTH-REG-01:** The system must provide a user registration interface (`/signup` page using `components/auth/SignupForm.tsx`).
*   **REQ-AUTH-REG-02:** Users must be able to register using a unique email address and a secure password. Input must be validated (`components/auth/signup-schema.ts`).
*   **REQ-AUTH-REG-03:** The system must enforce password complexity requirements (e.g., minimum length, character types - configured via Supabase Auth).
*   **REQ-AUTH-REG-04:** The system must provide clear feedback to the user on registration success or failure (e.g., email already exists, password too weak).
*   **REQ-AUTH-REG-05 (Optional but Recommended):** The system must support email confirmation, requiring users to verify their email address via a link before their account is fully active.

### 3.2 Login

*   **REQ-AUTH-LOGIN-01:** The system must provide a user login interface (`/login` page using `components/auth/LoginForm.tsx`).
*   **REQ-AUTH-LOGIN-02:** Users must be able to log in using their registered email address and password. Input must be validated (`components/auth/login-schema.ts`).
*   **REQ-AUTH-LOGIN-03:** The system must securely validate user credentials against stored authentication data (handled by Supabase Auth).
*   **REQ-AUTH-LOGIN-04:** Upon successful login, the system must establish a secure user session and redirect the user to their personalized dashboard (`/dashboard`).
*   **REQ-AUTH-LOGIN-05:** Upon failed login attempts, the system must provide a generic error message ("Invalid login credentials") without revealing whether the email or password was incorrect.
*   **REQ-AUTH-LOGIN-06:** The login interface must include a link to initiate the password reset process (`/forgot-password`).

### 3.3 Logout

*   **REQ-AUTH-LOGOUT-01:** Authenticated users must have a clearly accessible option (`components/auth/LogoutButton.tsx`) to log out.
*   **REQ-AUTH-LOGOUT-02:** Upon logout, the system must terminate the user's session securely, invalidating session tokens/cookies (via Supabase Auth `signOut`).
*   **REQ-AUTH-LOGOUT-03:** Upon successful logout, the user must be redirected to a designated public page (e.g., `/login` or homepage).

### 3.4 Session Management

*   **REQ-AUTH-SESS-01:** User sessions must be managed securely using HttpOnly cookies (handled via **`@supabase/ssr`** middleware).
*   **REQ-AUTH-SESS-02:** The system must automatically refresh user sessions based on configured lifetimes to maintain a logged-in state during active use (handled via **`@supabase/ssr`** middleware).
*   **REQ-AUTH-SESS-03:** The authentication state must be reliably available across server-side (**Next.js RSC, Server Actions, API Routes**) and client-side contexts within Next.js.

### 3.5 Password Reset

*   **REQ-AUTH-PWDR-01:** Users must be able to initiate a password reset process from the login page (via `/forgot-password` using `components/auth/ForgotPasswordForm.tsx`). Input must be validated (`components/auth/forgot-password-schema.ts`).
*   **REQ-AUTH-PWDR-02:** The system must accept the user's registered email address and trigger Supabase Auth to send a password reset email containing a secure, time-limited link.
*   **REQ-AUTH-PWDR-03:** Users clicking the reset link must be directed to a dedicated page (`/update-password`) to set a new password.
*   **REQ-AUTH-PWDR-04:** The system must allow the user to securely enter and confirm a new password on the update password page (using `components/auth/UpdatePasswordForm.tsx`), enforcing complexity rules. Input must be validated (`components/auth/update-password-schema.ts`).
*   **REQ-AUTH-PWDR-05:** Upon successful password update via the `UpdatePasswordForm`, the user must receive confirmation and be able to log in with the new password.

### 3.6 Profile Data Storage

*   **REQ-PROF-STORE-01:** The system must store application-specific user profile data separately from core authentication credentials, using a dedicated `profiles` table in Supabase Postgres defined via **Drizzle schema** (`lib/db/schema.ts`).
*   **REQ-PROF-STORE-02:** The `profiles` table must be linked one-to-one with the `auth.users` table via the user's ID (`user_id`).
*   **REQ-PROF-STORE-03:** The `profiles` table must include a field to store the user's consent status for marketplace data sharing (e.g., `marketplace_consent_structured_answers` as boolean, default false).
*   **REQ-PROF-STORE-04:** Row Level Security (RLS) must be enabled and configured on the `profiles` table to ensure users can only access and modify their own profile data.
*   **REQ-PROF-STORE-05:** Profile data interactions (reads in RSCs, updates via Server Actions) must use the **Drizzle** ORM client (`lib/db/index.ts`).

### 3.7 Profile Settings UI

*   **REQ-PROF-UI-01:** Authenticated users must have access to an account settings page (e.g., `/account/settings`).
*   **REQ-PROF-UI-02:** The settings page must display the user's registered email address (read-only, fetched server-side).
*   **REQ-PROF-UI-03 (Optional):** The settings page may allow users to update basic profile information stored in the `profiles` table (e.g., display name), triggering appropriate **Server Actions** using **Drizzle**.
*   **REQ-PROF-UI-04:** The settings page must clearly display the user's current consent status for Insights Marketplace participation (fetched server-side via **Drizzle**).
*   **REQ-PROF-UI-05:** The settings page must provide an intuitive control (e.g., `shadcn/ui` toggle switch) for the user to enable or disable their marketplace consent.
*   **REQ-PROF-UI-06:** The settings page must include clear explanatory text detailing the implications of providing or revoking marketplace consent.
*   **REQ-PROF-UI-07:** The system must provide clear feedback (e.g., toast notification, UI update using **React `useTransition`** or **`useActionState`**) upon successful saving of profile setting changes, including consent status.

### 3.8 Marketplace Consent Management Logic

*   **REQ-PROF-CONSENT-01:** A secure **Server Action** (e.g., `updateConsent` in `app/actions/profile.ts`) must exist to handle updates to the user's marketplace consent status.
*   **REQ-PROF-CONSENT-02:** The `updateConsent` Server Action must re-authenticate the user (Supabase helpers) and validate the incoming consent value (boolean, using **Zod/Valibot**).
*   **REQ-PROF-CONSENT-03:** The `updateConsent` Server Action must use **Drizzle** ORM client to update the correct field (`marketplace_consent_structured_answers`) in the user's specific row in the `profiles` table.
*   **REQ-PROF-CONSENT-04:** Changes to consent status must take effect immediately for any subsequent data eligibility checks (e.g., for dataset generation in the marketplace).

## 4. Non-Functional Requirements (NFR)

*   **REQ-NFR-AUTH-SEC-01 (Session Security):** User sessions must be protected against hijacking (e.g., XSS, CSRF). Use of HttpOnly cookies via **`@supabase/ssr`** is mandatory.
*   **REQ-NFR-AUTH-SEC-02 (Password Security):** Passwords must be securely hashed using industry-standard algorithms (handled by Supabase Auth). Password reset tokens must be secure and time-limited.
*   **REQ-NFR-AUTH-SEC-03 (Data Security):** Access to profile data, especially consent settings, must be strictly controlled via RLS policies in Supabase. Server Actions updating profile data must perform server-side authorization and input validation (**Zod/Valibot**).
*   **REQ-NFR-AUTH-SEC-04 (Rate Limiting):** Authentication endpoints (login, signup, password reset) should be protected by rate limiting (handled by Supabase Auth defaults, potentially augmented with custom limits via **Redis/@upstash/ratelimit** if needed). Profile update **Server Actions** should also be considered for rate limiting.
*   **REQ-NFR-AUTH-PERF-01 (Response Time):** Login, signup, and logout operations should complete quickly (target < 1s P95). Middleware session validation should add minimal overhead (< 20ms P95, using **Upstash Redis** for optimization). Profile settings page load (**RSC** + **Drizzle**) and consent updates (**Server Action** + **Drizzle**) should be performant, with UI updates feeling instant via **`useTransition`**.
*   **REQ-NFR-AUTH-REL-01 (Reliability):** Authentication services (Supabase Auth) must be highly available. Session management should be reliable across user interactions.
*   **REQ-NFR-AUTH-USE-01 (Usability):** Authentication forms and profile settings interfaces must be simple, clear, and easy to use. Error messages must be user-friendly. Loading/pending states must be clearly indicated (using **React 19** features).
*   **REQ-NFR-AUTH-ACC-01 (Accessibility):** All authentication and profile UI components must meet WCAG 2.1 AA standards.
*   **REQ-NFR-AUTH-MAINT-01 (Maintainability):** Authentication and profile logic should be well-structured, utilize TypeScript, and follow Next.js/React best practices. Use of `@supabase/ssr` patterns is required. **Drizzle** ORM must be used for `profiles` table interactions via **Server Actions**.
*   **REQ-NFR-AUTH-TEST-01 (Testability):** Authentication flows (signup, login, reset), profile updates, and consent logic should be testable (integration/E2E tests). **Server Actions** should have unit/integration tests (mocking Drizzle/Supabase client).