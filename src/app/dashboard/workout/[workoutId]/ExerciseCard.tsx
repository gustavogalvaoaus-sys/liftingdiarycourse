"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  logSetAction,
  deleteSetAction,
  removeExerciseFromWorkoutAction,
} from "./actions";

type Set = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

type Props = {
  workoutExerciseId: string;
  exerciseName: string;
  sets: Set[];
  isCompleted: boolean;
};

export function ExerciseCard({ workoutExerciseId, exerciseName, sets, isCompleted }: Props) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleAddSet() {
    startTransition(async () => {
      await logSetAction({
        workoutExerciseId,
        weight: weight !== "" ? parseFloat(weight) : null,
        reps: reps !== "" ? parseInt(reps) : null,
      });
      setWeight("");
      setReps("");
      router.refresh();
    });
  }

  async function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction({ setId });
      router.refresh();
    });
  }

  async function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction({ workoutExerciseId });
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{exerciseName}</h3>
        {!isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveExercise}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
        )}
      </div>

      {sets.length > 0 && (
        <div className="flex flex-col gap-1">
          {sets.map((set) => (
            <div
              key={set.id}
              className="flex items-center gap-3 text-sm py-1 border-b last:border-0"
            >
              <span className="text-muted-foreground w-12">
                Set {set.setNumber}
              </span>
              <span className="flex-1">
                {set.weight !== null ? `${set.weight} kg` : "—"}
                {" · "}
                {set.reps !== null ? `${set.reps} reps` : "—"}
              </span>
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSet(set.id)}
                  disabled={isPending}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isCompleted && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">
              Weight (kg)
            </Label>
            <Input
              id={`weight-${workoutExerciseId}`}
              type="number"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">
              Reps
            </Label>
            <Input
              id={`reps-${workoutExerciseId}`}
              type="number"
              placeholder="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button onClick={handleAddSet} disabled={isPending}>
            + Add Set
          </Button>
        </div>
      )}
    </div>
  );
}
