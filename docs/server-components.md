# Server Components

## Async Page Components

All page components using the App Router MUST be `async` functions. This is required to `await` data fetching and dynamic route values.

```tsx
export default async function WorkoutPage() {
  // ...
}
```

## Route Params MUST Be Awaited

**This is Next.js 15. `params` is a Promise — it MUST be awaited before accessing any property.**

Do NOT destructure params directly from the function signature. Always receive `params` as a prop and await it.

### Correct

```tsx
// src/app/dashboard/workout/[workoutId]/page.tsx
interface Props {
  params: Promise<{ workoutId: string }>;
}

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  // use workoutId
}
```

### Incorrect — will throw at runtime

```tsx
// WRONG: params is not a Promise<...> here and accessing it without await will fail
export default async function WorkoutPage({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params; // runtime error in Next.js 15
}
```

## Search Params MUST Also Be Awaited

The same rule applies to `searchParams`:

```tsx
interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams;
}
```

## Summary

| Rule | Detail |
|------|--------|
| Page components | Always `async` |
| `params` type | `Promise<{ ... }>` — always `await` before use |
| `searchParams` type | `Promise<{ ... }>` — always `await` before use |
| Destructuring params in signature | Never — receive as prop and `await` inside the function body |
