"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { pacientesMock } from "@/lib/data"
import { ArrowLeft, Edit, FileText } from "lucide-react"

export default function PacienteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const paciente = pacientesMock.find((p) => p.id === params.id)

  if (!paciente) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <h1 className="text-2xl font-bold">Paciente no encontrado</h1>
          <p>El paciente que estás buscando no existe.</p>
          <Button asChild>
            <Link href="/pacientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista de pacientes
            </Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/pacientes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {paciente.nombre} {paciente.apellido}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/pacientes/${paciente.id}/ficha`}>
                <FileText className="mr-2 h-4 w-4" />
                Ver Ficha Clínica
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/pacientes/${paciente.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos personales del paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">RUT</dt>
                  <dd>{paciente.rut}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                  <dd>{paciente.fechaNacimiento}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Género</dt>
                  <dd>{paciente.genero}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ocupación</dt>
                  <dd>{paciente.ocupacion || "No especificado"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos de contacto del paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd>{paciente.direccion || "No especificado"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd>{paciente.telefono}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd>{paciente.email || "No especificado"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Previsión</dt>
                  <dd>{paciente.prevision}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
              <CardDescription>Información de contacto en caso de emergencia</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd>{paciente.contactoEmergencia || "No especificado"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd>{paciente.telefonoEmergencia || "No especificado"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Antecedentes Médicos</CardTitle>
              <CardDescription>Historial médico relevante</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{paciente.antecedentes || "No hay antecedentes médicos registrados."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
