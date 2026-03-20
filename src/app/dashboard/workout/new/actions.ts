"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.coerce.date().refine((date) => date >= new Date(), {
    message: "Start time cannot be in the past",
  }),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: Date;
}) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
}
