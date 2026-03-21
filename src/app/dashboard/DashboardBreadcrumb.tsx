"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function getSegmentLabel(segment: string): string {
  if (segment === "new") return "Create Workout"
  if (segment === "workout") return null as unknown as string
  return "Edit Workout"
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs: { label: string; href: string }[] = []

  crumbs.push({ label: "Dashboard", href: "/dashboard" })

  if (segments.length > 1) {
    let label: string | null = null
    const last = segments[segments.length - 1]

    if (last === "new") {
      label = "Create Workout"
    } else if (segments.includes("workout") && last !== "workout") {
      label = "Edit Workout"
    }

    if (label) {
      crumbs.push({ label, href: pathname })
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
