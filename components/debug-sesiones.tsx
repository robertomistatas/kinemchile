"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debugSesiones, getSesionesPaciente } from "@/lib/firestore-service"
import { useAuth } from "@/context/auth-context"

export function DebugSesiones({ pacienteId }: { pacienteId?: string }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sesiones, setSesiones] = useState<any[]>([])
  const [error, setError] = useState("")

  const handleDebug = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      let result
      if (pacienteId) {
        result = await getSesionesPaciente(pacienteId)
        console.log(`Sesiones del paciente ${pacienteId}:`, result)
      } else {
        result = await debugSesiones()
        console.log("Todas las sesiones:", result)
      }

      setSesiones(result)
    } catch (error) {
      console.error("Error al depurar sesiones:", error)
      setError("Error al obtener información de sesiones")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depuración de Sesiones</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDebug} disabled={loading}>
          {loading ? "Cargando..." : pacienteId ? "Verificar sesiones del paciente" : "Verificar todas las sesiones"}
        </Button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {sesiones.length > 0 && (
          <div className="mt-4">
            <p>Total de sesiones: {sesiones.length}</p>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(sesiones, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
