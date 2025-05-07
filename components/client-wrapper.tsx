"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"

// Importar el AuthProvider de forma dinámica para que solo se cargue en el cliente
const AuthProvider = dynamic(() => import("@/components/auth-provider"), {
  ssr: false,
})

export function ClientWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
