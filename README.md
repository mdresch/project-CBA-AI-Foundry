# project-CBA-AI-Foundry

This project is a chat-based AI assistant frontend built with React and TypeScript. It integrates with Supabase for database persistence and Google AI for large language model responses.

Key features include a real-time chat interface, prompt templates, a history of AI conversations, and an optimistic UI for a smooth user experience.

## Key Technologies

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL)
- **AI:** Google AI
- **UI Components:** shadcn/ui, lucide-react
- **State Management:** React Context

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/products/docker-desktop/) (for running the local Supabase instance)

## Getting Started

Follow these steps to get your development environment set up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd project-CBA-AI-Foundry
```

### 2. Install Dependencies

Install the required npm packages.

```bash
npm install
```

### 3. Configure Environment Variables

The application requires environment variables to connect to Supabase and Google AI.

1.  Create a copy of the example environment file:
    ```bash
    cp .env.example .env.local
    ```
2.  Open `.env.local` and add your credentials. You will need to populate the following, which can be obtained from your Supabase project dashboard and Google AI settings:
    ```
    VITE_SUPABASE_URL="your-supabase-url"
    VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
    VITE_GOOGLE_AI_API_KEY="your-google-ai-api-key"
    ```

### 4. Set Up Local Database

This project uses Supabase for the backend. The included scripts help manage a local instance via Docker.

1.  **Start Supabase services:**
    *Note: This requires Docker to be running.*
    ```bash
    npx supabase start
    ```
2.  **Apply database migrations:**
    The migrations in the `supabase/migrations` directory define the database schema. To apply them to your local database, run:
    ```bash
    npx supabase db reset
    ```
    This will create the necessary tables (`chat_sessions`, `messages`, etc.).

## Running the Development Server

Once the setup is complete, you can start the Vite development server.

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port). The Vite server is configured to listen on `0.0.0.0` to support various development environments.

## Available Scripts

The `package.json` file includes several scripts for development and maintenance:

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Compiles the TypeScript and React code for production.
-   `npm run lint`: Lints the codebase using ESLint to check for errors and style issues.
-   `npm run preview`: Serves the production build locally for previewing.

---

## For AI Agents: LLM-Ready Context

The following section contains a detailed, LLM-friendly summary of the project. It is intended to be used as a context block for an AI agent to begin work on this codebase.

<details>
<summary>Click to expand AI Agent Context</summary>

### Repository Summary
- **Name**: project-CBA-AI-Foundry
- **Type**: React + TypeScript single-page app built with Vite.
- **Purpose**: A chat-based AI assistant frontend that integrates with Supabase for persistence and Google AI for model responses. The app supports prompt templates, an AI history sidebar, optimistic UI for chat messages, and a small prompt library.

### High-level Architecture
- **Frontend (`src/`)**: React components and UI primitives.
  - `src/components/`: UI components including `Chat.tsx`, `ChatSubComponents.tsx`, `Docs.tsx`, `Navigation.tsx`, `TemplateForm.tsx`.
  - `src/utils/`: `supabaseClient.ts` (safe stub when env vars missing).
  - `src/lib/`: `googleAI.ts` (lazy-init / wrapper around Google AI client).
  - `src/types/`: Domain types used across the app.
  - `src/data/`: `promptTemplates.json` (presets for templates).
- **Backend persistence**: Supabase (local dev via Docker). The DB schema includes `chat_sessions`, `messages`, `userpromptlibrary`, and `auth.users`.

### Important Files
- `src/components/Chat.tsx`: Primary chat UI and logic.
- `src/utils/supabaseClient.ts`: Supabase client initialization.
- `src/lib/googleAI.ts`: Wrapper for Google AI calls.
- `supabase/migrations/`: Database schema definitions.

### LLM-Ready Context Block

---BEGIN-LLM-CONTEXT---
REPO: project-CBA-AI-Foundry
ROOT: d:/source/repos/project-CBA-AI-Foundry
MAIN LANG: TypeScript (React, Vite)
GOAL: Provide a working chat frontend that integrates with Supabase for persistence and a model backend (Google AI wrapper). Maintain optimistic UI behavior for new messages and keep the app robust to missing environment variables.

CURRENT-STATE:
- Chat UI exists: `src/components/Chat.tsx`.
- Subcomponents: `ChatSubComponents.tsx` (message renderers), `TemplateForm.tsx` (template variable inputs).
- Supabase client: `src/utils/supabaseClient.ts` exposes `supabase`. If VITE env vars are missing, it exports a runtime stub to avoid import-time crashes.
- Google AI wrapper: `src/lib/googleAI.ts` uses lazy initialization to avoid import-time failures.

KNOWN-ISSUES / TODO:
- Verify `Chat.tsx` types across the repo; replace remaining `any`/unknown with domain DB row types.
- Add small mappers to convert Supabase rows into `Message` / `ChatSession` domain objects.
- Run full lint/typecheck and fix remaining warnings.

---END-LLM-CONTEXT---

</details>
