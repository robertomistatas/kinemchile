"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientes } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import { PacienteCombobox } from "@/components/paciente-combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Search } from "lucide-react"

export default function BusquedaAgendaTestPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedPacienteId, setSelectedPacienteId] = useState("")
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [testResults, setTestResults] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const [manualSearch, setManualSearch] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPacientes() {
      try {
        setDataLoading(true)
        const data = await getPacientes()
        console.log("Pacientes cargados:", data.length)

        // Verificar estructura de datos
        if (data.length > 0) {
          console.log("Ejemplo de paciente:", {
            id: data[0].id,
            nombre: data[0].nombre,
            apellido: data[0].apellido,
            rut: data[0].rut,
            telefono: data[0].telefono,
            email: data[0].email,
            prevision: data[0].prevision,
          })
        }

        setPacientes(data)
      } catch (error) {
        console.error("Error al cargar pacientes:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchPacientes()
    }
  }, [user])

  useEffect(() => {
    if (selectedPacienteId) {
      const paciente = pacientes.find((p) => p.id === selectedPacienteId)
      setSelectedPaciente(paciente || null)
    } else {
      setSelectedPaciente(null)
    }
  }, [selectedPacienteId, pacientes])

  const handleManualSearch = () => {
    if (!manualSearch.trim()) {
      setTestResults({
        success: false,
        message: "Ingresa un término de búsqueda",
      })
      return
    }

    const searchTerm = manualSearch.toLowerCase().trim()

    // Buscar coincidencias
    const matchingPacientes = pacientes.filter((paciente) => {
      const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase()
      const rutLimpio = paciente.rut.replace(/\./g, "").replace(/-/g, "").toLowerCase()
      const telefono = (paciente.telefono || "").toLowerCase()
      const email = (paciente.email || "").toLowerCase()

      return (
        nombreCompleto.includes(searchTerm) ||
        rutLimpio.includes(searchTerm) ||
        telefono.includes(searchTerm) ||
        email.includes(searchTerm)
      )
    })

    if (matchingPacientes.length > 0) {
      setTestResults({
        success: true,
        message: `Se encontraron ${matchingPacientes.length} pacientes que coinciden con "${manualSearch}"`,
        details: matchingPacientes
          .slice(0, 5)
          .map((p) => `${p.nombre} ${p.apellido} (${p.rut})`)
          .join(", "),
      })
    } else {
      setTestResults({
        success: false,
        message: `No se encontraron pacientes que coincidan con "${manualSearch}"`,
      })
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prueba de Búsqueda en Agenda</h1>
            <p className="text-sm text-muted-foreground">
              Verifica que la búsqueda de pacientes funcione correctamente en la agenda
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/agenda")}>
            Volver a Agenda
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda con Combobox</CardTitle>
              <CardDescription>Prueba la búsqueda usando el componente PacienteCombobox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar paciente</Label>
                <PacienteCombobox
                  pacientes={pacientes}
                  selectedPacienteId={selectedPacienteId}
                  onSelect={(value) => {
                    console.log("Paciente seleccionado:", value)
                    setSelectedPacienteId(value)
                  }}
                  disabled={dataLoading}
                  placeholder={dataLoading ? "Cargando pacientes..." : "Buscar por nombre, RUT, teléfono o email..."}
                />
              </div>

              {selectedPaciente && (
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Paciente seleccionado:</h3>
                  <p>
                    <strong>Nombre:</strong> {selectedPaciente.nombre} {selectedPaciente.apellido}
                  </p>
                  <p>
                    <strong>RUT:</strong> {selectedPaciente.rut}
                  </p>
                  {selectedPaciente.telefono && (
                    <p>
                      <strong>Teléfono:</strong> {selectedPaciente.telefono}
                    </p>
                  )}
                  {selectedPaciente.email && (
                    <p>
                      <strong>Email:</strong> {selectedPaciente.email}
                    </p>
                  )}
                  {selectedPaciente.prevision && (
                    <p>
                      <strong>Previsión:</strong> {selectedPaciente.prevision}
                    </p>
                  )}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Instrucciones:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Haz doble clic en el ícono de lupa para activar el modo debug</li>
                  <li>Prueba buscar por nombre completo, apellido, RUT, teléfono y email</li>
                  <li>Verifica que los resultados sean correctos</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Búsqueda Manual</CardTitle>
              <CardDescription>Prueba la búsqueda manual para verificar coincidencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ingresa nombre, RUT, teléfono o email"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleManualSearch} disabled={dataLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {testResults && (
                <Alert variant={testResults.success ? "default" : "destructive"}>
                  {testResults.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>
                    {testResults.message}
                    {testResults.details && (
                      <div className="mt-2 text-sm">
                        <strong>Coincidencias:</strong> {testResults.details}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Estadísticas:</h3>
                <p>Total de pacientes: {pacientes.length}</p>
                <p>Pacientes con teléfono: {pacientes.filter((p) => p.telefono).length}</p>
                <p>Pacientes con email: {pacientes.filter((p) => p.email).length}</p>
                <p>Pacientes con previsión: {pacientes.filter((p) => p.prevision).length}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Sugerencias de búsqueda:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nombre completo: "Juan Pérez"</li>
                  <li>Apellido: "González"</li>
                  <li>RUT parcial: "12.345" o "345.678"</li>
                  <li>Teléfono parcial: "9876" o "+569"</li>
                  <li>Email parcial: "@gmail" o "juan@"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos de Pacientes</CardTitle>
            <CardDescription>Lista de los primeros 5 pacientes para verificar la estructura de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">Nombre</th>
                    <th className="py-2 px-4 text-left">Apellido</th>
                    <th className="py-2 px-4 text-left">RUT</th>
                    <th className="py-2 px-4 text-left">Teléfono</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Previsión</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.slice(0, 5).map((paciente) => (
                    <tr key={paciente.id} className="border-b">
                      <td className="py-2 px-4">{paciente.id.substring(0, 8)}...</td>
                      <td className="py-2 px-4">{paciente.nombre}</td>
                      <td className="py-2 px-4">{paciente.apellido}</td>
                      <td className="py-2 px-4">{paciente.rut}</td>
                      <td className="py-2 px-4">{paciente.telefono || "-"}</td>
                      <td className="py-2 px-4">{paciente.email || "-"}</td>
                      <td className="py-2 px-4">{paciente.prevision || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
