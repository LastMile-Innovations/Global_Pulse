# Requirements Document: User Dashboard (/dashboard)

**Version:** 1.0
**Status:** Requirements Defined (P1 Core)

## 1. Introduction

This document outlines the functional and non-functional requirements for the Global Pulse User Dashboard, accessible at the `/dashboard` route. This feature serves as the personalized homepage and primary navigation hub for authenticated users, providing summaries and quick access to core platform functionalities. Requirements incorporate best practices for performance using the target stack (Next.js 15, React 19, Drizzle, Supabase, Redis).

## 2. Goals

*   Provide a personalized and welcoming entry point for logged-in users.
*   Offer a clear overview of relevant platform activities and user status.
*   Facilitate easy navigation to core participation features (Chat, Survey Feed).
*   Drive user engagement by highlighting trending topics or suggested actions.
*   Ensure a fast, responsive, and informative user experience.

## 3. Functional Requirements (FR)

### 3.1 Access & Presentation

*   **REQ-DASH-PRES-01:** The dashboard must be accessible only to authenticated users via the `/dashboard` route. Unauthorized users attempting access should be redirected to login.
*   **REQ-DASH-PRES-02:** The dashboard must display a personalized greeting to the logged-in user.
*   **REQ-DASH-PRES-03:** The dashboard layout must be clear, concise, and present information in distinct sections or cards for easy scannability.

### 3.2 Content & Information Display

*   **REQ-DASH-CONTENT-01 (Trending Topics):** The dashboard must display a list of currently trending or relevant topics suitable for discussion or surveys. This data should be fetched efficiently (potentially cached).
*   **REQ-DASH-CONTENT-02 (Activity Summary - Optional/P2):** The dashboard may display a summary of the user's recent participation statistics (e.g., number of questions answered, chats completed). Data fetching for this must be performant (use aggregates, caching).
*   **REQ-DASH-CONTENT-03 (Marketplace Earnings):** The dashboard must display a snapshot of the user's current available marketplace earnings (requires fetching data via a dedicated API/Action). This section should link to the detailed earnings page.

### 3.3 Navigation & Actions

*   **REQ-DASH-ACTION-01 (Start Chat):** The dashboard must provide a clear call-to-action (e.g., button, link) to initiate a new conversational chat session (`/chat`).
*   **REQ-DASH-ACTION-02 (Start Survey):** The dashboard must provide a clear call-to-action to navigate to the dedicated survey feed (`/survey`).
*   **REQ-DASH-ACTION-03 (Explore):** The dashboard must provide a clear link to navigate to the Insight Exploration Hub (`/explore`).
*   **REQ-DASH-ACTION-04 (Settings):** The dashboard must provide a quick link to the user's account settings page (`/account/settings`).
*   **REQ-DASH-ACTION-05 (Earnings):** The dashboard must provide a quick link to the user's detailed marketplace earnings page (`/account/earnings`).
*   **REQ-DASH-ACTION-06 (Topic Links):** Displayed trending topics must function as direct links to start a chat or filter the survey feed related to that specific topic.

## 4. Non-Functional Requirements (NFR)

*   **REQ-NFR-DASH-PERF-01 (Load Speed):** The dashboard must load quickly upon user login or navigation. Optimize initial load using Next.js RSC, efficient data fetching, and potentially PPR. Target fast TTFB and LCP.
*   **REQ-NFR-DASH-PERF-02 (Data Freshness):** Trending topic data should be reasonably fresh. User-specific data (activity summary, earnings) should reflect the current state accurately upon load. Caching strategies must balance freshness and performance.
*   **REQ-NFR-DASH-PERF-03 (Responsiveness):** The dashboard interface must be responsive and interactive without noticeable lag.
*   **REQ-NFR-DASH-SCALE-01 (Scalability):** Backend queries supporting the dashboard (topics, user aggregates, earnings) must scale efficiently under load.
*   **REQ-NFR-DASH-REL-01 (Reliability):** Data displayed on the dashboard (especially earnings) must be accurate and consistent with other parts of the platform. Graceful error handling should be implemented for data fetching failures.
*   **REQ-NFR-DASH-SEC-01 (Security):** Access must be strictly limited to authenticated users. Data fetching logic must ensure users only see their own relevant information (activity, earnings).
*   **REQ-NFR-DASH-USE-01 (Usability):** The layout and presentation of information must be intuitive and easy for users to understand and act upon.
*   **REQ-NFR-DASH-ACC-01 (Accessibility):** The dashboard interface must adhere to WCAG 2.1 AA accessibility standards.
*   **REQ-NFR-DASH-MAINT-01 (Maintainability):** Code for the dashboard page and supporting components/actions should be well-structured, typed (TypeScript), and follow project conventions.
*   **REQ-NFR-DASH-TEST-01 (Testability):** Dashboard components and data fetching logic should be testable (unit, integration, potentially E2E for core navigation flows).