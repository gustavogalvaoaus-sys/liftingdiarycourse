export enum WorkoutStatus {
  Scheduled = "Scheduled",
  InProgress = "In progress",
  Completed = "Completed",
}

export function getWorkoutStatus(
  startedAt: Date,
  completedAt: Date | null
): WorkoutStatus {
  if (completedAt) return WorkoutStatus.Completed;
  if (startedAt > new Date()) return WorkoutStatus.Scheduled;
  return WorkoutStatus.InProgress;
}
