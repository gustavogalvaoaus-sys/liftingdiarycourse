"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateWorkoutAction, finishWorkoutAction, startWorkoutNowAction } from "./actions";

type State = { error?: string } | null;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDateTime(date: Date, minute: string): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${pad(date.getHours())}:${minute}`;
}

type Props = {
  workout: {
    id: string;
    name: string;
    startedAt: Date;
    completedAt: Date | null;
  };
  isCompleted: boolean;
  dateParam?: string;
};

export function EditWorkoutForm({ workout, isCompleted, dateParam }: Props) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(workout.startedAt);
  const [selectedHour, setSelectedHour] = useState(pad(workout.startedAt.getHours()));
  const [selectedMinute, setSelectedMinute] = useState(pad(workout.startedAt.getMinutes()));
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setSelectedDate(workout.startedAt);
    setSelectedHour(pad(workout.startedAt.getHours()));
    setSelectedMinute(pad(workout.startedAt.getMinutes()));
  }, [workout.startedAt]);

  async function formAction(_prevState: State, formData: FormData): Promise<State> {
    const name = formData.get("name") as string;
    const startedAtDate = new Date(selectedDate);
    startedAtDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);

    try {
      await updateWorkoutAction({
        id: workout.id,
        name,
        startedAt: startedAtDate,
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Something went wrong" };
    }

    router.push(dateParam ? `/dashboard?date=${dateParam}` : "/dashboard");
    return null;
  }

  const [state, action, pending] = useActionState(formAction, null);

  return (
    <form id="edit-workout-form" action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={workout.name}
          readOnly={isCompleted}
          required
        />
      </div>

      {isCompleted && workout.completedAt && (
        <>
          <div className="flex items-center justify-between">
            <Label>Start Time</Label>
            <span className="text-sm">{formatDateTime(workout.startedAt, pad(workout.startedAt.getMinutes()))}</span>
          </div>
          <div className="flex items-center justify-between">
            <Label>Finish Time</Label>
            <span className="text-sm">{formatDateTime(workout.completedAt, pad(workout.completedAt.getMinutes()))}</span>
          </div>
          <div className="flex items-center justify-between">
            <Label>Duration</Label>
            <span className="text-sm">{Math.round((workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000)} min</span>
          </div>
        </>
      )}

      {!isCompleted && (
      <div className="flex items-center justify-between">
        <Label>Start Time</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {formatDateTime(selectedDate, selectedMinute)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => {
                  if (day) setSelectedDate(day);
                }}
              />
              <div className="flex gap-2 mt-3 border-t pt-3">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 24 }, (_, i) => pad(i)).map((h) => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="flex h-9 w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 60 }, (_, i) => pad(i)).map((m) => (
                    <option key={m} value={m}>:{m}</option>
                  ))}
                </select>
              </div>
            </PopoverContent>
          </Popover>
      </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {state.error}
        </p>
      )}

    </form>
  );
}

export function EditWorkoutActions({
  isCompleted,
  isSkipped,
  isInProgress,
  isScheduled,
  workoutId,
  workoutName,
  dateParam,
}: {
  isCompleted: boolean;
  isSkipped: boolean;
  isInProgress: boolean;
  isScheduled: boolean;
  workoutId: string;
  workoutName: string;
  dateParam?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showStartModal, setShowStartModal] = useState(false);

  const dashboardHref = dateParam ? `/dashboard?date=${dateParam}` : "/dashboard";

  if (isCompleted || isSkipped) {
    return (
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push(dashboardHref)}>
          Cancel
        </Button>
      </div>
    );
  }

  function handleFinish() {
    startTransition(async () => {
      await finishWorkoutAction({ id: workoutId });
      router.refresh();
    });
  }

  function handleStartNow() {
    startTransition(async () => {
      await startWorkoutNowAction({ id: workoutId, name: workoutName });
      setShowStartModal(false);
      router.refresh();
    });
  }

  function handleStartAsScheduled() {
    setShowStartModal(false);
    router.refresh();
  }

  return (
    <>
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Start Workout</h2>
            <p className="text-sm text-zinc-500">
              This workout is scheduled for a later time. Do you want to anticipate it and start now?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStartModal(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleStartAsScheduled}
                disabled={isPending}
              >
                Keep Schedule
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleStartNow}
                disabled={isPending}
              >
                {isPending ? "Starting..." : "Anticipate"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(dashboardHref)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" form="edit-workout-form" disabled={isPending}>
          Save Changes
        </Button>
        {isScheduled && (
          <Button
            type="button"
            variant="default"
            onClick={() => setShowStartModal(true)}
            disabled={isPending}
          >
            Start Workout
          </Button>
        )}
        {isInProgress && (
          <Button
            type="button"
            variant="default"
            onClick={handleFinish}
            disabled={isPending}
          >
            {isPending ? "Finishing..." : "Finish Workout"}
          </Button>
        )}
      </div>
    </>
  );
}
