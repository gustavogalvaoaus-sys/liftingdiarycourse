import { DashboardBreadcrumb } from "./DashboardBreadcrumb"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-12 py-3">
        <DashboardBreadcrumb />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
