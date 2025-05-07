"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPaciente, actualizarPaciente } from "@/lib/firestore"
import Link from "next/link"
import { validarRut, formatearRut } from "@/lib/utils"
import type { Paciente } from "@/lib/data"

export default function EditarPacientePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [formData, setFormData] = useState<Partial<Paciente>>({
    nombre: "",
    apellido: "",
    rut: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    diagnostico: "",
    antecedentesPersonales: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPaciente() {
      try {
        setDataLoading(true)
        const pacienteData = await getPaciente(id)
        if (pacienteData) {
          setFormData({
            nombre: pacienteData.nombre || "",
            apellido: pacienteData.apellido || "",
            rut: pacienteData.rut || "",
            email: pacienteData.email || "",
            telefono: pacienteData.telefono || "",
            fechaNacimiento: pacienteData.fechaNacimiento || "",
            direccion: pacienteData.direccion || "",
            diagnostico: pacienteData.diagnostico || "",
            antecedentesPersonales: pacienteData.antecedentesPersonales || "",
          })
        } else {
          setGeneralError("No se encontró el paciente")
        }
      } catch (error) {
        console.error("Error al cargar paciente:", error)
        setGeneralError("Error al cargar los datos del paciente")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && id) {
      fetchPaciente()
    }
  }, [user, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "rut") {
      // Formatear RUT mientras se escribe
      setFormData({ ...formData, [name]: formatearRut(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.rut?.trim()) {
      newErrors.rut = "El RUT es obligatorio"
    } else if (!validarRut(formData.rut)) {
      newErrors.rut = "El RUT ingresado no es válido"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setGeneralError("")

    try {
      await actualizarPaciente(id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        direccion: formData.direccion,
        diagnostico: formData.diagnostico,
        antecedentesPersonales: formData.antecedentesPersonales,
      })

      router.push(`/pacientes/${id}`)
    } catch (error) {
      console.error("Error al actualizar paciente:", error)
      setGeneralError("Error al actualizar el paciente. Por favor, intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/pacientes/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
        </div>

        {generalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Edita los datos personales del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre del paciente"
                      required
                    />
                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Apellido del paciente"
                      required
                    />
                    {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      onChange={handleChange}
                      placeholder="12.345.678-9"
                      required
                    />
                    {errors.rut && <p className="text-sm text-red-500">{errors.rut}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Dirección del paciente"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Clínica</CardTitle>
                <CardDescription>Edita los datos clínicos del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  <Textarea
                    id="diagnostico"
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleChange}
                    placeholder="Diagnóstico del paciente"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="antecedentesPersonales">Antecedentes Personales</Label>
                  <Textarea
                    id="antecedentesPersonales"
                    name="antecedentesPersonales"
                    value={formData.antecedentesPersonales}
                    onChange={handleChange}
                    placeholder="Antecedentes personales del paciente"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  )
}
