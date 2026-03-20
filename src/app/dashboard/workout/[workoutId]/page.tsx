import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) notFound();

  return (
    <div className="flex flex-col gap-8 px-12 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
