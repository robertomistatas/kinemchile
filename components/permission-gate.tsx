"use client"

import { useAuth } from "@/context/auth-context"
import type { ReactNode } from "react"

interface PermissionGateProps {
  permiso: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permiso, children, fallback = null }: PermissionGateProps) {
  const { userPermisos, loading } = useAuth()

  // Si está cargando, no mostrar nada
  if (loading) return null

  // Verificar si el usuario tiene el permiso requerido
  const tienePermiso = Array.isArray(permiso)
    ? permiso.some((p) => userPermisos.includes(p))
    : userPermisos.includes(permiso)

  // Renderizar el contenido o el fallback según corresponda
  return tienePermiso ? <>{children}</> : <>{fallback}</>
}
