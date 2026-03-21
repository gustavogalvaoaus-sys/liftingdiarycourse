"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

type State = { error?: string } | null;

// Format a Date as "YYYY-MM-DDTHH:mm" in local time for datetime-local input
function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NewWorkoutForm() {
  const router = useRouter();
  const defaultStartedAt = toLocalDatetimeString(new Date());

  async function formAction(_prevState: State, formData: FormData): Promise<State> {
    const name = formData.get("name") as string;
    const startedAt = formData.get("startedAt") as string;

    // new Date(startedAt) parses the local datetime string as local time, giving us the correct UTC Date
    const startedAtDate = new Date(startedAt);
    if (startedAtDate < new Date()) {
      return { error: "Start time cannot be in the past" };
    }

    try {
      await createWorkoutAction({ name, startedAt: startedAtDate });
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
          placeholder="Enter workout name"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startedAt">Start Time</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="datetime-local"
          defaultValue={defaultStartedAt}
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
          {pending ? "Creating..." : "Create Workout"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
