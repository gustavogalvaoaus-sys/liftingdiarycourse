import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, id), eq(workouts.userId, userId)),
  });
}

export async function updateWorkout(
  id: string,
  data: { name: string; startedAt: Date }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
}

export async function createWorkout(data: { name: string; startedAt: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.insert(workouts).values({ ...data, userId });
}

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, start),
      lt(workouts.startedAt, end)
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
        },
        orderBy: (we, { asc }) => [asc(we.order)],
      },
    },
  });
}
