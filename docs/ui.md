# UI Coding Standards

## Component Standards

### ONLY shadcn/ui Components
- **ABSOLUTELY NO custom components should be created**
- Use ONLY shadcn/ui components for all UI elements
- All components must come from the shadcn/ui library
- No exceptions to this rule

## Date Formatting Standards

### Library
- Use `date-fns` for all date formatting operations

### Format Specification
Dates must be formatted using ordinal indicators as follows:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

### Format Pattern
- Day with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
- Abbreviated month name (3 letters)
- Full year (4 digits)

### Timezone Handling

**All datetime values from the database are stored and returned in UTC.**

When displaying any date or time in the UI, **always convert to the user's local timezone**. Never render raw UTC values.

Use `date-fns-tz` for timezone-aware formatting:

```tsx
import { toZonedTime, format } from "date-fns-tz";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localDate = toZonedTime(utcDate, userTimezone);
```

`Intl.DateTimeFormat().resolvedOptions().timeZone` is only available in the browser, so timezone conversion must happen in a Client Component — pass the UTC value from the Server Component and convert in the client.