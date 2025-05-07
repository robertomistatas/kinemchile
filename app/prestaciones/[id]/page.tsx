"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getSesion, getPaciente } from "@/lib/firestore"
import type { Sesion, Paciente } from "@/lib/data"
import Link from "next/link"

export default function DetalleSesionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoading(true)
        const sesionData = await getSesion(id)

        if (!sesionData) {
          setError("No se encontró la sesión solicitada")
          setDataLoading(false)
          return
        }

        setSesion(sesionData)

        // Obtener datos del paciente
        if (sesionData.pacienteId) {
          const pacienteData = await getPaciente(sesionData.pacienteId)
          setPaciente(pacienteData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar la información de la sesión")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && id) {
      fetchData()
    }
  }, [user, id])

  if (loading || !user) {
    return null
  }

  if (dataLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (error || !sesion) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/prestaciones">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Sesión no encontrada</h1>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "La sesión que estás buscando no existe o no se pudo cargar."}
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/prestaciones">Volver a la lista de sesiones</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  const fechaSesion =
    typeof sesion.fecha === "number"
      ? new Date(sesion.fecha).toLocaleDateString()
      : typeof sesion.fecha === "string"
        ? sesion.fecha
        : "Fecha no disponible"

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prestaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de Sesión</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
            <CardDescription>Detalles de la sesión realizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p>{fechaSesion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p>{sesion.tipo}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Paciente</p>
              <p>
                <Link href={`/pacientes/${sesion.pacienteId}`} className="hover:underline text-primary">
                  {sesion.paciente?.nombre} {sesion.paciente?.apellido} - {sesion.paciente?.rut}
                </Link>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Notas</p>
              <div className="mt-1 p-4 bg-muted rounded-md">
                <p className="whitespace-pre-line">{sesion.notas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {paciente && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Paciente</CardTitle>
              <CardDescription>Datos del paciente asociado a esta sesión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre completo</p>
                  <p>
                    {paciente.nombre} {paciente.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RUT</p>
                  <p>{paciente.rut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p>{paciente.telefono || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{paciente.email || "No registrado"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                <p>{paciente.diagnostico || "No registrado"}</p>
              </div>

              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href={`/pacientes/${paciente.id}`}>Ver ficha completa</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
