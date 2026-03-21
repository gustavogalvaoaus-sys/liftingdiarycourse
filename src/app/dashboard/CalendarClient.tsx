"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { enUS } from "date-fns/locale";
import { format } from "date-fns";

export function CalendarClient({ selectedDateStr }: { selectedDateStr: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [y, m, d] = selectedDateStr.split("-").map(Number);
  const selected = new Date(y, m - 1, d);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setOpen(false);
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(selected, "PPP")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={enUS}
          selected={selected}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
