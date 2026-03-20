"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

type State = { error?: string } | null;

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  workout: {
    id: string;
    name: string;
    startedAt: Date;
  };
};

export function EditWorkoutForm({ workout }: Props) {
  const router = useRouter();

  async function formAction(_prevState: State, formData: FormData): Promise<State> {
    const name = formData.get("name") as string;
    const startedAt = formData.get("startedAt") as string;

    try {
      await updateWorkoutAction({
        id: workout.id,
        name,
        startedAt: new Date(startedAt),
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Something went wrong" };
    }

    router.push("/dashboard");
    return null;
  }

  const [state, action, pending] = useActionState(formAction, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={workout.name}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startedAt">Start Time</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="datetime-local"
          defaultValue={toLocalDatetimeString(workout.startedAt)}
          required
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
