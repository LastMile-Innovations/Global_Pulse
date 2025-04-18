```markdown
# TODO List: Insights Marketplace Implementation

**Objective:** Implement a fully functional, production-ready Insights Marketplace feature for Global Pulse, allowing Buyers to purchase anonymized datasets and Participants/Sellers to earn revenue based on their consented contributions.

**Note:** This list breaks down the feature into sub-components and tasks. Phasing (P1, P2, P3) indicates suggested implementation order based on complexity and dependencies, but can be adjusted.



### 1. Backend - Data Model & Migrations (P1 Foundation)

*   [ ] **Profiles Table:**
    *   [ ] Add `marketplace_consent_structured_answers` column (boolean, not null, default false).
*   [ ] **User Pseudonyms Table:**
    *   [ ] Define `user_pseudonyms` table (`user_id` PK/FK to users, `anonymous_user_pseudonym` unique text/uuid, `created_at`).
    *   [ ] Implement strict RLS: Only backend service role or specific internal functions can access/link. Users cannot access directly.
*   [ ] **Anonymized Data View/Table:**
    *   [ ] Design and create `anonymized_survey_responses` (Likely a VIEW for real-time data, potentially a materialized view if performance dictates).
    *   [ ] Ensure view joins `survey_responses`, `profiles` (for consent check), and `user_pseudonyms`.
    *   [ ] Ensure view *only* exposes non-PII fields (`question_id`, `option_id`, `numeric_value`, etc.) and the `anonymous_user_pseudonym`. Exclude `user_id`.
    *   [ ] Define appropriate RLS/permissions for this view (accessible by dataset generation service role).
*   [ ] **Marketplace Purchases Table:**
    *   [ ] Define `marketplace_purchases` table (`purchase_id` PK, `buyer_identifier`, `purchase_details` jsonb, `total_price` numeric, `payment_status` text enum, `dataset_access_info` jsonb/text, `created_at`).
    *   [ ] Implement RLS (Buyers can see their own purchases, Admin can see all).
*   [ ] **Marketplace Earnings Table (Ledger):**
    *   [ ] Define `marketplace_earnings` table (`earning_id` PK, `anonymous_user_pseudonym` indexed FK, `purchase_id` FK, `question_id` FK, `answer_contribution_count` int, `amount_earned` numeric, `payout_status` text enum, `payout_id` nullable FK, `created_at`).
    *   [ ] Implement RLS (Only backend/admin service roles. Users access aggregated data via specific API).
    *   [ ] Add index on `anonymous_user_pseudonym` for efficient user earnings lookup.
*   [ ] **Payouts Table (P3):**
    *   [ ] Define `payouts` table (`payout_id` PK, `user_id` FK, `amount` numeric, `status` text enum, `provider_reference` text, `requested_at`, `processed_at`).
    *   [ ] Implement RLS (User can see their own payouts, Admin can see all, Payout service role needs update access).
*   [ ] **Drizzle Schema:**
    *   [ ] Update `lib/db/schema.ts` with all new tables and relationships.
    *   [ ] Ensure FK constraints and indexes are defined correctly.
*   [ ] **Migrations:**
    *   [ ] Run `pnpm db:generate` to create migration SQL file(s).
    *   [ ] Review generated SQL carefully.
    *   [ ] Run `pnpm db:migrate` to apply migrations to the development database.

### 2. Backend - Core Logic & APIs (Phased)

*   [ ] **Consent Management (P1):**
    *   [ ] Create Server Action or API Route (`/api/user/consent`) to update `profiles.marketplace_consent_structured_answers`.
    *   [ ] Ensure endpoint requires authentication and authorizes the update for the logged-in user only.
*   [ ] **Pseudonym Management (P1):**
    *   [ ] Implement backend logic (e.g., triggered by consent update or on-demand) to securely generate and store `anonymous_user_pseudonym` in `user_pseudonyms` if one doesn't exist for a consenting user. Ensure idempotency.
*   [ ] **Marketplace Catalog API (P1):**
    *   [ ] Create API Route (`/api/marketplace/questions`) to serve question metadata (ID, text, topic, potentially anonymized response counts if > threshold).
    *   [ ] Implement filtering and search logic.
*   [ ] **Pricing Calculation Logic (P1):**
    *   [ ] Implement backend function to calculate dataset price based on selected questions and requested answer counts.
*   [ ] **Purchase Initiation API (P1 Core / P2 Payment):**
    *   [ ] Create API Route (`/api/marketplace/checkout`) or Server Action.
    *   [ ] Takes dataset configuration (question IDs, counts) as input.
    *   [ ] Validates input (min counts per question).
    *   [ ] Calculates price using pricing logic.
    *   [ ] (P1 Stub): Records a 'pending' purchase in `marketplace_purchases`.
    *   [ ] (P2): Integrates with payment provider (e.g., Stripe) to create a checkout session/payment intent and returns the necessary info (e.g., session ID, client secret) to the frontend.
*   [ ] **Payment Confirmation Webhook (P2):**
    *   [ ] Create secure API Route (`/api/webhooks/payment-provider`) to receive webhook events (e.g., `checkout.session.completed`).
    *   [ ] Implement webhook signature verification for security.
    *   [ ] On successful payment:
        *   [ ] Update `marketplace_purchases.payment_status` to 'completed'.
        *   [ ] Trigger the Dataset Generation service.
*   [ ] **Dataset Generation Service (P1 Core Logic / P2 Trigger):**
    *   [ ] Implement core logic (can be a function or separate service).
    *   [ ] Input: `purchase_id`.
    *   [ ] Fetches purchase details from `marketplace_purchases`.
    *   [ ] Queries the `anonymized_survey_responses` view/source, filtering by `question_id`, enforcing consent, applying `LIMIT` per question, potentially using `ORDER BY random()`.
    *   [ ] Collects list of included `anonymous_user_pseudonym`s for attribution.
    *   [ ] Packages data (e.g., into CSV/JSON format).
    *   [ ] Stores the dataset securely (e.g., Supabase Storage).
    *   [ ] Generates a secure access mechanism (e.g., time-limited signed URL).
    *   [ ] Updates `marketplace_purchases.dataset_access_info`.
    *   [ ] Triggers the Revenue Attribution engine.
*   [ ] **Revenue Attribution Engine (P1):**
    *   [ ] Implement core logic (triggered after dataset generation).
    *   [ ] Input: `purchase_id`, list of included pseudonyms per question, total purchase price.
    *   [ ] Fetches revenue share percentage rules.
    *   [ ] Calculates proportional share for each contributing pseudonym.
    *   [ ] Inserts records into `marketplace_earnings` ledger (consider doing this transactionally with purchase status update).
*   [ ] **User Earnings API (P1):**
    *   [ ] Create API Route (`/api/user/earnings`) or Server Action.
    *   [ ] Requires authentication.
    *   [ ] Fetches logged-in user's `user_id`, gets their `anonymous_user_pseudonym`.
    *   [ ] Queries `marketplace_earnings` ledger (summing `amount_earned` where `payout_status` is 'pending' or similar).
    *   [ ] Returns earnings data (total, maybe recent history).
*   [ ] **Payout Request API (P3):**
    *   [ ] Create Server Action or API Route (`/api/user/payout-request`).
    *   [ ] Requires authentication.
    *   [ ] Validates if user meets minimum payout threshold.
    *   [ ] Validates if user has linked a payout method.
    *   [ ] Creates a record in the `payouts` table with 'requested' status.
    *   [ ] Updates relevant `marketplace_earnings` records to 'requested' status.
    *   [ ] (Potentially) Triggers an async job for processing.
*   [ ] **Payout Processing Logic (P3):**
    *   [ ] Implement backend logic (likely an async job/function).
    *   [ ] Fetches payout requests with 'requested' status.
    *   [ ] Interacts with the payout provider API (e.g., Stripe Connect transfer) to send funds.
    *   [ ] Updates `payouts` and `marketplace_earnings` statuses based on success/failure from the provider API.
    *   [ ] Implement retry mechanisms and error handling.
*   [ ] **Payout Method Linking (P3):**
    *   [ ] Backend API/Actions to handle onboarding flow for payout provider (e.g., generating Stripe Connect account links, handling redirects/webhooks).
    *   [ ] Securely store provider account references (e.g., Stripe Account ID) associated with the `user_id`.

### 3. Frontend - Participant/Seller UI (Phased)

*   [ ] **Consent Management UI (P1):**
    *   [ ] Add toggle/checkbox component to `/account/settings`.
    *   [ ] Display clear explanation of what consent means.
    *   [ ] Handle state and call the consent update API/Action.
    *   [ ] Provide feedback on success/failure.
*   [ ] **Earnings Dashboard UI (P1):**
    *   [ ] Create `/account/earnings` page/section.
    *   [ ] Fetch earnings data using the User Earnings API.
    *   [ ] Display total available earnings clearly.
    *   [ ] (P2/P3) Display earnings history/breakdown.
    *   [ ] Show loading and error states.
*   [ ] **Payout Request UI (P3):**
    *   [ ] Display "Request Payout" button on earnings dashboard (enabled only if threshold met and payout method linked).
    *   [ ] Confirmation modal before submitting request.
    *   [ ] Call the Payout Request API/Action.
    *   [ ] Display feedback (success message, error message).
*   [ ] **Payout Method Linking UI (P3):**
    *   [ ] Section in settings to link/manage payout method.
    *   [ ] Button to initiate onboarding flow (redirects to provider or uses provider elements).
    *   [ ] Display current payout method status (linked/not linked).

### 4. Frontend - Buyer UI (Phased)

*   [ ] **Marketplace Catalog UI (P1):**
    *   [ ] Create `/marketplace` page.
    *   [ ] Implement question list display.
    *   [ ] Implement filtering/search components.
    *   [ ] Fetch question data from the Catalog API.
    *   [ ] Show loading/error states.
*   [ ] **Dataset Builder UI (P1):**
    *   [ ] Implement UI for selecting questions ("Add to Cart" / "Select").
    *   [ ] Implement UI for specifying answer counts per question (with validation > min).
    *   [ ] Display running total price based on configuration.
*   [ ] **Checkout UI (P1 Stub / P2 Payment):**
    *   [ ] Display final dataset configuration and price.
    *   [ ] (P1 Stub): "Confirm Purchase" button triggering the stubbed purchase API.
    *   [ ] (P2): Button that redirects to Stripe Checkout or initiates payment via Stripe Elements, using data from the Purchase Initiation API.
    *   [ ] Handle success/cancel redirects from payment provider.
*   [ ] **Purchase History & Download UI (P1 Core / P2 Payment):**
    *   [ ] Section in buyer's account (`/account/purchases`?) to list past purchases.
    *   [ ] Fetch purchase history data.
    *   [ ] Display purchase details (date, questions, status).
    *   [ ] Provide secure download links/access method based on `dataset_access_info` (available once payment status is 'completed').

### 5. Administration (P3)

*   [ ] **Admin Dashboard Section:** Create restricted routes/UI for admins.
*   [ ] **Pricing Management UI:** Interface to set/update pricing rules.
*   [ ] **Transaction Viewer:** Interface to list and inspect `marketplace_purchases`.
*   [ ] **Earnings/Ledger Viewer:** Interface to view `marketplace_earnings` records (potentially filterable).
*   [ ] **Payout Management:** Interface to monitor payout requests (`payouts` table), view statuses, potentially manually trigger retries or investigate failures.
*   [ ] **Revenue Share Configuration:** Interface to set/adjust revenue share percentages.

### 6. Testing & Deployment (Ongoing)

*   [ ] **Unit Tests:** Test crucial backend logic (pricing calculation, attribution, anonymization functions) in isolation.
*   [ ] **Integration Tests:** Test API endpoints/Server Actions with mocked dependencies (DB, payment provider). Test data pipeline/view logic.
*   [ ] **E2E Tests (P2/P3):** Simulate full buyer purchase flow and seller consent/earnings view using tools like Playwright.
*   [ ] **Database Migration Testing:** Test migrations locally and in staging environments.
*   [ ] **Load Testing (P2/P3):** Test dataset generation and attribution performance under simulated load.
*   [ ] **Deployment:** Deploy migrations and application code via CI/CD pipeline.
*   [ ] **Monitoring:** Set up monitoring and alerting for marketplace APIs, database performance, payment webhooks, and payout jobs.

### 7. Security & Privacy (Ongoing)

*   [ ] **Security Review:** Conduct thorough reviews of anonymization/pseudonymization logic, RLS policies, API authorization, and webhook security.
*   [ ] **Rate Limiting:** Apply appropriate rate limits to all marketplace-related API endpoints.
*   [ ] **Input Validation:** Ensure strict validation on all inputs (buyer configuration, payment webhooks, payout requests).
*   [ ] **Dependency Audit:** Regularly audit dependencies for vulnerabilities.
*   [ ] **Privacy Policy Update:** Update the platform's privacy policy to clearly explain the marketplace, consent, data usage, and anonymization practices.
*   **Compliance Check:** Ensure compliance with relevant financial and data privacy regulations (GDPR, CCPA, etc.).

