# Routing Standards

## Route Structure

All application routes must live under `/dashboard`. There are no top-level feature routes outside of `/dashboard`.

```
/dashboard                        # Dashboard home
/dashboard/workout/new            # Create workout
/dashboard/workout/[workoutId]    # View/edit a specific workout
```

The root route (`/`) is public and may serve as a landing or sign-in redirect page.

## Protected Routes

All `/dashboard` routes are protected — they require an authenticated user. Route protection is enforced via **Next.js middleware**, not in individual page components.

### Middleware Setup

Protection is configured in `src/middleware.ts` using Clerk's `clerkMiddleware()` and `createRouteMatcher`:

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Never** add auth checks directly in page components for route protection — this belongs exclusively in middleware.

## Rules

| Rule | Detail |
|------|--------|
| All app routes | Must be nested under `/dashboard` |
| Route protection | Middleware only (`src/middleware.ts`) — not in page components |
| Auth mechanism | Clerk (`clerkMiddleware` + `createRouteMatcher`) |
| Public routes | Only `/` and auth-related routes (e.g. `/sign-in`) |
