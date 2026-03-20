# Auth Coding Standards

## Provider: Clerk

This app uses **Clerk** for all authentication. Do NOT implement custom auth, use NextAuth, or any other auth library.

## Server-Side: Getting the Current User

Use `auth()` from `@clerk/nextjs/server` in Server Components and `/data` helper functions.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

**Never** use `getServerSession`, `cookies()`, or any other mechanism to retrieve the current user.

## Client-Side: Auth State & UI

Use Clerk's React components and hooks from `@clerk/nextjs`:

- `<ClerkProvider>` — wraps the app in `src/app/layout.tsx` (already in place, do not add again)
- `<Show when="signed-in">` / `<Show when="signed-out">` — conditionally render UI based on auth state
- `<SignInButton>` / `<SignUpButton>` — trigger sign-in/sign-up modals
- `<UserButton>` — displays the current user's avatar with account management

## Middleware: Route Protection

Route protection is handled via `clerkMiddleware()` in `src/middleware.ts`. The default setup runs Clerk on all routes. To protect specific routes, use `createRouteMatcher` inside the middleware — do not hand-roll auth checks in page components.

## User Data Isolation

Every `/data` helper that queries user-specific data **must** scope the query to the authenticated `userId`. See `data-fetching.md` for the required pattern. Never return data without filtering by `userId`.

## Summary

| Concern | Tool |
|---|---|
| Auth provider | Clerk |
| Get user (server) | `auth()` from `@clerk/nextjs/server` |
| UI components | `@clerk/nextjs` (`Show`, `SignInButton`, `UserButton`, etc.) |
| Route protection | `clerkMiddleware()` in `src/middleware.ts` |
| User data scoping | Always filter by `userId` in `/data` helpers |
