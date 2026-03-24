import { db } from "@/db";
import { exercises, workoutExercises, sets, workouts } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getAllExercises() {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function createExercise(data: { name: string }) {
  const [exercise] = await db
    .insert(exercises)
    .values({ name: data.name })
    .returning({ id: exercises.id, name: exercises.name });
  return exercise;
}

export async function getWorkoutWithExercisesAndSets(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}

export async function addExerciseToWorkout(data: {
  workoutId: string;
  exerciseId: string;
}): Promise<{ workoutExerciseId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, data.workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) throw new Error("Unauthorized");

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, data.workoutId));

  const [inserted] = await db.insert(workoutExercises).values({
    workoutId: data.workoutId,
    exerciseId: data.exerciseId,
    order: existingCount,
  }).returning({ id: workoutExercises.id });

  return { workoutExerciseId: inserted.id };
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Unauthorized");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}

export async function logSet(data: {
  workoutExerciseId: string;
  weight: number | null;
  reps: number | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, data.workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Unauthorized");

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, data.workoutExerciseId));

  await db.insert(sets).values({
    workoutExerciseId: data.workoutExerciseId,
    setNumber: existingCount + 1,
    weight: data.weight !== null ? String(data.weight) : null,
    reps: data.reps,
  });
}

export async function deleteSet(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      workoutExercise: {
        with: { workout: true },
      },
    },
  });
  if (!set || set.workoutExercise.workout.userId !== userId)
    throw new Error("Unauthorized");

  await db.delete(sets).where(eq(sets.id, setId));
}
