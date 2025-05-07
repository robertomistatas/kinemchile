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

        {sesiones.length > 0 ? (
          <div className="mt-4">
            <p>Total de sesiones: {sesiones.length}</p>
            <div className="mt-4 space-y-4">
              {sesiones.map((sesion) => (
                <div key={sesion.id} className="border p-4 rounded-md">
                  <h3 className="font-bold">Sesión ID: {sesion.id}</h3>
                  <p>
                    <strong>Tipo:</strong> {sesion.tipo}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {typeof sesion.fecha === "number" ? new Date(sesion.fecha).toLocaleString() : String(sesion.fecha)}
                  </p>
                  <p>
                    <strong>Paciente ID:</strong> {sesion.pacienteId}
                  </p>
                  {sesion.paciente && (
                    <div className="mt-2">
                      <p>
                        <strong>Paciente:</strong> {sesion.paciente.nombre} {sesion.paciente.apellido}
                      </p>
                      <p>
                        <strong>RUT:</strong> {sesion.paciente.rut}
                      </p>
                    </div>
                  )}
                  <p className="mt-2">
                    <strong>Notas:</strong> {sesion.notas}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4">No se encontraron sesiones.</p>
        )}
      </CardContent>
    </Card>
  )
}
