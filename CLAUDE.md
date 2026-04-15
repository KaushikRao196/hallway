1# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture Overview

**Hallway** is an anonymous school Q&A platform where students ask questions about teachers and classes. Built with Next.js 16 App Router, Supabase (PostgreSQL), Google OAuth, and Tailwind CSS.

### Data Flow

All app state lives in `lib/store.tsx` — a single React Context (~662 lines) wrapping the entire app via `StoreProvider` in `app/layout.tsx`. On session load, it:
1. Resolves the Supabase auth session
2. Upserts the user into the `users` table (with a random anonymous handle like `BluePanda482`)
3. Resolves school from email domain (`email.split("@")[1]`)
4. If no school exists for that domain, redirects to `/onboarding`
5. Otherwise fetches all school data in parallel (classes, teachers, questions, answers, votes, ratings)

The store exposes both raw state arrays and query helpers (`getQuestionsByClass`, `getTeacherRatingSummary`, `getAnswersByQuestion`, etc.).

### Auth

- Google OAuth via Supabase → callback at `/auth/callback/route.ts`
- `middleware.ts` protects all routes except `/`, `/login`, `/auth/*`
- Two user concepts: Supabase Auth user (OAuth identity) and the app-level `users` table (anon handle, school_id)

### Database (Supabase/PostgreSQL)

Schema in `supabase/schema.sql`. Key tables:

| Table | Notes |
|-------|-------|
| `schools` | id, name, domain (e.g. `westlake.edu`) |
| `users` | anon_handle, school_id, email — separate from Supabase Auth |
| `classes` | school-scoped; code + title |
| `teachers` | school-scoped |
| `questions` | links class + optional teacher; school-scoped |
| `answers` | score field (updated by votes) |
| `votes` | PK is (user_id, target_id) — enforces one vote per user per answer |
| `teacher_ratings` | UNIQUE(teacher_id, user_id); difficulty/fairness/workload 1–5 |

RLS is **disabled** in development. Enable it before production.

Teacher overall score formula: `((6 - difficulty) + fairness + (6 - workload)) / 3 * 2` → 0–10 scale.

### Pages & Routing

All pages are `"use client"` components. Routes:

| Route | Purpose |
|-------|---------|
| `/feed` | Main Q&A feed with search/filter/sort |
| `/ask` | Question composer |
| `/class/[id]` | Class detail — questions + teacher filter |
| `/classes` | Class listing with add/edit/delete |
| `/teacher/[id]` | Teacher detail — ratings + questions |
| `/ratemyteacher` | Teacher catalog with aggregated ratings |
| `/onboarding` | First user of a domain creates the school record |

### Component Conventions

- UI primitives in `components/ui/` (Radix UI + shadcn/ui pattern)
- Domain components at `components/` root (e.g. `question-card`, `rate-teacher-dialog`, `teacher-rating-panel`)
- Bottom nav (`bottom-nav`) links: Feed, Ask, Classes, RateMyTeacher
- Mobile-first layout, max-width 1024px container

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

### Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

Both are public/client-safe. Server-side Supabase client is in `utils/supabase/server.ts`; browser client in `utils/supabase/client.ts`; middleware client in `utils/supabase/middleware.ts`.