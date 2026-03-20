# Data Mutations

## CRITICAL: Server Actions Only

**ALL data mutations MUST be done exclusively via Next.js Server Actions.**

Do NOT mutate data via:
- Route handlers (`src/app/api/`)
- Client components directly calling the database
- Any other mechanism

## Server Actions via `actions.ts`

All server actions MUST be defined in colocated `actions.ts` files within their respective route directories.

```
src/app/dashboard/actions.ts       ✅
src/app/workouts/[id]/actions.ts   ✅
src/app/api/workouts/route.ts      ❌ (not for mutations)
```

Every `actions.ts` file must include `"use server"` at the top.

## Database Mutations via `/data` Helper Functions

All database writes MUST be performed through helper functions located in the `/data` directory.

- Helper functions use **Drizzle ORM** exclusively — **never write raw SQL**
- Each helper function is responsible for scoping mutations to the authenticated user
- Server actions call these helpers — they do NOT call the database directly

### User Data Isolation

**A logged-in user must ONLY ever be able to modify their own data.**

Every helper function that mutates user-specific data MUST verify the authenticated user's ID before writing. Never write a mutation that could affect another user's data.

Example pattern:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(data: { name: string; date: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.insert(workouts).values({ ...data, userId });
}

export async function deleteWorkout(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .delete(workouts)
    .where(eq(workouts.id, id) && eq(workouts.userId, userId));
}
```

## Server Action Requirements

### 1. Typed Parameters — No `FormData`

Server action parameters MUST be explicitly typed. `FormData` is NOT an acceptable parameter type.

```ts
// ✅ Correct
export async function createWorkout(params: { name: string; date: Date }) {}

// ❌ Wrong
export async function createWorkout(formData: FormData) {}
```

### 2. Zod Validation

**ALL server actions MUST validate their arguments using Zod** before doing anything else.

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const validated = createWorkoutSchema.parse(params);
  return createWorkout(validated);
}
```

Define the Zod schema in the same `actions.ts` file, above the action that uses it.

### 3. No Redirects in Server Actions

`redirect()` from `next/navigation` must **not** be called inside server actions. Navigation decisions belong on the client side. After the action resolves successfully, redirect using `router.push()` in the client component.

```ts
// ❌ Before — redirect inside the server action
export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
  redirect("/dashboard"); // ❌
}

// ✅ After — action returns, client navigates
export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
  // no redirect — caller handles navigation
}

// In the client component:
async function formAction(_prevState: State, formData: FormData): Promise<State> {
  try {
    await createWorkoutAction({ name, startedAt: new Date(startedAt) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  router.push("/dashboard"); // ✅ client-side navigation
  return null;
}
```

## Summary

| Rule | Detail |
|------|--------|
| Mutation location | Server Actions only |
| Action file naming | `actions.ts`, colocated with the route |
| Mutation mechanism | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| Parameter type | Typed object — never `FormData` |
| Validation | Zod, on every server action |
| User data scope | Always filter/verify by authenticated user ID |
| Redirects | Never in server actions — use `router.push()` on the client |
