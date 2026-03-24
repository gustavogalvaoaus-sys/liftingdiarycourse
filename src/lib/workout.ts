export enum WorkoutStatus {
  Scheduled = "Scheduled",
  InProgress = "In progress",
  Completed = "Completed",
  Skipped = "Skipped",
}

export function getWorkoutStatus(
  startedAt: Date,
  completedAt: Date | null
): WorkoutStatus {
  if (completedAt) return WorkoutStatus.Completed;
  if (startedAt > new Date()) return WorkoutStatus.Scheduled;

  const now = new Date();
  const isToday =
    startedAt.getFullYear() === now.getFullYear() &&
    startedAt.getMonth() === now.getMonth() &&
    startedAt.getDate() === now.getDate();

  if (!isToday) return WorkoutStatus.Skipped;
  return WorkoutStatus.InProgress;
}
