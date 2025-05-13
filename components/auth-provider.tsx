"use client"
import type { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  console.warn("Usando el AuthProvider obsoleto. Por favor, actualiza a FirebaseAuthProvider.")
  return <>{children}</>
}

export function useAuth() {
  console.warn("Usando el hook useAuth obsoleto. Por favor, actualiza a importar desde context/auth-context.")
  // Redirigir al nuevo hook
  return require("@/context/auth-context").useAuth()
}

// Exportación por defecto para dynamic import
export default AuthProvider
