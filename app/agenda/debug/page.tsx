"use client"

import { Layout } from "@/components/layout"
import { DebugCitas } from "@/components/debug-citas"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DebugCitasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Depuración de Citas</h1>
          <Button asChild variant="outline">
            <Link href="/agenda">Volver a Agenda</Link>
          </Button>
        </div>

        <DebugCitas />
      </div>
    </Layout>
  )
}
