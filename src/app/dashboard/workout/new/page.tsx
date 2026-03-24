import { NewWorkoutForm } from "./NewWorkoutForm";
import { getAllExercises } from "@/data/exercises";

export default async function NewWorkoutPage() {
  const availableExercises = await getAllExercises();

  return (
    <div className="flex flex-col gap-8 px-12 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Create Workout</h1>
      <NewWorkoutForm availableExercises={availableExercises} />
    </div>
  );
}
