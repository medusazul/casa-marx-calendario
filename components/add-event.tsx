"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { CALENDAR_YEAR } from "@/lib/date"
import { addEvent } from "@/lib/events"
import { isFirebaseConfigured } from "@/lib/firebase"

const MIN_DATE = `${CALENDAR_YEAR}-01-01`
const MAX_DATE = `${CALENDAR_YEAR}-12-31`

export function AddEvent({
  presetDate,
  onSaved,
}: {
  presetDate?: string
  onSaved: (dateKey: string) => void
}) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(presetDate ?? MIN_DATE)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [supplies, setSupplies] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isFirebaseConfigured) {
      setError("Firebase no está configurado. Agrega las credenciales para guardar eventos.")
      return
    }
    if (!title.trim() || !date || !startTime) {
      setError("Completa el título, la fecha y el horario de inicio.")
      return
    }

    setSaving(true)
    try {
      await addEvent({
        title: title.trim(),
        date,
        startTime,
        endTime: endTime || undefined,
        supplies: supplies.trim() || undefined,
      })
      setDone(true)
      setTimeout(() => {
        onSaved(date)
      }, 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el evento.")
      setSaving(false)
    }
  }

  const fieldClass =
    "min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
  const labelClass = "mb-1.5 block text-sm font-bold text-foreground"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
      <div>
        <label htmlFor="title" className={labelClass}>
          Título del evento
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Reunión de asamblea"
          className={fieldClass}
          maxLength={80}
        />
      </div>

      <div>
        <label htmlFor="date" className={labelClass}>
          Fecha
        </label>
        <input
          id="date"
          type="date"
          value={date}
          min={MIN_DATE}
          max={MAX_DATE}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className={labelClass}>
            Inicio
          </label>
          <input
            id="start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="end" className={labelClass}>
            Fin <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="supplies" className={labelClass}>
          Insumos <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="supplies"
          value={supplies}
          onChange={(e) => setSupplies(e.target.value)}
          placeholder="Ej: proyector, parlante..."
          rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || done}
        className="mt-1 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-70"
      >
        {done ? (
          <>
            <Check className="size-5" aria-hidden="true" />
            ¡Guardado!
          </>
        ) : saving ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Guardando...
          </>
        ) : (
          "Guardar evento"
        )}
      </button>
    </form>
  )
}
