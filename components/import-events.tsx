"use client"

import { useMemo, useState } from "react"
import { X, Upload, CircleCheck, TriangleAlert, Loader2 } from "lucide-react"
import { parseBulkEvents } from "@/lib/parse-events"
import { addEventsBatch } from "@/lib/events"
import { formatLongDate } from "@/lib/date"

const EXAMPLE = `1/7/2026\t7:30\t10:30\tCalistenia\tParlante
1/7/2026\t17:30\t\tJubiladxs\t`

export function ImportEvents({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const result = useMemo(() => (text.trim() ? parseBulkEvents(text) : null), [text])

  async function handleImport() {
    if (!result || result.valid.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await addEventsBatch(result.valid)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo importar.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Upload className="size-4" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Importar eventos</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
          aria-label="Cerrar"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Copia las filas desde Google Sheets o Excel y pégalas aquí. Columnas:{" "}
          <span className="font-semibold text-foreground">
            Fecha · Hora Inicio · Hora Fin · Actividad · Insumos
          </span>
          . La fila de encabezado y las vacías se ignoran automáticamente.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          rows={8}
          className="w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Pegar eventos"
        />

        {result && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                <CircleCheck className="size-4" aria-hidden="true" />
                {result.valid.length} listos para importar
              </span>
              {result.errors.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-bold text-destructive">
                  <TriangleAlert className="size-4" aria-hidden="true" />
                  {result.errors.length} con problemas
                </span>
              )}
            </div>

            {/* Valid preview */}
            {result.valid.length > 0 && (
              <ul className="space-y-1.5">
                {result.valid.slice(0, 60).map((ev, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-foreground">{ev.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatLongDate(ev.date).replace(` ${new Date().getFullYear()}`, "")} ·{" "}
                      {ev.startTime}
                      {ev.endTime ? `–${ev.endTime}` : ""}
                    </span>
                  </li>
                ))}
                {result.valid.length > 60 && (
                  <li className="px-3 py-1 text-center text-xs text-muted-foreground">
                    y {result.valid.length - 60} más…
                  </li>
                )}
              </ul>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-1.5 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-bold text-destructive">Filas omitidas:</p>
                <ul className="space-y-1">
                  {result.errors.map((er) => (
                    <li key={er.line} className="text-xs text-foreground">
                      <span className="font-semibold">Línea {er.line}:</span> {er.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Footer action */}
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={handleImport}
          disabled={!result || result.valid.length === 0 || saving}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Importando…
            </>
          ) : (
            <>
              <Upload className="size-5" aria-hidden="true" />
              Importar {result?.valid.length ? `${result.valid.length} eventos` : "eventos"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
