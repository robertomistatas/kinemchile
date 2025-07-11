"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPacientes } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import Link from "next/link"

export default function PacientesAltaPage() {
  const { user, loading } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    async function fetchPacientesAlta() {
      setDataLoading(true)
      try {
        const data = await getPacientes()
        // Filtrar solo pacientes dados de alta
        // Normalizar los datos para compatibilidad de tipos
        setPacientes(
          data.filter((p) => p.activo === false).map((p) => ({
            ...p,
            kinesiologo_id: p.kinesiologo_id ?? undefined,
            kinesiologo_nombre: p.kinesiologo_nombre ?? undefined,
            createdAt: typeof p.createdAt === "number" ? String(p.createdAt) : p.createdAt,
            updatedAt: typeof p.updatedAt === "number" ? String(p.updatedAt) : p.updatedAt,
          }))
        )
      } catch (error) {
        console.error("Error al cargar pacientes de alta:", error)
      } finally {
        setDataLoading(false)
      }
    }
    if (user) fetchPacientesAlta()
  }, [user])

  if (loading || !user) return null

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes de Alta</h1>
            <p className="text-sm text-muted-foreground">Listado de pacientes archivados</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/pacientes">Volver a Pacientes</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {pacientes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay pacientes archivados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Todos los pacientes están activos.</p>
              </CardContent>
            </Card>
          ) : (
            pacientes.map((paciente) => (
              <Card key={paciente.id}>
                <CardHeader>
                  <CardTitle>{paciente.nombre} {paciente.apellido}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>RUT:</strong> {paciente.rut}</p>
                  <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                  <p><strong>Email:</strong> {paciente.email}</p>
                  <p><strong>Fecha de alta:</strong> {paciente.fechaAlta ? new Date(paciente.fechaAlta).toLocaleDateString() : "-"}</p>
                  {paciente.notasAlta && <p><strong>Notas de alta:</strong> {paciente.notasAlta}</p>}
                  <Button asChild variant="outline" className="mt-4">
                    <Link href={`/pacientes/${paciente.id}`}>Ver ficha</Link>
                  </Button>
                  <Button asChild variant="secondary" className="mt-2">
                    <Link href={`/pacientes/${paciente.id}?reactivar=1`}>Quitar alta</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
