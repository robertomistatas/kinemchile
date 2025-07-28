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
import { getPaciente, actualizarPaciente, getProfesionales } from "@/lib/firestore"
import Link from "next/link"
import { validarRut, formatearRut } from "@/lib/utils"

import type { Paciente, Usuario } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateComboInput } from "@/components/ui/date-combo-input"

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
    diagnosticoMedico: "",
    antecedentesPersonales: "",
    antecedentesClinicosRelevantes: "",
    evaluacionInicial: "",
    evaluacionFinal: "",
    examenesAuxiliares: "",
    fechaInicio: "",
    edad: "",
    genero: "",
    prevision: "",
    fechaIngreso: "", // Nuevo campo
    tratante_id: "none", // Campo para profesional tratante
    tratante_nombre: "", // Campo para nombre del profesional tratante
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [dataLoading, setDataLoading] = useState(true)
  const [profesionales, setProfesionales] = useState<Usuario[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPaciente() {
      try {
        setDataLoading(true)
        
        // Cargar profesionales
        try {
          const profesionalesData = await getProfesionales()
          setProfesionales(profesionalesData || [])
        } catch (error) {
          console.error("Error al cargar profesionales:", error)
        }
        
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
            diagnosticoMedico: pacienteData.diagnosticoMedico || "",
            antecedentesPersonales: pacienteData.antecedentesPersonales || "",
            antecedentesClinicosRelevantes: pacienteData.antecedentesClinicosRelevantes || "",
            evaluacionInicial: pacienteData.evaluacionInicial || "",
            evaluacionFinal: pacienteData.evaluacionFinal || "",
            examenesAuxiliares: pacienteData.examenesAuxiliares || "",
            fechaInicio: pacienteData.fechaInicio || "",
            edad: pacienteData.edad || "",
            genero: pacienteData.genero || "",
            prevision: pacienteData.prevision || "",
            fechaIngreso: pacienteData.fechaIngreso || "",
            tratante_id: pacienteData.tratante_id || "none",
            tratante_nombre: pacienteData.tratante_nombre || "",
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

  const handleSelectChange = (name: string, value: string) => {
    if (name === "tratante_id") {
      // Cuando se selecciona un profesional tratante, actualizar también el nombre
      if (value === "none" || !value) {
        setFormData({ 
          ...formData, 
          tratante_id: "",
          tratante_nombre: ""
        })
      } else {
        const profesionalSeleccionado = profesionales.find(p => p.id === value)
        setFormData({ 
          ...formData, 
          tratante_id: value,
          tratante_nombre: profesionalSeleccionado ? profesionalSeleccionado.nombre : ""
        })
      }
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
      // Preparar los datos limpiando valores undefined
      const updateData: Partial<Paciente> = {
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
        evaluacionInicial: formData.evaluacionInicial,
        evaluacionFinal: formData.evaluacionFinal,
        examenesAuxiliares: formData.examenesAuxiliares,
        fechaInicio: formData.fechaInicio,
        edad: formData.edad,
        genero: formData.genero,
        prevision: formData.prevision,
        updatedAt: Date.now().toString(),
      }

      // Solo agregar campos de fecha de ingreso y tratante si tienen valores válidos
      if (formData.fechaIngreso && formData.fechaIngreso.trim() !== "") {
        updateData.fechaIngreso = formData.fechaIngreso
      }

      if (formData.tratante_id && formData.tratante_id !== "none" && formData.tratante_id.trim() !== "") {
        updateData.tratante_id = formData.tratante_id
        updateData.tratante_nombre = formData.tratante_nombre || ""
      }

      await actualizarPaciente(id, updateData)

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
                        <SelectItem value="fonasa">Fonasa</SelectItem>
                        <SelectItem value="isapre">Isapre</SelectItem>
                        <SelectItem value="particular">Particular</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
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
                  <div className="space-y-2">
                    <Label htmlFor="tratante_id">Profesional Tratante</Label>
                    <Select 
                      value={formData.tratante_id} 
                      onValueChange={(value) => handleSelectChange("tratante_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un profesional tratante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {profesionales.map((profesional) => (
                          <SelectItem key={profesional.id} value={profesional.id || ""}>
                            {profesional.nombre} - {profesional.funcion || profesional.rol || 'Profesional'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <div className="space-y-2">
                  <Label htmlFor="examenesAuxiliares">Exámenes Auxiliares</Label>
                  <Textarea
                    id="examenesAuxiliares"
                    name="examenesAuxiliares"
                    value={formData.examenesAuxiliares}
                    onChange={handleChange}
                    placeholder="Exámenes auxiliares del paciente"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones</CardTitle>
                <CardDescription>Edita las evaluaciones del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evaluacionInicial">Evaluación Inicial</Label>
                  <Textarea
                    id="evaluacionInicial"
                    name="evaluacionInicial"
                    value={formData.evaluacionInicial}
                    onChange={handleChange}
                    placeholder="Evaluación inicial del paciente"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluacionFinal">Evaluación Final</Label>
                  <Textarea
                    id="evaluacionFinal"
                    name="evaluacionFinal"
                    value={formData.evaluacionFinal}
                    onChange={handleChange}
                    placeholder="Evaluación final del paciente"
                    rows={5}
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
