"use client";

import { ExerciseCard } from "./ExerciseCard";

type Set = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

type WorkoutExercise = {
  id: string;
  order: number;
  exercise: { id: string; name: string };
  sets: Set[];
};

type Props = {
  workoutExercises: WorkoutExercise[];
  isCompleted: boolean;
};

export function ExerciseList({ workoutExercises, isCompleted }: Props) {
  if (workoutExercises.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No exercises added yet. Add one below.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {workoutExercises.map((we) => (
        <ExerciseCard
          key={we.id}
          workoutExerciseId={we.id}
          exerciseName={we.exercise.name}
          sets={we.sets}
          isCompleted={isCompleted}
        />
      ))}
    </div>
  );
}
