"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function PrestacionesRedirectPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/pacientes")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return null
}
