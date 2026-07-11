"use client"

import { useState } from "react"
import { Lock, Loader2, X } from "lucide-react"
import { verifyEditPassword } from "@/app/actions"

export function EditModeDialog({
  onClose,
  onUnlock,
}: {
  onClose: () => void
  onUnlock: () => void
}) {
  const [password, setPassword] = useState("")
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setChecking(true)
    try {
      const res = await verifyEditPassword(password)
      if (!res.configured) {
        setError("No se configuró la contraseña (EDIT_PASSWORD).")
        return
      }
      if (res.ok) {
        onUnlock()
      } else {
        setError("Contraseña incorrecta.")
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 w-full max-w-sm rounded-4xl bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="size-6" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <h2 className="font-heading text-xl font-bold text-foreground">
          Modo edición
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresa la contraseña para poder eliminar eventos.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {error && (
            <p className="text-sm font-semibold text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground active:scale-[0.98] disabled:opacity-60"
          >
            {checking ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Verificando...
              </>
            ) : (
              "Desbloquear"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
