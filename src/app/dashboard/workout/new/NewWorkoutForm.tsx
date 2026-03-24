"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createWorkoutAction } from "./actions";
import { Trash2 } from "lucide-react";

type Exercise = { id: string; name: string };

type SetEntry = { weight: string; reps: string };

type ExerciseEntry = {
  id: string; // local key only
  mode: "existing" | "new";
  exerciseId: string;
  newExerciseName: string;
  sets: SetEntry[];
};

type State = { error?: string } | null;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Returns the next 15-min slot >= now
function nextSlot(now: Date): Date {
  const next = new Date(now);
  const m = now.getMinutes();
  const nextMinute = Math.ceil((m + 1) / 15) * 15;
  if (nextMinute >= 60) {
    next.setHours(now.getHours() + 1, 0, 0, 0);
  } else {
    next.setMinutes(nextMinute, 0, 0);
  }
  return next;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDateTime(date: Date, minute: string): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${pad(date.getHours())}:${minute}`;
}

let localId = 0;
function nextId() {
  return String(++localId);
}

type Props = {
  availableExercises: Exercise[];
};

export function NewWorkoutForm({ availableExercises }: Props) {
  const router = useRouter();
  const defaultSlot = nextSlot(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(defaultSlot);
  const [selectedHour, setSelectedHour] = useState(pad(defaultSlot.getHours()));
  const [selectedMinute, setSelectedMinute] = useState(pad(Math.floor(defaultSlot.getMinutes() / 15) * 15));
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>(() => [
    {
      id: nextId(),
      mode: availableExercises.length > 0 ? "existing" : "new",
      exerciseId: availableExercises[0]?.id ?? "",
      newExerciseName: "",
      sets: [{ weight: "", reps: "" }],
    },
  ]);

  function addExerciseEntry() {
    setExerciseEntries((prev) => [
      ...prev,
      {
        id: nextId(),
        mode: availableExercises.length > 0 ? "existing" : "new",
        exerciseId: availableExercises[0]?.id ?? "",
        newExerciseName: "",
        sets: [{ weight: "", reps: "" }],
      },
    ]);
  }

  function removeExerciseEntry(id: string) {
    setExerciseEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEntry(id: string, patch: Partial<ExerciseEntry>) {
    setExerciseEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }

  function addSet(entryId: string) {
    setExerciseEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, sets: [...e.sets, { weight: "", reps: "" }] }
          : e
      )
    );
  }

  function removeSet(entryId: string, setIndex: number) {
    setExerciseEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, sets: e.sets.filter((_, i) => i !== setIndex) }
          : e
      )
    );
  }

  function updateSet(entryId: string, setIndex: number, patch: Partial<SetEntry>) {
    setExerciseEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              sets: e.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
            }
          : e
      )
    );
  }

  async function formAction(_prevState: State, formData: FormData): Promise<State> {
    const name = formData.get("name") as string;
    const startedAtDate = new Date(selectedDate);
    startedAtDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);

    if (startedAtDate < new Date()) {
      return { error: "Start time cannot be in the past" };
    }

    const exercises = exerciseEntries.map((entry) => ({
      exerciseId: entry.mode === "existing" ? entry.exerciseId : undefined,
      newExerciseName: entry.mode === "new" ? entry.newExerciseName.trim() : undefined,
      sets: entry.sets.map((s) => ({
        weight: s.weight !== "" ? parseFloat(s.weight) : null,
        reps: s.reps !== "" ? parseInt(s.reps, 10) : null,
      })),
    }));

    try {
      await createWorkoutAction({ name, startedAt: startedAtDate, exercises });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Something went wrong" };
    }

    router.push("/dashboard");
    return null;
  }

  const [state, action, pending] = useActionState(formAction, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter workout name"
          required
        />
      </div>

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
              disabled={{ before: new Date() }}
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
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>:{m}</option>
                ))}
              </select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Exercises section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Exercises</h2>
          <Button type="button" variant="outline" size="sm" onClick={addExerciseEntry}>
            + Add Exercise
          </Button>
        </div>


        {exerciseEntries.map((entry, entryIndex) => (
          <div key={entry.id} className="border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              {availableExercises.length > 0 ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={entry.mode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateEntry(entry.id, { mode: "existing" })}
                  >
                    Choose existing
                  </Button>
                  <Button
                    type="button"
                    variant={entry.mode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateEntry(entry.id, { mode: "new" })}
                  >
                    Add new
                  </Button>
                </div>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeExerciseEntry(entry.id)}
                className="text-destructive hover:text-destructive border-destructive/40 hover:border-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Exercise picker */}
            {entry.mode === "existing" ? (
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Exercise</Label>
                <select
                  value={entry.exerciseId}
                  onChange={(e) => updateEntry(entry.id, { exerciseId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {availableExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Exercise name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Bench Press"
                  value={entry.newExerciseName}
                  onChange={(e) =>
                    updateEntry(entry.id, { newExerciseName: e.target.value })
                  }
                />
              </div>
            )}

            {/* Sets */}
            <div className="flex flex-col gap-2">
              {entry.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2 w-full">
                  <Label className="text-xs whitespace-nowrap">Weight (kg):</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={set.weight}
                    min={0}
                    step="0.5"
                    className="flex-1"
                    onChange={(e) =>
                      updateSet(entry.id, setIndex, { weight: e.target.value })
                    }
                  />
                  <Label className="text-xs whitespace-nowrap">Reps:</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={set.reps}
                    min={1}
                    step="1"
                    className="flex-1"
                    onChange={(e) =>
                      updateSet(entry.id, setIndex, { reps: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSet(entry.id)}
            >
              + Add Set
            </Button>
          </div>
        ))}
      </div>

      {state?.error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Workout"}
        </Button>
      </div>
    </form>
  );
}
