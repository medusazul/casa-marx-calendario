import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"

export type CalendarEvent = {
  id: string
  /** ISO date string: YYYY-MM-DD */
  date: string
  title: string
  startTime: string
  endTime?: string
  supplies?: string
  createdBy?: string
}

const COLLECTION = "events"

/**
 * Subscribe to all events in real time.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(
  onData: (events: CalendarEvent[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    onData([])
    return () => {}
  }

  const q = query(collection(db, COLLECTION), orderBy("date", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const events: CalendarEvent[] = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          date: data.date,
          title: data.title,
          startTime: data.startTime,
          endTime: data.endTime || undefined,
          supplies: data.supplies || undefined,
          createdBy: data.createdBy || undefined,
        }
      })
      onData(events)
    },
    (error) => {
      console.log("[v0] subscribeToEvents error:", error.message)
      onError?.(error)
    },
  )
}

export async function addEvent(
  event: Omit<CalendarEvent, "id">,
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase no está configurado.")
  }
  await addDoc(collection(db, COLLECTION), {
    ...event,
    createdAt: serverTimestamp(),
  })
}

/**
 * Add many events at once. Firestore batches are limited to 500 writes,
 * so we chunk the list to stay safe.
 */
export async function addEventsBatch(
  events: Omit<CalendarEvent, "id">[],
): Promise<number> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase no está configurado.")
  }
  const CHUNK = 400
  let saved = 0
  for (let i = 0; i < events.length; i += CHUNK) {
    const batch = writeBatch(db)
    const chunk = events.slice(i, i + CHUNK)
    for (const event of chunk) {
      const ref = doc(collection(db, COLLECTION))
      batch.set(ref, { ...event, createdAt: serverTimestamp() })
    }
    await batch.commit()
    saved += chunk.length
  }
  return saved
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase no está configurado.")
  }
  await deleteDoc(doc(db, COLLECTION, id))
}
