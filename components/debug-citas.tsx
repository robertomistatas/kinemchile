"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debugCitas, getCitasPorFecha } from "@/lib/firestore-service"
import { useAuth } from "@/context/auth-context"
import { Calendar } from "@/components/ui/calendar"

export function DebugCitas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [citas, setCitas] = useState<any[]>([])
  const [error, setError] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleDebugAll = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const result = await debugCitas()
      console.log("Todas las citas:", result)
      setCitas(result)
    } catch (error) {
      console.error("Error al depurar citas:", error)
      setError("Error al obtener información de citas")
    } finally {
      setLoading(false)
    }
  }

  const handleDebugByDate = async () => {
    if (!user || !date) return

    setLoading(true)
    setError("")

    try {
      const result = await getCitasPorFecha(date)
      console.log(`Citas para ${date.toLocaleDateString()}:`, result)
      setCitas(result)
    } catch (error) {
      console.error("Error al obtener citas por fecha:", error)
      setError("Error al obtener citas para la fecha seleccionada")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depuración de Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Button onClick={handleDebugAll} disabled={loading} className="w-full">
              {loading ? "Cargando..." : "Verificar todas las citas"}
            </Button>
          </div>
          <div className="space-y-2">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            <Button onClick={handleDebugByDate} disabled={loading || !date} className="w-full">
              {loading ? "Cargando..." : "Verificar citas por fecha"}
            </Button>
          </div>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {citas.length > 0 ? (
          <div className="mt-4">
            <p>Total de citas: {citas.length}</p>
            <div className="mt-4 space-y-4">
              {citas.map((cita) => (
                <div key={cita.id} className="border p-4 rounded-md">
                  <h3 className="font-bold">Cita ID: {cita.id}</h3>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {typeof cita.fecha === "number" ? new Date(cita.fecha).toLocaleString() : String(cita.fecha)}
                  </p>
                  <p>
                    <strong>Hora:</strong> {cita.hora}
                  </p>
                  <p>
                    <strong>Estado:</strong> {cita.estado}
                  </p>
                  <p>
                    <strong>Paciente ID:</strong> {cita.pacienteId}
                  </p>
                  {cita.paciente && (
                    <div className="mt-2">
                      <p>
                        <strong>Paciente:</strong> {cita.paciente.nombre} {cita.paciente.apellido}
                      </p>
                      <p>
                        <strong>RUT:</strong> {cita.paciente.rut}
                      </p>
                    </div>
                  )}
                  <p className="mt-2">
                    <strong>Motivo:</strong> {cita.motivo}
                  </p>
                  {cita.prevision && (
                    <p>
                      <strong>Previsión:</strong> {cita.prevision}
                    </p>
                  )}
                  {cita._debug && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p>
                        <strong>Debug:</strong>
                      </p>
                      <p>Fecha: {cita._debug.fechaInfo}</p>
                      <p>Paciente: {cita._debug.pacienteInfo}</p>
                      <p>Estado: {cita._debug.estado}</p>
                      <p>Hora: {cita._debug.hora}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4">No se encontraron citas.</p>
        )}
      </CardContent>
    </Card>
  )
}
