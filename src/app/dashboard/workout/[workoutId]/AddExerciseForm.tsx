"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addExerciseToWorkoutAction, createExerciseAction, logSetAction } from "./actions";

type Exercise = { id: string; name: string };
type SetEntry = { weight: string; reps: string };

type Props = {
  workoutId: string;
  availableExercises: Exercise[];
};

export function AddExerciseForm({ workoutId, availableExercises }: Props) {
  const router = useRouter();
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
  const [sets, setSets] = useState<SetEntry[]>([{ weight: "", reps: "" }]);
  const [isPending, startTransition] = useTransition();

  function addSet() {
    setSets((prev) => [...prev, { weight: "", reps: "" }]);
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSet(index: number, patch: Partial<SetEntry>) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleAdd() {
    startTransition(async () => {
      let exerciseId = effectiveSelectedId;
      if (mode === "new") {
        if (!newExerciseName.trim()) return;
        const exercise = await createExerciseAction({ name: newExerciseName.trim() });
        exerciseId = exercise.id;
      } else {
        if (!exerciseId) return;
      }

      const { workoutExerciseId } = await addExerciseToWorkoutAction({ workoutId, exerciseId });

      await Promise.all(
        sets.map((s) =>
          logSetAction({
            workoutExerciseId,
            weight: s.weight !== "" ? parseFloat(s.weight) : null,
            reps: s.reps !== "" ? parseInt(s.reps) : null,
          })
        )
      );

      setNewExerciseName("");
      setSets([{ weight: "", reps: "" }]);
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
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
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Exercise</Label>
          <select
            value={effectiveSelectedId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={isPending}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {availableExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Exercise name</Label>
          <Input
            type="text"
            placeholder="e.g. Bench Press"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            disabled={isPending}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sets.map((set, i) => (
          <div key={i} className="flex items-center gap-2 w-full">
            <Label className="text-xs whitespace-nowrap">Weight (kg):</Label>
            <Input
              type="number"
              placeholder="0"
              value={set.weight}
              min={0}
              step="0.5"
              className="flex-1"
              onChange={(e) => updateSet(i, { weight: e.target.value })}
              disabled={isPending}
            />
            <Label className="text-xs whitespace-nowrap">Reps:</Label>
            <Input
              type="number"
              placeholder="0"
              value={set.reps}
              min={0}
              step="1"
              className="flex-1"
              onChange={(e) => updateSet(i, { reps: e.target.value })}
              disabled={isPending}
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addSet}
        disabled={isPending}
      >
        + Add Set
      </Button>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={isPending || (mode === "existing" ? !effectiveSelectedId : !newExerciseName.trim())}
      >
        {isPending ? "Adding..." : "Add to Workout"}
      </Button>
    </div>
  );
}
