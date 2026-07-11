"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, LockOpen, TriangleAlert, Upload } from "lucide-react"
import { BottomNav, type Tab } from "@/components/bottom-nav"
import { MonthView } from "@/components/month-view"
import { DayDetail } from "@/components/day-detail"
import { AddEvent } from "@/components/add-event"
import { SearchView } from "@/components/search-view"
import { EditModeDialog } from "@/components/edit-mode-dialog"
import { ImportEvents } from "@/components/import-events"
import { subscribeToEvents, deleteEvent, type CalendarEvent } from "@/lib/events"
import { isFirebaseConfigured } from "@/lib/firebase"
import { parseKey, todayKey } from "@/lib/date"

export default function Page() {
  const [tab, setTab] = useState<Tab>("calendar")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const initialMonth = (() => {
    const t = parseKey(todayKey())
    return t.getFullYear() === 2026 ? t.getMonth() : 0
  })()
  const [month, setMonth] = useState(initialMonth)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined)
  const [editMode, setEditMode] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    const unsub = subscribeToEvents(setEvents)
    return () => unsub()
  }, [])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return map
  }, [events])

  function handleAddForDay(dateKey: string) {
    setPresetDate(dateKey)
    setSelectedDay(null)
    setTab("add")
  }

  function handleSaved(dateKey: string) {
    setPresetDate(undefined)
    setTab("calendar")
    const d = parseKey(dateKey)
    if (d.getFullYear() === 2026) setMonth(d.getMonth())
    setSelectedDay(dateKey)
  }

  function toggleEditMode() {
    if (editMode) {
      setEditMode(false)
    } else {
      setShowEditDialog(true)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 px-4 pb-2 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-CM.png"
              alt="Logo de Casa Marx"
              className="size-10 rounded-2xl object-cover"
            />
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
                Casa Marx
              </h1>
              <p className="text-xs font-medium text-muted-foreground">
                Calendario compartido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleEditMode}
            className={`flex min-h-11 items-center gap-1.5 rounded-2xl px-3 text-sm font-bold transition active:scale-95 ${
              editMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            aria-pressed={editMode}
          >
            {editMode ? (
              <LockOpen className="size-4" aria-hidden="true" />
            ) : (
              <Lock className="size-4" aria-hidden="true" />
            )}
            {editMode ? "Edición" : "Editar"}
          </button>
        </div>
      </header>

      {!isFirebaseConfigured && (
        <div className="mx-4 mb-2 flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 p-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Firebase aún no está configurado. Agrega las credenciales para
            guardar y ver eventos en tiempo real.
          </p>
        </div>
      )}

      {editMode && (
        <div className="mx-4 mb-2 space-y-2">
          <div className="rounded-2xl bg-accent px-3 py-2 text-center text-sm font-bold text-accent-foreground">
            Modo edición activo · toca un día para eliminar eventos
          </div>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 text-sm font-bold text-primary transition active:scale-[0.98]"
          >
            <Upload className="size-4" aria-hidden="true" />
            Importar lista de eventos
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 pb-28">
        {tab === "calendar" && (
          <MonthView
            month={month}
            onMonthChange={setMonth}
            eventsByDate={eventsByDate}
            onSelectDay={setSelectedDay}
          />
        )}
        {tab === "add" && (
          <>
            <h2 className="px-4 pb-3 pt-1 font-heading text-xl font-bold text-foreground">
              Nuevo evento
            </h2>
            <AddEvent
              key={presetDate ?? "new"}
              presetDate={presetDate}
              onSaved={handleSaved}
            />
          </>
        )}
        {tab === "search" && (
          <>
            <h2 className="px-4 pb-2 pt-1 font-heading text-xl font-bold text-foreground">
              Buscar eventos
            </h2>
            <SearchView events={events} onSelectDay={setSelectedDay} />
          </>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={(t) => {
          if (t === "add") setPresetDate(undefined)
          setTab(t)
        }}
      />

      {selectedDay && (
        <DayDetail
          dateKey={selectedDay}
          events={eventsByDate.get(selectedDay) ?? []}
          editMode={editMode}
          onClose={() => setSelectedDay(null)}
          onAddForDay={handleAddForDay}
          onDelete={deleteEvent}
        />
      )}

      {showEditDialog && (
        <EditModeDialog
          onClose={() => setShowEditDialog(false)}
          onUnlock={() => {
            setEditMode(true)
            setShowEditDialog(false)
          }}
        />
      )}

      {showImport && (
        <ImportEvents
          onClose={() => setShowImport(false)}
          onDone={() => {
            setShowImport(false)
            setTab("calendar")
          }}
        />
      )}
    </div>
  )
}
