import type { CalendarEvent } from "./events"
import { CALENDAR_YEAR } from "./date"

export type ParseResult = {
  valid: Omit<CalendarEvent, "id">[]
  errors: { line: number; text: string; reason: string }[]
}

/** Normalize a time like "7:30" -> "07:30". Returns "" if empty/invalid. */
function normalizeTime(raw: string): string | null {
  const t = raw.trim()
  if (!t) return ""
  const m = t.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
}

/** Parse a date "D/M/YYYY" -> "YYYY-MM-DD". Returns null if invalid. */
function parseDate(raw: string): string | null {
  const t = raw.trim()
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  if (month < 1 || month > 12) return null
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/**
 * Parse tab (or multi-space) separated rows pasted from Google Sheets / Excel.
 * Expected columns: Fecha | Hora Inicio | Hora Fin | Actividad | Insumos
 * A header row (starting with "Fecha") is ignored, as are empty rows.
 */
export function parseBulkEvents(text: string): ParseResult {
  const valid: Omit<CalendarEvent, "id">[] = []
  const errors: ParseResult["errors"] = []
  const lines = text.split(/\r?\n/)

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd()
    const lineNo = idx + 1
    // Split on tabs; fall back to 2+ spaces if no tabs present.
    const cols = (line.includes("\t") ? line.split("\t") : line.split(/ {2,}/)).map((c) =>
      c.trim(),
    )

    // Skip fully empty rows.
    if (cols.every((c) => c === "")) return
    // Skip header row.
    if (cols[0]?.toLowerCase() === "fecha") return

    const [dateRaw = "", startRaw = "", endRaw = "", titleRaw = "", suppliesRaw = ""] = cols

    if (!dateRaw && !titleRaw) return

    const date = parseDate(dateRaw)
    if (!date) {
      errors.push({ line: lineNo, text: line, reason: `Fecha inválida: "${dateRaw}"` })
      return
    }
    if (Number(date.slice(0, 4)) !== CALENDAR_YEAR) {
      errors.push({
        line: lineNo,
        text: line,
        reason: `El año no es ${CALENDAR_YEAR} (fecha "${dateRaw}")`,
      })
      return
    }

    const title = titleRaw.trim()
    if (!title) {
      errors.push({ line: lineNo, text: line, reason: "Falta la actividad / título" })
      return
    }

    const startTime = normalizeTime(startRaw)
    if (startTime === null) {
      errors.push({ line: lineNo, text: line, reason: `Hora de inicio inválida: "${startRaw}"` })
      return
    }

    const endTime = normalizeTime(endRaw)
    if (endTime === null) {
      errors.push({ line: lineNo, text: line, reason: `Hora de fin inválida: "${endRaw}"` })
      return
    }

    const supplies = suppliesRaw.trim()

    valid.push({
      date,
      title,
      startTime: startTime || "00:00",
      endTime: endTime || undefined,
      supplies: supplies || undefined,
    })
  })

  return { valid, errors }
}
