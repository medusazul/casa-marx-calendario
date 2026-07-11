export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

// Week starts on Monday
export const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export const CALENDAR_YEAR = 2026

/** Build a YYYY-MM-DD key from parts (no timezone drift). */
export function dateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

/** Parse a YYYY-MM-DD key into a local Date. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Weekday index with Monday = 0 ... Sunday = 6 */
export function firstWeekdayMondayBased(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay() // 0 = Sun
  return (jsDay + 6) % 7
}

export function formatLongDate(key: string): string {
  const d = parseKey(key)
  const weekday = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d.getDay()]
  return `${weekday} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

export function todayKey(): string {
  const now = new Date()
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate())
}
