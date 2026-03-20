# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19** — Server Components by default
- **TypeScript** with strict settings; path alias `@/*` → `src/*`
- **Tailwind CSS v4** via `@tailwindcss/postcss`

**IMPORTANT**: When generating any code, ALWAYS first refer to the relevant documentation files within the `/docs` directory to understand existing patterns, conventions, and best practices before implementation:

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md
- /docs/server-components.md
- /docs/routing.md

## Architecture

Routing uses the App Router file-based convention under `src/app/`. Root layout is `src/app/layout.tsx`; pages co-locate with their routes. API routes go under `src/app/api/`.

No data layer exists yet — this is a starter template.
