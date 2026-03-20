import { NewWorkoutForm } from "./NewWorkoutForm";

export default function NewWorkoutPage() {
  return (
    <div className="flex flex-col gap-8 px-12 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Create New Workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
