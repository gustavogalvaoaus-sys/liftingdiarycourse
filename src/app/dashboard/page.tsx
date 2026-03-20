import { format } from "date-fns";
import { getWorkoutsForDate } from "@/data/workouts";
import { CalendarClient } from "./CalendarClient";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

function formatDuration(startedAt: Date, completedAt: Date | null): string {
  if (!completedAt) return "In progress";
  const minutes = Math.round(
    (completedAt.getTime() - startedAt.getTime()) / 60000
  );
  return `${minutes} min`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = new Date();
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedDateStr = dateParam ?? isoToday;
  const [y, m, d] = selectedDateStr.split("-").map(Number);
  const selectedDate = new Date(y, m - 1, d);

  const workouts = await getWorkoutsForDate(selectedDate);

  return (
    <div className="flex flex-col gap-8 px-12 py-10 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Workout Dashboard</h1>

      <div className="grid grid-cols-2 gap-10 items-start">
        {/* Left: Calendar */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Select Date</h2>
          <CalendarClient selectedDateStr={selectedDateStr} />
        </div>

        {/* Right: Workouts */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            Workouts for {formatDate(selectedDate)}
          </h2>

          {workouts.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No workouts logged for this date.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-xl border border-zinc-200 px-5 py-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">{workout.name}</span>
                    <span className="text-sm text-zinc-500">
                      {format(workout.startedAt, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workout.workoutExercises.map((we) => (
                      <span
                        key={we.id}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700"
                      >
                        {we.exercise.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-zinc-500">
                    Duration: {formatDuration(workout.startedAt, workout.completedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
