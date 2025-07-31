"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateComboInput } from "@/components/ui/date-combo-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { crearPaciente } from "@/lib/firestore"
import Link from "next/link"
import { validarRut, formatearRut } from "@/lib/utils"
import { CalendarInput } from "./CalendarInput"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Añadir estas importaciones
import { getProfesionales } from "@/lib/firestore-service"

export default function NuevoPacientePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  // Dentro del componente NuevoPacientePage, añadir este estado
  const [profesionales, setProfesionales] = useState([])
  // Actualizar el estado formData para incluir el tratante
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    diagnostico: "",
    diagnosticoMedico: "",
    antecedentesPersonales: "",
    antecedentesClinicosRelevantes: "",
    edad: "",
    genero: "",
    prevision: "",
    tratante_id: "",
    fechaIngreso: "", // Nuevo campo
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")

  // Añadir este useEffect para cargar los profesionales
  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const profesionalesData = await getProfesionales()
        setProfesionales(profesionalesData)
      } catch (error) {
        console.error("Error al cargar profesionales:", error)
      }
    }

    if (user) {
      fetchProfesionales()
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.rut.trim()) {
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

  // Actualizar la función handleSubmit para incluir el tratante
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setGeneralError("")

    try {
      // Encontrar el profesional seleccionado
      const profesionalSeleccionado = profesionales.find((p) => p.id === formData.tratante_id)

      const pacienteId = await crearPaciente({
        nombre: formData.nombre,
        apellido: formData.apellido,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        direccion: formData.direccion,
        diagnostico: formData.diagnostico,
        diagnosticoMedico: formData.diagnosticoMedico,
        antecedentesPersonales: formData.antecedentesPersonales,
        antecedentesClinicosRelevantes: formData.antecedentesClinicosRelevantes,
        edad: formData.edad,
        genero: formData.genero,
        prevision: formData.prevision,
        tratante_id: formData.tratante_id,
        tratante_nombre: profesionalSeleccionado ? profesionalSeleccionado.nombre : "",
        tratante_funcion: profesionalSeleccionado ? profesionalSeleccionado.funcion : "",
        fechaIngreso: formData.fechaIngreso || "",
      })

      router.push(`/pacientes/${pacienteId}`)
    } catch (error) {
      console.error("Error al crear paciente:", error)
      setGeneralError("Error al crear el paciente. Por favor, intenta nuevamente.")
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
            <Link href="/pacientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Paciente</h1>
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
                <CardDescription>Ingresa los datos personales del paciente</CardDescription>
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
                    <DateComboInput
                      id="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={(val) => setFormData({ ...formData, fechaNacimiento: val })}
                      placeholder="DD-MM-AAAA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edad">Edad</Label>
                    <Input
                      id="edad"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Edad del paciente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Género</Label>
                    <Select value={formData.genero} onValueChange={(value) => handleSelectChange("genero", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="prevision">Previsión</Label>
                    <Select
                      value={formData.prevision}
                      onValueChange={(value) => handleSelectChange("prevision", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una previsión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Particular">Particular</SelectItem>
                        <SelectItem value="Fonasa">Fonasa</SelectItem>
                        <SelectItem value="Isapre">Isapre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  // En la sección de información personal, añadir este bloque
                  <div className="space-y-2">
                    <Label htmlFor="tratante">Profesional Tratante</Label>
                    <Select
                      value={formData.tratante_id}
                      onValueChange={(value) => handleSelectChange("tratante_id", value)}
                    >
                      <SelectTrigger id="tratante">
                        <SelectValue placeholder="Seleccionar profesional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_asignado">Sin asignar</SelectItem>
                        {profesionales.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre} (
                            {p.funcion === "kinesiologa"
                              ? "Kinesióloga"
                              : p.funcion === "medico"
                                ? "Médico"
                                : p.funcion}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <DateComboInput
                    id="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={(val) => setFormData({ ...formData, fechaIngreso: val })}
                    placeholder="DD-MM-AAAA"
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
                <CardDescription>Ingresa los datos clínicos del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosticoMedico">Diagnóstico Médico</Label>
                  <Textarea
                    id="diagnosticoMedico"
                    name="diagnosticoMedico"
                    value={formData.diagnosticoMedico}
                    onChange={handleChange}
                    placeholder="Diagnóstico médico del paciente"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="antecedentesClinicosRelevantes">Antecedentes Clínicos Relevantes</Label>
                  <Textarea
                    id="antecedentesClinicosRelevantes"
                    name="antecedentesClinicosRelevantes"
                    value={formData.antecedentesClinicosRelevantes}
                    onChange={handleChange}
                    placeholder="Antecedentes clínicos relevantes del paciente"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Paciente"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  )
}
