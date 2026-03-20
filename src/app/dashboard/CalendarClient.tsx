"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { enUS } from "date-fns/locale";

export function CalendarClient({ selected }: { selected: Date }) {
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4 w-fit">
      <Calendar
        mode="single"
        locale={enUS}
        selected={selected}
        onSelect={handleSelect}
      />
    </div>
  );
}
