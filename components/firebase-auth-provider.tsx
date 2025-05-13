"use client"

import { AuthProvider } from "@/context/auth-context"
import { useEffect, useState, type ReactNode } from "react"
import { initFirebase } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Inicializar Firebase y configurar el listener de autenticación
    const { auth } = initFirebase()

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      },
      (authError) => {
        console.error("Error de autenticación:", authError)
        setError("Error al verificar la autenticación")
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [])

  if (!mounted) {
    return null
  }

  // Pasar el estado de autenticación al AuthProvider
  return (
    <AuthProvider user={user} loading={loading} error={error}>
      {children}
    </AuthProvider>
  )
}
