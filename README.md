# Global Pulse: An Ethical AI Journey in Self-Discovery

**The Challenge:** Most AI today is optimized for engagement, not well-being. It often lacks depth, transparency, and respect for user agency. People deserve more control and insight into their own data and experiences.

**Our Vision:** Global Pulse is pioneering a new kind of AI companion—one that supports self-discovery, reflection, and presence, all grounded in psychological science and ethical design. *Our journey began with a simple question: Can AI help us listen to ourselves, and each other, more deeply?*

---

**⚡ 10-DAY HACKATHON PROTOTYPE: STATUS & INTENT ⚡**

This project was built in just 10 days for the Vercel AI Hackathon. It’s a foundational prototype—a proof that ethical, user-centered AI can be built rapidly and transparently. Many features are conceptual or in early development. **Not all functionality is live or interactive yet.** We’re building in the open, prioritizing safety, ethics, and user control above all. **Our goal: show that integrity and speed can coexist.**

---

## Our Ethical Compass

Ethics are not an afterthought—they are the foundation:

1.  **User Sovereignty:** Users are in control. Consent is explicit, not assumed.
2.  **Presence Over Prediction:** Designed for reflection, not manipulation.
3.  **Clarity & Narrative Integrity:** Prioritize understanding, not just engagement.
4.  **Ethical Tension:** Risks are acknowledged and addressed.
5.  **Transparency & Accountability:** Open source, clear explanations.
6.  **Co-Design with Dignity:** User experience and agency come first.
7.  **Privacy by Default:** Minimal, private by default.

➡️ **Explore our [Ethical Framework & Safety Measures](/ethics) for details.**

## Core Concepts: EWEF & UIG

Global Pulse is built around two key innovations:

- **Unified Identity Graph (UIG):** A private, evolving map of your identity—values, goals, needs, and more. (Structure defined)
- **Enhanced Webb Emotional Framework (EWEF):** An analysis engine designed to interpret interactions through the lens of your UIG and psychological principles. (Core logic V1 implemented)

➡️ **See [How It Works](/how-it-works) for a conceptual overview.**

## Hackathon Prototype: What’s Built

This prototype demonstrates the core building blocks achieved in our sprint:

**Backend:**
- Core APIs (Chat V1, Profile/Consent) via Next.js App Router
- EWEF/UIG V1 logic
- User Authentication (Supabase Auth with SSR)
- Databases: Supabase Postgres/Drizzle, Neo4j integration
- Ethical Guardrails V1 (backend checks)
- Learning Layer V1 (feedback logic)
- Redis for session state (mode)

**Frontend:**
- Basic Chat Interface (view-only, simple rendering)
- Personal Dashboard V1 (`/dashboard` with sample data)
- Consent Management UI (`/settings/consent`)
- Mode Switching UI (Insight/Listening)

**Known Issues & Limitations:**
- **XAI "Why?" Snippet:** UI present, but backend is not functional yet.
- **UI Polish:** Missing mode acknowledgment, "Thinking..." indicator.
- **Live Chat:** **Not yet implemented.** Demo uses a simulation.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase, Neo4j, Redis, Vercel AI SDK, shadcn/ui, Tailwind CSS.


## Demo: What You Can Try

- **Live Demo:** [https://globalpulse.app](https://globalpulse.app) (Replace with actual Vercel URL)
- **Interactive:** Sign up/log in, view the Dashboard (sample data), manage Consent Settings.
- **Simulated Chat:** The chat interface **does not connect to a live AI agent yet.** Instead, you can view a pre-scripted example of the intended interaction style:
    ➡️ **[Simulated Chat Demo](https://globalpulse.app/#chat-demo)** *(This is a vision preview, not current capability. The site clarifies this.)*

## Architecture Overview

A high-level look at the system (see [How It Works](/how-it-works) for more):
