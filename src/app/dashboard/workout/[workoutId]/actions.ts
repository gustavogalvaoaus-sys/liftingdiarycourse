"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  id: z.string().uuid(),
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
