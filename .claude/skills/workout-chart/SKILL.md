---
name: workout-chart
description: >
  Generates a bar chart image showing workout frequency by month for the past year,
  querying the PostgreSQL database directly. Use this skill whenever the user asks
  to visualize workouts, see how many workouts they've done, plot workout frequency,
  generate a workout chart/graph, or check their training consistency over time —
  even if they don't say "chart" explicitly. Also trigger for requests like "show
  me my workout history" or "how active have I been this year".
---

# Workout Chart Skill

This skill queries the `workouts` table in the PostgreSQL database for all entries
from the past year and produces a bar chart (PNG) with months on the x-axis and
workout count on the y-axis.

## Database schema (relevant table)

```sql
workouts (
  id          uuid,
  user_id     text,
  name        text,
  started_at  timestamp,   -- use this for date filtering
  completed_at timestamp,
  created_at  timestamp,
  updated_at  timestamp
)
```

## Steps

1. **Locate the .env file** — it's at the project root. The relevant variable is `DATABASE_URL` (a Neon PostgreSQL connection string).

2. **Run the bundled script** from the project root:

   ```bash
   python .claude/skills/workout-chart/scripts/workout_chart.py \
     --env .env \
     --output workout_chart.png
   ```

   The script will:
   - Parse `DATABASE_URL` from `.env`
   - Query workouts grouped by month for the past 365 days
   - Auto-install `psycopg2-binary` and `matplotlib` if missing
   - Save the chart to the specified output path

3. **Tell the user** where the image was saved and offer to open it:
   ```bash
   open workout_chart.png   # macOS
   ```

## Customising the output path

If the user wants the chart saved somewhere specific, pass their preferred path via `--output`:

```bash
python .claude/skills/workout-chart/scripts/workout_chart.py \
  --env .env \
  --output ~/Desktop/my_workouts.png
```

## Troubleshooting

- **Connection error** — verify `DATABASE_URL` is set and the Neon database is reachable.
- **No data** — the script prints a message and still saves an (empty) chart with the last 12 months shown as zeros.
- **`psycopg2` install fails** — user may need to `pip install psycopg2-binary` manually, or use a virtual environment.
