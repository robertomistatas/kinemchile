"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPacientesActivos, getPaciente, crearSesion } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NuevaSesionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pacienteIdParam = searchParams.get("pacienteId")

  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(pacienteIdParam || "")
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipo: "Evaluación",
    notas: "",
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPacientes() {
      try {
        setDataLoading(true)
        const data = await getPacientesActivos()
        setPacientes(data)

        // Si hay un pacienteId en los parámetros, cargar ese paciente
        if (pacienteIdParam) {
          const paciente = await getPaciente(pacienteIdParam)
          if (paciente) {
            setSelectedPaciente(paciente)
            setSelectedPacienteId(pacienteIdParam)
          }
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error)
        setError("Error al cargar la lista de pacientes")
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchPacientes()
    }
  }, [user, pacienteIdParam])

  useEffect(() => {
    async function fetchPacienteSeleccionado() {
      if (!selectedPacienteId) {
        setSelectedPaciente(null)
        return
      }

      try {
        const paciente = await getPaciente(selectedPacienteId)
        setSelectedPaciente(paciente)
      } catch (error) {
        console.error("Error al cargar paciente seleccionado:", error)
      }
    }

    if (selectedPacienteId) {
      fetchPacienteSeleccionado()
    }
  }, [selectedPacienteId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "pacienteId") {
      setSelectedPacienteId(value)
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)

    if (!selectedPacienteId || !selectedPaciente) {
      setError("Debes seleccionar un paciente")
      setSubmitting(false)
      return
    }

    try {
      const sesionData = {
        fecha: new Date(formData.fecha).getTime(),
        pacienteId: selectedPacienteId,
        paciente: {
          id: selectedPacienteId,
          nombre: selectedPaciente.nombre,
          apellido: selectedPaciente.apellido,
          rut: selectedPaciente.rut,
        },
        tipo: formData.tipo,
        notas: formData.notas,
      }

      await crearSesion(sesionData)
      setSuccess(true)

      // Esperar 2 segundos antes de redirigir
      setTimeout(() => {
        router.push(`/pacientes/${selectedPacienteId}`)
      }, 2000)
    } catch (error) {
      console.error("Error al crear sesión:", error)
      setError("Error al procesar la solicitud. Por favor, intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prestaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Sesión</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Sesión</CardTitle>
            <CardDescription>Completa el formulario para registrar una nueva sesión</CardDescription>
          </CardHeader>
          {error && (
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          )}
          {success && (
            <CardContent>
              <Alert className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Sesión registrada correctamente. Redirigiendo...</AlertDescription>
              </Alert>
            </CardContent>
          )}
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pacienteId">Paciente</Label>
                <Select
                  value={selectedPacienteId}
                  onValueChange={(value) => handleSelectChange("pacienteId", value)}
                  disabled={dataLoading || submitting || success || !!pacienteIdParam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dataLoading ? "Cargando pacientes..." : "Selecciona un paciente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nombre} {paciente.apellido} - {paciente.rut}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPaciente && (
                <div className="p-4 bg-muted rounded-md">
                  <p>
                    <strong>Paciente:</strong> {selectedPaciente.nombre} {selectedPaciente.apellido}
                  </p>
                  <p>
                    <strong>RUT:</strong> {selectedPaciente.rut}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {selectedPaciente.telefono || "No registrado"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPaciente.email || "No registrado"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  disabled={submitting || success}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Sesión</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => handleSelectChange("tipo", value)}
                  disabled={submitting || success}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Evaluación">Evaluación</SelectItem>
                    <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Reevaluación">Reevaluación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Ingresa las notas de la sesión"
                  rows={4}
                  disabled={submitting || success}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting || !selectedPacienteId || success}>
                {submitting ? "Guardando..." : "Guardar Sesión"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
