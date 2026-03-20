# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- Any other mechanism

Server Components are the only approved data fetching boundary. If you find yourself reaching for `useEffect`, `fetch` in a client component, or an API route to load data — stop and restructure as a Server Component instead.

## Database Queries via `/data` Helper Functions

All database queries MUST be performed through helper functions located in the `/data` directory.

- Helper functions use **Drizzle ORM** exclusively — **never write raw SQL**
- Each helper function is responsible for scoping queries to the authenticated user

### User Data Isolation

**A logged-in user must ONLY ever be able to access their own data.**

Every helper function that queries user-specific data MUST filter by the authenticated user's ID. Never write a query that could return another user's data.

Example pattern:

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function getWorkouts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

Then consume in a Server Component:

```tsx
// src/app/dashboard/page.tsx
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

## Summary

| Rule | Detail |
|------|--------|
| Data fetching location | Server Components only |
| Query mechanism | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| User data scope | Always filter by authenticated user ID |
