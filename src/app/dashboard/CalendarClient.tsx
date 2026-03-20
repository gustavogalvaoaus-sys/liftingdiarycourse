"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { enUS } from "date-fns/locale";

export function CalendarClient({ selectedDateStr }: { selectedDateStr: string }) {
  const router = useRouter();
  const [y, m, d] = selectedDateStr.split("-").map(Number);
  const selected = new Date(y, m - 1, d);

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
