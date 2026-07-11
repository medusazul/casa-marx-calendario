"use client"

import { CalendarDays, PlusCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export type Tab = "calendar" | "add" | "search"

const items: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "calendar", label: "Calendario", icon: CalendarDays },
  { id: "add", label: "Agregar", icon: PlusCircle },
  { id: "search", label: "Buscar", icon: Search },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:bg-muted",
              )}
            >
              <Icon
                className={cn("size-6", isActive && "fill-primary/15")}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className={cn("text-xs", isActive ? "font-bold" : "font-medium")}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
