"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"

interface PermissionGateProps {
  permission: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { userPermisos, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!loading && userPermisos) {
      const requiredPermissions = Array.isArray(permission) ? permission : [permission]
      const hasAllPermissions = requiredPermissions.every((perm) => userPermisos.includes(perm))
      setHasPermission(hasAllPermissions)
    }
  }, [permission, userPermisos, loading])

  if (loading) return null

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

// Hook para verificar permisos en componentes funcionales
export function useHasPermission(permission: string | string[]): boolean {
  const { userPermisos, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!loading && userPermisos) {
      const requiredPermissions = Array.isArray(permission) ? permission : [permission]
      const hasAllPermissions = requiredPermissions.every((perm) => userPermisos.includes(perm))
      setHasPermission(hasAllPermissions)
    }
  }, [permission, userPermisos, loading])

  return hasPermission
}
