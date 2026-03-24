import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import {
  getAllExercises,
  getWorkoutWithExercisesAndSets,
} from "@/data/exercises";
import { EditWorkoutForm, EditWorkoutActions } from "./EditWorkoutForm";
import { ExerciseList } from "./ExerciseList";
import { AddExerciseForm } from "./AddExerciseForm";
import { getWorkoutStatus, WorkoutStatus } from "@/lib/workout";

type Props = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function EditWorkoutPage({ params, searchParams }: Props) {
  const { workoutId } = await params;
  const { date: dateParam } = await searchParams;

  const [workout, workoutWithExercises, allExercises] = await Promise.all([
    getWorkoutById(workoutId),
    getWorkoutWithExercisesAndSets(workoutId),
    getAllExercises(),
  ]);

  if (!workout || !workoutWithExercises) notFound();

  const status = getWorkoutStatus(workout.startedAt, workout.completedAt);
  const isCompleted = status === WorkoutStatus.Completed;
  const isSkipped = status === WorkoutStatus.Skipped;
  const isInProgress = status === WorkoutStatus.InProgress;
  const isScheduled = status === WorkoutStatus.Scheduled;

  return (
    <div className="flex flex-col gap-8 px-12 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold">{workout.name}</h1>
      <EditWorkoutForm workout={workout} isCompleted={isCompleted || isSkipped} dateParam={dateParam} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Exercises</h2>
          {!isCompleted && !isSkipped && (
            <AddExerciseForm
              workoutId={workoutId}
              availableExercises={allExercises}
            />
          )}
        </div>
        <ExerciseList
          workoutExercises={workoutWithExercises.workoutExercises}
          isCompleted={isCompleted || isSkipped}
        />
      </section>

      <EditWorkoutActions isCompleted={isCompleted} isSkipped={isSkipped} isInProgress={isInProgress} isScheduled={isScheduled} workoutId={workoutId} workoutName={workout.name} dateParam={dateParam} />
    </div>
  );
}
