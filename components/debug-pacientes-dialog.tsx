"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPacientesActivos } from "@/lib/firestore-service"
import { useAuth } from "@/context/auth-context"

export function DebugPacientesDialog() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [error, setError] = useState("")

  const handleDebug = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      console.log("Depurando pacientes activos...")
      const result = await getPacientesActivos()
      console.log(`Se encontraron ${result.length} pacientes activos`)

      if (result.length > 0) {
        console.log("Primer paciente:", {
          id: result[0].id,
          nombre: result[0].nombre,
          apellido: result[0].apellido,
          rut: result[0].rut,
        })
      }

      setPacientes(result)
    } catch (error) {
      console.error("Error al depurar pacientes:", error)
      setError("Error al obtener información de pacientes")
    } finally {
      setLoading(false)
    }
  }

  // Ejecutar automáticamente al montar el componente
  useEffect(() => {
    if (user) {
      handleDebug()
    }
  }, [user])

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Depuración de Pacientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDebug} disabled={loading} size="sm">
          {loading ? "Cargando..." : "Verificar pacientes activos"}
        </Button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {pacientes.length > 0 ? (
          <div className="mt-4">
            <p>Total de pacientes activos: {pacientes.length}</p>
            <div className="mt-4 overflow-auto max-h-40 border rounded p-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-1 text-left">ID</th>
                    <th className="p-1 text-left">Nombre</th>
                    <th className="p-1 text-left">Apellido</th>
                    <th className="p-1 text-left">RUT</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.slice(0, 10).map((paciente) => (
                    <tr key={paciente.id} className="border-b">
                      <td className="p-1">{paciente.id.substring(0, 8)}...</td>
                      <td className="p-1">{paciente.nombre}</td>
                      <td className="p-1">{paciente.apellido}</td>
                      <td className="p-1">{paciente.rut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-4">No se encontraron pacientes activos.</p>
        )}
      </CardContent>
    </Card>
  )
}
