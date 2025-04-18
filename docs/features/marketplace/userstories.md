# User Stories: Insights Marketplace

**Version:** 1.0
**Status:** Defined (Phased Implementation P1-P3)

This document outlines user stories for the Insights Marketplace feature of Global Pulse, focusing on the perspectives of both the Buyers purchasing data and the Participants/Sellers contributing data.

---

### 1. Buyer User Stories

*   **As a Buyer (Researcher), I want to browse a catalog of structured questions asked on Global Pulse, so that I can identify data relevant to my research topic.**
*   **As a Buyer, I want to filter the question catalog by topic, keyword, or question type, so that I can quickly find the specific insights I need.**
*   **As a Buyer, I want to see metadata about questions in the catalog, such as the approximate number of available anonymized answers (if above a privacy threshold), so I can gauge dataset size.**
*   **As a Buyer, I want to select multiple questions from the catalog to build a custom dataset for purchase, so I can correlate answers across different questions.**
*   **As a Buyer, I want to specify the number of unique, anonymized answers I need for each selected question (with a minimum required), so I can control the scale and cost of my dataset.**
*   **As a Buyer, I want to see a clear, calculated price for the dataset I have configured before committing to a purchase, so I understand the cost.**
*   **As a Buyer (P2), I want to complete my purchase securely using a standard online payment method (e.g., credit card via Stripe), so I can easily acquire the data.**
*   **As a Buyer, I want to receive secure access to download my purchased dataset (e.g., as a CSV or JSON file) after my payment is confirmed, so I can begin my analysis.**
*   **As a Buyer, I want the purchased dataset to include a persistent but anonymous identifier for each respondent with every answer, so that I can track responses from the same individual across different questions within my dataset without knowing their identity.**
*   **As a Buyer, I want assurance that the data I purchase is from users who explicitly consented and that it meets minimum anonymity thresholds (e.g., 100+ responses per question), so I can use the data ethically and responsibly.**
*   **As a Buyer (P2/P3), I want to potentially have an account where I can view my past purchases and re-download datasets if needed.**

### 2. Participant/Seller User Stories

*   **As a Participant/Seller, I want to find a clear option in my account settings to learn about the Insights Marketplace and provide my explicit consent (opt-in) to include my anonymized structured answers, so I can choose to participate.**
*   **As a Participant/Seller, I want the consent description to clearly explain what data will be shared (anonymized structured answers), how it will be anonymized (using a pseudonym), and how revenue sharing works, so I can make an informed decision.**
*   **As a Participant/Seller, I want to be able to easily revoke my consent for marketplace participation at any time through my account settings, so I remain in control of my data.**
*   **As a Participant/Seller, I want revocation of consent to immediately stop my data from being included in any *future* dataset purchases.**
*   **As a Participant/Seller, I want to see the total earnings attributed to my anonymized data contributions displayed clearly in a dedicated section of my account dashboard, so I can track the value generated.**
*   **As a Participant/Seller (P2/P3 - Optional), I want to potentially see some non-specific metrics about how my data has contributed (e.g., "Included in 5 purchased datasets"), so I get a sense of my impact.**
*   **As a Participant/Seller (P3), I want to be notified or see clearly when I have reached the minimum earnings threshold required for a payout.**
*   **As a Participant/Seller (P3), I want a secure way to link my preferred payout method (e.g., Stripe Connect, PayPal) within my account settings.**
*   **As a Participant/Seller (P3), I want to be able to easily initiate a payout request for my available earnings once I meet the threshold and have linked a payout method.**
*   **As a Participant/Seller (P3), I want to be able to track the status of my payout requests (e.g., requested, processing, paid, failed) in my earnings dashboard.**

### 3. Administrator User Stories (P3 - Primarily)

*   **As an Administrator, I want to define and manage the pricing models for marketplace datasets (e.g., price per answer), so I can control the platform's revenue.**
*   **As an Administrator, I want to view a log or dashboard of all marketplace transactions, including buyer details, purchased datasets, and payment status, so I can monitor activity.**
*   **As an Administrator, I want to configure and update the revenue share percentage allocated to participating users, so I can manage the platform's financial model.**
*   **As an Administrator, I want to view aggregated statistics about user consent rates and available data pool sizes, so I can understand marketplace potential.**
*   **As an Administrator, I want tools to potentially review and approve very large or unusual dataset purchase requests before generation, so I can prevent system abuse or unexpected costs.**
*   **As an Administrator, I want to monitor the payout system, view payout request statuses, and potentially investigate or manually handle failed payouts.**