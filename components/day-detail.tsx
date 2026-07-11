"use client"

import { useState } from "react"
import { Clock, Package, Plus, Trash2, X, CalendarPlus } from "lucide-react"
import { formatLongDate } from "@/lib/date"
import type { CalendarEvent } from "@/lib/events"

export function DayDetail({
  dateKey,
  events,
  editMode,
  onClose,
  onAddForDay,
  onDelete,
}: {
  dateKey: string
  events: CalendarEvent[]
  editMode: boolean
  onClose: () => void
  onAddForDay: (dateKey: string) => void
  onDelete: (id: string) => Promise<void>
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

 async function handleDelete(id: string) {
  const editKey = prompt("Ingresa la clave de edición:")
  if (!editKey) return
  
  setDeletingId(id)
  try {
    await onDelete(id, editKey)
  } catch (error) {
    alert(error instanceof Error ? error.message : "Error al borrar el evento")
  } finally {
    setDeletingId(null)
  }
}

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 max-h-[80vh] overflow-y-auto rounded-t-4xl bg-background p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-heading text-lg font-bold capitalize leading-snug text-foreground text-balance">
            {formatLongDate(dateKey)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="rounded-3xl bg-muted/60 px-4 py-10 text-center">
            <CalendarPlus className="mx-auto mb-3 size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">
              No hay eventos para este día.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-3xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-foreground text-pretty">
                      {event.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <Clock className="size-4" aria-hidden="true" />
                      <span>
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ""}
                      </span>
                    </div>
                    {event.supplies && (
                      <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Package className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span className="text-pretty">{event.supplies}</span>
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive active:scale-95 disabled:opacity-50"
                      aria-label={`Eliminar ${event.title}`}
                    >
                      <Trash2 className="size-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => onAddForDay(dateKey)}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground active:scale-[0.98]"
        >
          <Plus className="size-5" aria-hidden="true" />
          Agregar evento este día
        </button>
      </div>
    </div>
  )
}
