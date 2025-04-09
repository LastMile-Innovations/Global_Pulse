# Requirements Document: Insights Marketplace

**Version:** 1.0
**Status:** Requirements Defined (Phased Implementation P1-P3)

## 1. Introduction

This document outlines the functional and non-functional requirements for the Global Pulse "Insights Marketplace" feature. The marketplace allows external Buyers to purchase access to anonymized, aggregated datasets derived from user-submitted structured answers, while Participants (Users/Sellers) who consent share in the generated value.

## 2. Goals

*   Create a new revenue stream for the platform and its users.
*   Provide valuable, anonymized global sentiment data to researchers, businesses, and other organizations.
*   Establish an ethical and transparent model for data sharing and value attribution.
*   Maintain user privacy and control throughout the process.

## 3. Functional Requirements (FR)

### 3.1 User (Participant/Seller) Requirements

*   **REQ-MKT-CONSENT-01 (P1):** Users must be able to explicitly opt-in via their account settings to allow their *anonymized structured answers* to be included in the marketplace data pool. The consent status must be stored securely.
*   **REQ-MKT-CONSENT-02 (P1):** Users must be able to revoke their marketplace consent at any time via their account settings. Revocation must prevent their data from being included in any *future* dataset generations.
*   **REQ-MKT-SELLER-01 (P1):** Logged-in users must be able to view their total attributed earnings from marketplace participation in a dedicated section of their account dashboard.
*   **REQ-MKT-SELLER-02 (P3):** Users meeting a minimum earnings threshold must be able to securely initiate a payout request for their accumulated earnings via the account dashboard.
*   **REQ-MKT-SELLER-03 (P3):** Users must be able to manage their payout methods (e.g., link Stripe Connect account) securely within their account settings.
*   **REQ-MKT-SELLER-04 (P2 - Optional):** The user dashboard may display non-specific metrics about their consented data's contribution (e.g., number of datasets included in).

### 3.2 Buyer Requirements

*   **REQ-MKT-BUYER-01 (P1):** Potential buyers must be able to browse a catalog of available structured questions in a dedicated `/marketplace` section.
*   **REQ-MKT-BUYER-02 (P1):** The marketplace catalog must support filtering questions by topic, keywords, and question type. It may display indicative metadata like approximate available response volume (if above privacy threshold).
*   **REQ-MKT-BUYER-03 (P1):** Buyers must be able to select one or more questions to include in a dataset purchase request.
*   **REQ-MKT-BUYER-04 (P1):** For each selected question, buyers must specify the desired number of unique, anonymized answers, with the system enforcing a minimum count per question (e.g., 100).
*   **REQ-MKT-BUYER-05 (P1):** The system must calculate and display the total price for the configured dataset based on defined pricing rules (e.g., per answer, per question).
*   **REQ-MKT-BUYER-06 (P2):** Buyers must be able to complete the purchase using a secure online payment method (e.g., Stripe integration).
*   **REQ-MKT-BUYER-07 (P1 Core / P2 Payment):** Upon successful purchase confirmation, buyers must receive secure access to the generated dataset (e.g., via download link, user dashboard).
*   **REQ-MKT-BUYER-08 (P1):** The delivered dataset must contain the anonymized answers for the purchased questions and include a persistent, unique, anonymous user identifier (`anonymous_user_pseudonym`) for each answer, allowing correlation within the purchased set.
*   **REQ-MKT-BUYER-09 (P2/P3):** A system for buyer authentication and account management may be required, depending on the access model (e.g., requiring buyers to be registered users).

### 3.3 Backend & Data Processing Requirements

*   **REQ-MKT-BACKEND-01 (P1):** The system must implement a secure and robust mechanism to generate a persistent, unique, anonymous pseudonym (`anonymous_user_pseudonym`) for each user upon their first marketplace consent. This pseudonym must not be easily reversible to the original `user_id` by buyers.
*   **REQ-MKT-BACKEND-02 (P1):** A data pipeline or secure database view (`anonymized_survey_responses`) must be created to provide access to structured answer data, joining with consent status and pseudonym mapping, while strictly excluding all PII (including `user_id`).
*   **REQ-MKT-BACKEND-03 (P1):** An API endpoint must exist to serve the filterable list of questions for the marketplace catalog.
*   **REQ-MKT-BACKEND-04 (P1 Core / P2 Payment):** An API endpoint or service must handle purchase requests, calculate pricing, (P2) interact with the payment gateway, and record successful purchases (e.g., in `marketplace_purchases` table).
*   **REQ-MKT-BACKEND-05 (P1):** A service (triggered post-purchase) must generate the dataset by querying the anonymized data source based on purchase parameters, strictly enforcing consent and minimum answer counts per question.
*   **REQ-MKT-BACKEND-06 (P1):** The dataset generation service must package the data (e.g., CSV, JSON) and manage secure access delivery to the buyer.
*   **REQ-MKT-BACKEND-07 (P1):** An attribution engine must run after dataset generation to identify contributing `anonymous_user_pseudonym`s for the purchased data.
*   **REQ-MKT-BACKEND-08 (P1):** The system must calculate the revenue share for each contributing pseudonym based on predefined rules and the purchase price.
*   **REQ-MKT-BACKEND-09 (P1):** A secure ledger (`marketplace_earnings` table) must record all attributed earnings per pseudonym, linking back to the purchase and question.
*   **REQ-MKT-BACKEND-10 (P1):** An API endpoint must provide the total/recent earnings for the currently authenticated user, querying the earnings ledger via their pseudonym link.
*   **REQ-MKT-BACKEND-11 (P3):** Backend logic and API endpoints must exist to handle user payout requests, interact securely with the chosen payout provider, and update the status in the `marketplace_earnings` and `payouts` tables.

### 3.4 Administration Requirements (P3)

*   **REQ-MKT-ADMIN-01 (P3):** Administrators must have an interface to define and manage marketplace pricing models (e.g., price per answer, tiered pricing).
*   **REQ-MKT-ADMIN-02 (P3):** Administrators must be able to view and monitor marketplace transactions and purchase history.
*   **REQ-MKT-ADMIN-03 (P3):** Administrators must be able to configure and update the revenue share percentage rules.
*   **REQ-MKT-ADMIN-04 (P3):** Administrators may need tools to manually review or approve very large or unusual dataset purchase requests.
*   **REQ-MKT-ADMIN-05 (P3):** Administrators must have oversight of the payout process, including viewing requested, processing, and completed payouts.

## 4. Non-Functional Requirements (NFR)

### 4.1 Security

*   **REQ-NFR-MKT-SEC-01 (P1):** The anonymization and pseudonymization process must be robust, preventing the re-identification of users from the datasets provided to buyers. Pseudonyms must be persistent but not directly derived from user PII in an easily reversible way.
*   **REQ-NFR-MKT-SEC-02 (P1):** The system must strictly enforce user consent; only data from explicitly opted-in users shall be included in any marketplace dataset generation.
*   **REQ-NFR-MKT-SEC-03 (P1):** Access to the mapping between `user_id` and `anonymous_user_pseudonym` must be highly restricted within the backend.
*   **REQ-NFR-MKT-SEC-04 (P2):** Payment processing must be handled securely, leveraging a reputable third-party provider (e.g., Stripe) and adhering to PCI DSS standards where applicable. Sensitive payment details must not be stored on Global Pulse servers.
*   **REQ-NFR-MKT-SEC-05 (P3):** The user payout process must be secure, protecting user financial information and preventing fraudulent withdrawal requests.

### 4.2 Privacy

*   **REQ-NFR-MKT-PRIV-01 (P1):** The system must enforce a minimum threshold (e.g., 100) of unique anonymized answers required *per question* before that question's data can be included in a purchased dataset, to mitigate re-identification risks (k-anonymity principle).
*   **REQ-NFR-MKT-PRIV-02 (P1):** Datasets delivered to buyers must not contain any direct Personally Identifiable Information (PII), including original user IDs, emails, IP addresses, or overly granular timestamps.
*   **REQ-NFR-MKT-PRIV-03 (P1):** User revocation of consent must immediately prevent their data from being included in any *new* dataset generations.

### 4.3 Performance

*   **REQ-NFR-MKT-PERF-01 (P1):** The marketplace catalog browsing interface must load quickly, even with a large number of questions. Filtering and search should be responsive.
*   **REQ-NFR-MKT-PERF-02 (P1/P2):** Dataset generation time should be reasonable, even for large requests. Consider background job processing for very large datasets (P2). Buyers should receive timely notification upon completion.
*   **REQ-NFR-MKT-PERF-03 (P1):** Fetching user earnings data for the profile dashboard must be fast and efficient.
*   **REQ-NFR-MKT-PERF-04 (P1):** The revenue attribution calculation should be performant and not significantly delay the post-purchase workflow.

### 4.4 Scalability

*   **REQ-NFR-MKT-SCALE-01 (P1/P2):** The marketplace infrastructure (data storage, query processing, dataset generation, attribution logic) must be designed to scale horizontally to handle growth in users, answers, questions, and purchase volume.

### 4.5 Usability

*   **REQ-NFR-MKT-USE-01 (P1):** The buyer interface for discovering, configuring, and accessing datasets must be clear, intuitive, and easy to use.
*   **REQ-NFR-MKT-USE-02 (P1):** The user (participant) interface for managing consent and viewing earnings must be simple and understandable.

### 4.6 Reliability

*   **REQ-NFR-MKT-REL-01 (P1):** The revenue attribution and calculation logic must be accurate and reliable.
*   **REQ-NFR-MKT-REL-02 (P2):** Payment processing must be reliable, with clear feedback to the buyer in case of success or failure.
*   **REQ-NFR-MKT-REL-03 (P3):** The payout system must reliably process valid requests and handle potential failures gracefully.

### 4.7 Legal & Compliance

*   **REQ-NFR-MKT-LEGAL-01 (P1):** The consent mechanism and data handling practices must comply with relevant data privacy regulations (e.g., GDPR, CCPA).
*   **REQ-NFR-MKT-LEGAL-02 (P2/P3):** Financial transactions (payments, payouts) must comply with all applicable financial regulations and tax laws.