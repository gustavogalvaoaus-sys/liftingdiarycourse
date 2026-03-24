"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addExerciseToWorkoutAction, createExerciseAction } from "./actions";

type Exercise = { id: string; name: string };

type Props = {
  workoutId: string;
  availableExercises: Exercise[];
};

export function AddExerciseForm({ workoutId, availableExercises }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">(
    availableExercises.length > 0 ? "existing" : "new"
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    availableExercises[0]?.id ?? ""
  );
  const effectiveSelectedId =
    availableExercises.find((ex) => ex.id === selectedExerciseId)?.id ??
    availableExercises[0]?.id ??
    "";
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleAddExisting() {
    if (!effectiveSelectedId || availableExercises.length === 0) return;
    startTransition(async () => {
      await addExerciseToWorkoutAction({ workoutId, exerciseId: effectiveSelectedId });
      setOpen(false);
      router.refresh();
    });
  }

  async function handleCreateAndAdd() {
    if (!newExerciseName.trim()) return;
    startTransition(async () => {
      const exercise = await createExerciseAction({ name: newExerciseName.trim() });
      await addExerciseToWorkoutAction({ workoutId, exerciseId: exercise.id });
      setNewExerciseName("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          + Add Exercise
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 flex flex-col gap-3" align="end">
        {availableExercises.length > 0 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "existing" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("existing")}
            >
              Choose existing
            </Button>
            <Button
              type="button"
              variant={mode === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("new")}
            >
              Add new
            </Button>
          </div>
        )}

        {mode === "existing" ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="exercise-select" className="text-xs">Exercise</Label>
              <select
                id="exercise-select"
                value={effectiveSelectedId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                disabled={isPending || availableExercises.length === 0}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {availableExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddExisting}
              disabled={isPending || !effectiveSelectedId}
              className="w-full"
            >
              Add to Workout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-exercise-name" className="text-xs">Exercise name</Label>
              <Input
                id="new-exercise-name"
                type="text"
                placeholder="e.g. Bench Press"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button
              onClick={handleCreateAndAdd}
              disabled={isPending || !newExerciseName.trim()}
              className="w-full"
            >
              Create & Add
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
