"use server";

import { z } from "zod";
import { db } from "@/db";
import { workoutExercises, sets, exercises } from "@/db/schema";
import { createWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";

const setSchema = z.object({
  weight: z.number().positive().nullable(),
  reps: z.number().int().positive().nullable(),
});

const exerciseEntrySchema = z.object({
  // Either an existing exercise id or a new name
  exerciseId: z.string().optional(),
  newExerciseName: z.string().optional(),
  sets: z.array(setSchema),
});

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.coerce.date().refine((date) => date >= new Date(), {
    message: "Start time cannot be in the past",
  }),
  exercises: z.array(exerciseEntrySchema),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: Date;
  exercises: Array<{
    exerciseId?: string;
    newExerciseName?: string;
    sets: Array<{ weight: number | null; reps: number | null }>;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse(params);
  const workout = await createWorkout({
    name: validated.name,
    startedAt: validated.startedAt,
  });

  for (let i = 0; i < validated.exercises.length; i++) {
    const entry = validated.exercises[i];

    let exerciseId = entry.exerciseId;

    if (!exerciseId && entry.newExerciseName) {
      const [created] = await db
        .insert(exercises)
        .values({ name: entry.newExerciseName })
        .returning({ id: exercises.id });
      exerciseId = created.id;
    }

    if (!exerciseId) continue;

    const [we] = await db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId, order: i })
      .returning({ id: workoutExercises.id });

    for (let j = 0; j < entry.sets.length; j++) {
      const s = entry.sets[j];
      await db.insert(sets).values({
        workoutExerciseId: we.id,
        setNumber: j + 1,
        weight: s.weight !== null ? String(s.weight) : null,
        reps: s.reps,
      });
    }
  }

  return { workoutId: workout.id };
}
