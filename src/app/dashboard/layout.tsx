import Link from "next/link";
import { LayoutDashboard, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <nav className="w-56 shrink-0 border-r flex flex-col gap-1 p-3">
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2">
          <Link href="/dashboard">
            <LayoutDashboard />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2">
          <Link href="/dashboard/workout/new">
            <Dumbbell />
            New Workout
          </Link>
        </Button>
      </nav>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
