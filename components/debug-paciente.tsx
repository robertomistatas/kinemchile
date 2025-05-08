"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPaciente } from "@/lib/firestore-service"
import { useAuth } from "@/context/auth-context"

export function DebugPaciente({ pacienteId }: { pacienteId: string }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [pacienteData, setPacienteData] = useState<any>(null)
  const [error, setError] = useState("")

  const handleDebug = async () => {
    if (!user) return

    setLoading(true)
    setError("")
    setPacienteData(null)

    try {
      console.log(`Depurando paciente con ID: ${pacienteId}`)
      const paciente = await getPaciente(pacienteId)

      if (paciente) {
        console.log("Paciente encontrado:", paciente)
        setPacienteData(paciente)
      } else {
        console.log("Paciente no encontrado")
        setError(`No se encontró el paciente con ID: ${pacienteId}`)
      }
    } catch (error) {
      console.error("Error al depurar paciente:", error)
      setError(`Error al obtener información del paciente: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depuración de Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDebug} disabled={loading}>
          {loading ? "Cargando..." : "Verificar paciente"}
        </Button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {pacienteData && (
          <div className="mt-4">
            <h3 className="font-bold">Información del paciente:</h3>
            <div className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
              <pre>{JSON.stringify(pacienteData, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
