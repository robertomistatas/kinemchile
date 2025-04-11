"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout"
import { pacientesMock } from "@/lib/data"
import { ArrowLeft } from "lucide-react"

export default function EditarPacientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const paciente = pacientesMock.find((p) => p.id === params.id)

  const [formData, setFormData] = useState(
    paciente
      ? { ...paciente }
      : {
          nombre: "",
          apellido: "",
          rut: "",
          fechaNacimiento: "",
          genero: "",
          direccion: "",
          telefono: "",
          email: "",
          ocupacion: "",
          prevision: "",
          contactoEmergencia: "",
          telefonoEmergencia: "",
          antecedentes: "",
        },
  )

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // En una aplicación real, aquí enviaríamos los datos a la API
    console.log("Datos actualizados:", formData)

    // Redirigimos a la página de detalles del paciente
    router.push(`/pacientes/${paciente.id}`)
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/pacientes/${paciente.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Paciente: {paciente.nombre} {paciente.apellido}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Información Personal</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" name="rut" value={formData.rut} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select value={formData.genero} onValueChange={(value) => handleSelectChange("genero", value)}>
                  <SelectTrigger id="genero">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ocupacion">Ocupación</Label>
                <Input id="ocupacion" name="ocupacion" value={formData.ocupacion || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Información de Contacto</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" value={formData.direccion || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prevision">Previsión de Salud</Label>
                <Select value={formData.prevision} onValueChange={(value) => handleSelectChange("prevision", value)}>
                  <SelectTrigger id="prevision">
                    <SelectValue placeholder="Seleccionar previsión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fonasa">Fonasa</SelectItem>
                    <SelectItem value="isapre">Isapre</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contacto de Emergencia</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactoEmergencia">Nombre del Contacto</Label>
                <Input
                  id="contactoEmergencia"
                  name="contactoEmergencia"
                  value={formData.contactoEmergencia || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoEmergencia">Teléfono del Contacto</Label>
                <Input
                  id="telefonoEmergencia"
                  name="telefonoEmergencia"
                  value={formData.telefonoEmergencia || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Antecedentes Médicos</h2>
            <div className="space-y-2">
              <Label htmlFor="antecedentes">Antecedentes Médicos Relevantes</Label>
              <Textarea
                id="antecedentes"
                name="antecedentes"
                value={formData.antecedentes || ""}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Guardar Cambios</Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/pacientes/${paciente.id}`)}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
