"use client"

import { useMemo, useState } from "react"
import { Search, Clock, Package, X } from "lucide-react"
import { formatLongDate } from "@/lib/date"
import type { CalendarEvent } from "@/lib/events"

export function SearchView({
  events,
  onSelectDay,
}: {
  events: CalendarEvent[]
  onSelectDay: (dateKey: string) => void
}) {
  const [term, setTerm] = useState("")

  const results = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return events
    return events.filter((e) => {
      const haystack = [
        e.title,
        e.supplies ?? "",
        e.createdBy ?? "",
        formatLongDate(e.date),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [events, term])

  return (
    <div className="px-4">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 pt-1 backdrop-blur">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por título, insumo o fecha..."
            className="min-h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-11 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            aria-label="Buscar eventos"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p className="mb-3 mt-1 text-sm font-semibold text-muted-foreground">
        {results.length} evento{results.length === 1 ? "" : "s"}
        {term ? " encontrados" : " en total"}
      </p>

      {results.length === 0 ? (
        <div className="rounded-3xl bg-muted/60 px-4 py-12 text-center">
          <Search className="mx-auto mb-3 size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">
            No se encontraron eventos.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 pb-4">
          {results.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelectDay(event.date)}
                className="w-full rounded-3xl border border-border bg-card p-4 text-left active:scale-[0.99]"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {formatLongDate(event.date)}
                </p>
                <h3 className="mt-1 font-heading font-bold text-foreground text-pretty">
                  {event.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" aria-hidden="true" />
                    {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ""}
                  </span>
                  {event.supplies && (
                    <span className="flex items-center gap-1.5">
                      <Package className="size-4" aria-hidden="true" />
                      {event.supplies}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
