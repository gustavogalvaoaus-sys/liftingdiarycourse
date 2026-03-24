"use server";

import { z } from "zod";
import { updateWorkout, finishWorkout } from "@/data/workouts";
import {
  addExerciseToWorkout,
  createExercise,
  logSet,
  deleteSet,
  removeExerciseFromWorkout,
} from "@/data/exercises";

const updateWorkoutSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  id: string;
  name: string;
  startedAt: Date;
}) {
  const validated = updateWorkoutSchema.parse(params);
  await updateWorkout(validated.id, {
    name: validated.name,
    startedAt: validated.startedAt,
  });
}

export async function finishWorkoutAction(params: { id: string }): Promise<void> {
  const id = z.string().min(1).parse(params.id);
  await finishWorkout(id);
}

export async function startWorkoutNowAction(params: { id: string; name: string }): Promise<void> {
  const id = z.string().min(1).parse(params.id);
  const name = z.string().min(1).parse(params.name);
  await updateWorkout(id, { name, startedAt: new Date() });
}

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(params: {
  workoutId: string;
  exerciseId: string;
}): Promise<void> {
  const validated = addExerciseToWorkoutSchema.parse(params);
  await addExerciseToWorkout(validated);
}

const createExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
});

export async function createExerciseAction(params: {
  name: string;
}): Promise<{ id: string; name: string }> {
  const validated = createExerciseSchema.parse(params);
  return createExercise({ name: validated.name });
}

const logSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  weight: z.number().positive().nullable(),
  reps: z.number().int().positive().nullable(),
});

export async function logSetAction(params: {
  workoutExerciseId: string;
  weight: number | null;
  reps: number | null;
}): Promise<void> {
  const validated = logSetSchema.parse(params);
  await logSet(validated);
}

const deleteSetSchema = z.object({
  setId: z.string().min(1),
});

export async function deleteSetAction(params: {
  setId: string;
}): Promise<void> {
  const validated = deleteSetSchema.parse(params);
  await deleteSet(validated.setId);
}

const removeExerciseFromWorkoutSchema = z.object({
  workoutExerciseId: z.string().min(1),
});

export async function removeExerciseFromWorkoutAction(params: {
  workoutExerciseId: string;
}): Promise<void> {
  const validated = removeExerciseFromWorkoutSchema.parse(params);
  await removeExerciseFromWorkout(validated.workoutExerciseId);
}
