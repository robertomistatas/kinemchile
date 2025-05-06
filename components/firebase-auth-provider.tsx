"use client"

import { AuthProvider } from "@/context/auth-context"
import { useEffect, useState, type ReactNode } from "react"

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <AuthProvider>{children}</AuthProvider>
}
