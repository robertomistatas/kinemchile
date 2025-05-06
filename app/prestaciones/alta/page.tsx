"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPacientesActivos, darDeAltaPaciente } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function DarDeAltaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedPacienteId, setSelectedPacienteId] = useState("")
  const [notas, setNotas] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(true)
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
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      await darDeAltaPaciente(selectedPacienteId, notas)
      setSuccess(true)

      // Esperar 2 segundos antes de redirigir
      setTimeout(() => {
        router.push("/prestaciones")
      }, 2000)
    } catch (error) {
      console.error("Error al dar de alta al paciente:", error)
      setError("Error al procesar la solicitud. Por favor, intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dar de Alta a Paciente</h1>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Alta</CardTitle>
            <CardDescription>Selecciona un paciente para darle de alta</CardDescription>
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
                <AlertDescription>Paciente dado de alta correctamente. Redirigiendo...</AlertDescription>
              </Alert>
            </CardContent>
          )}
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente</label>
                <Select
                  value={selectedPacienteId}
                  onValueChange={setSelectedPacienteId}
                  disabled={dataLoading || submitting || success}
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
                    <strong>Teléfono:</strong> {selectedPaciente.telefono}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPaciente.email}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas de alta</label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ingresa las notas de alta del paciente"
                  rows={4}
                  disabled={submitting || success}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting || !selectedPacienteId || success}>
                {submitting ? "Procesando..." : "Dar de Alta"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
