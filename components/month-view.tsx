"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CALENDAR_YEAR,
  MONTHS_ES,
  WEEKDAYS_ES,
  dateKey,
  daysInMonth,
  firstWeekdayMondayBased,
  todayKey,
} from "@/lib/date"
import type { CalendarEvent } from "@/lib/events"

export function MonthView({
  month,
  onMonthChange,
  eventsByDate,
  onSelectDay,
}: {
  month: number
  onMonthChange: (month: number) => void
  eventsByDate: Map<string, CalendarEvent[]>
  onSelectDay: (dateKey: string) => void
}) {
  const total = daysInMonth(CALENDAR_YEAR, month)
  const offset = firstWeekdayMondayBased(CALENDAR_YEAR, month)
  const today = todayKey()

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]

  return (
    <div className="px-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={() => onMonthChange(Math.max(0, month - 1))}
          disabled={month === 0}
          className="flex size-12 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm transition active:scale-95 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {MONTHS_ES[month]}
          </h2>
          <p className="text-sm font-semibold text-primary">{CALENDAR_YEAR}</p>
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(Math.min(11, month + 1))}
          disabled={month === 11}
          className="flex size-12 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm transition active:scale-95 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-6" aria-hidden="true" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {WEEKDAYS_ES.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const key = dateKey(CALENDAR_YEAR, month, day)
          const dayEvents = eventsByDate.get(key) ?? []
          const hasEvents = dayEvents.length > 0
          const isToday = key === today

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-base font-semibold transition active:scale-95",
                hasEvents
                  ? "bg-primary/10 text-foreground"
                  : "bg-card text-foreground/70",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              )}
              aria-label={`Día ${day}${hasEvents ? `, ${dayEvents.length} evento(s)` : ""}`}
            >
              <span>{day}</span>
              {hasEvents && (
                <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="size-1.5 rounded-full bg-primary" />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
