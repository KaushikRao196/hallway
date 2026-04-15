# Hallway

Anonymous school Q&A platform where students ask questions and get advice from classmates about teachers, workloads, grading styles, and class selection — all school-verified, none peer-identifiable.

## What it does

- **Ask questions anonymously** — posts appear under a randomly assigned handle (e.g. `BluePanda482`)
- **Answer & vote** — upvote/downvote answers; scores are tracked per answer
- **Rate teachers** — difficulty, fairness, and workload rated 1–5, aggregated into a 0–10 overall score
- **School-scoped** — data is isolated per school domain; sign in with your school Google account

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Supabase** (PostgreSQL + Auth)
- **Google OAuth** — school domain verified via email
- **Tailwind CSS** + Radix UI (shadcn/ui)

## Getting started

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Schema lives in `supabase/schema.sql`. Run it against your Supabase project to set up tables and seed data. RLS is disabled for development — enable it before deploying to production.
