"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Save } from "lucide-react"
import { createPaciente } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { validarRut, formatearRut } from "@/lib/utils"

// Funciones de validación
const validarTelefono = (telefono: string) => {
  const telefonoRegex = /^\+56\s?9\s?\d{4}\s?\d{4}$/
  return telefonoRegex.test(telefono)
}

const validarEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validarEdad = (edad: string) => {
  const edadNum = parseInt(edad)
  return edadNum >= 0 && edadNum <= 120
}

const validarFechaNacimiento = (fecha: string) => {
  const fechaNac = new Date(fecha)
  const hoy = new Date()
  return fechaNac <= hoy
}

export default function NuevoPacientePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rutError, setRutError] = useState("")
  const [formErrors, setFormErrors] = useState({
    telefono: "",
    email: "",
    edad: "",
    fechaNacimiento: ""
  })
  const [formData, setFormData] = useState({
    // Datos del Paciente
    nombre: "",
    apellido: "",
    rut: "",
    folio: "",
    direccion: "",
    telefono: "",
    edad: "",
    fechaNacimiento: "",
    genero: "",
    email: "",
    prevision: "fonasa",
    // Información Clínica
    diagnosticoMedico: "",
    antecedentesClinicosRelevantes: "",
    examenesAuxiliares: "",
    // Evaluaciones Kinésicas
    evaluacionInicial: "",
    evaluacionFinal: "",
    // Sesiones
    sesiones: [
      {
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      },
    ],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    )
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Limpiar error previo
    setFormErrors(prev => ({ ...prev, [name]: "" }))

    if (name === "rut") {
      setRutError("")
      setFormData(prev => ({ ...prev, [name]: value }))
    } else if (name === "telefono") {
      if (value && !validarTelefono(value)) {
        setFormErrors(prev => ({ ...prev, telefono: "Formato inválido. Use: +56 9 1234 5678" }))
      }
      setFormData(prev => ({ ...prev, [name]: value }))
    } else if (name === "email") {
      if (value && !validarEmail(value)) {
        setFormErrors(prev => ({ ...prev, email: "Formato de email inválido" }))
      }
      setFormData(prev => ({ ...prev, [name]: value }))
    } else if (name === "edad") {
      if (value && !validarEdad(value)) {
        setFormErrors(prev => ({ ...prev, edad: "La edad debe estar entre 0 y 120 años" }))
      }
      setFormData(prev => ({ ...prev, [name]: value }))
    } else if (name === "fechaNacimiento") {
      if (value && !validarFechaNacimiento(value)) {
        setFormErrors(prev => ({ ...prev, fechaNacimiento: "La fecha no puede ser futura" }))
      }
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleRutBlur = () => {
    if (formData.rut) {
      if (validarRut(formData.rut)) {
        // Formatear RUT si es válido
        setFormData((prev) => ({ ...prev, rut: formatearRut(formData.rut) }))
        setRutError("")
      } else {
        setRutError("RUT inválido. Por favor, ingrese un RUT válido.")
      }
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSesionChange = (index: number, field: string, value: string) => {
    const updatedSesiones = [...formData.sesiones]
    updatedSesiones[index] = { ...updatedSesiones[index], [field]: value }
    setFormData((prev) => ({ ...prev, sesiones: updatedSesiones }))
  }

  const addSesion = () => {
    setFormData((prev) => ({
      ...prev,
      sesiones: [
        ...prev.sesiones,
        {
          fecha: new Date().toISOString().split("T")[0],
          observaciones: "",
        },
      ],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos los campos
    const errores = {
      telefono: formData.telefono && !validarTelefono(formData.telefono) ? "Teléfono inválido" : "",
      email: formData.email && !validarEmail(formData.email) ? "Email inválido" : "",
      edad: formData.edad && !validarEdad(formData.edad) ? "Edad inválida" : "",
      fechaNacimiento: formData.fechaNacimiento && !validarFechaNacimiento(formData.fechaNacimiento) ? "Fecha inválida" : ""
    }

    setFormErrors(errores)

    // Verificar si hay errores
    if (Object.values(errores).some(error => error !== "") || 
        (formData.rut && !validarRut(formData.rut))) {
      toast({
        title: "Error",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.apellido || !formData.rut) {
        toast({
          title: "Error",
          description: "Por favor complete los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Crear paciente en Firestore
      await createPaciente(formData)

      toast({
        title: "Éxito",
        description: "Paciente creado correctamente",
      })

      // Redirigir a la lista de pacientes
      router.push("/pacientes")
    } catch (error) {
      console.error("Error al crear paciente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el paciente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/pacientes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Ficha Kinésica Digital</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="datos-paciente" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="datos-paciente">Datos del Paciente</TabsTrigger>
              <TabsTrigger value="info-clinica">Información Clínica</TabsTrigger>
              <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
              <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
            </TabsList>

            <TabsContent value="datos-paciente">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo*</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          placeholder="Nombre completo del paciente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido*</Label>
                        <Input
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          required
                          placeholder="Apellido del paciente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rut">RUT*</Label>
                        <Input
                          id="rut"
                          name="rut"
                          value={formData.rut}
                          onChange={handleChange}
                          onBlur={handleRutBlur}
                          required
                          placeholder="Ej: 12.345.678-9"
                          className={rutError ? "border-red-500" : ""}
                        />
                        {rutError && <p className="text-sm text-red-500">{rutError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="folio">Folio</Label>
                        <Input
                          id="folio"
                          name="folio"
                          value={formData.folio}
                          onChange={handleChange}
                          placeholder="Folio del paciente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                          id="direccion"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          placeholder="Dirección del paciente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="Ej: +56 9 1234 5678"
                          className={formErrors.telefono ? "border-red-500" : ""}
                        />
                        {formErrors.telefono && <p className="text-sm text-red-500">{formErrors.telefono}</p>}
                      
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="correo@ejemplo.com"
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                      
                        <Input
                          id="edad"
                          name="edad"
                          type="number"
                          value={formData.edad}
                          onChange={handleChange}
                          placeholder="Edad del paciente"
                          className={formErrors.edad ? "border-red-500" : ""}
                        />
                        {formErrors.edad && <p className="text-sm text-red-500">{formErrors.edad}</p>}
                      
                        <Input
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          type="date"
                          value={formData.fechaNacimiento}
                          onChange={handleChange}
                          className={formErrors.fechaNacimiento ? "border-red-500" : ""}
                        />
                        {formErrors.fechaNacimiento && <p className="text-sm text-red-500">{formErrors.fechaNacimiento}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info-clinica">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="diagnosticoMedico">Diagnóstico Médico*</Label>
                      <Textarea
                        id="diagnosticoMedico"
                        name="diagnosticoMedico"
                        value={formData.diagnosticoMedico}
                        onChange={handleChange}
                        required
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
                      <Label htmlFor="examenesAuxiliares">Exámenes Auxiliares (Radiografías, Resonancias, etc.)</Label>
                      <Textarea
                        id="examenesAuxiliares"
                        name="examenesAuxiliares"
                        value={formData.examenesAuxiliares}
                        onChange={handleChange}
                        placeholder="Resultados de exámenes auxiliares"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluaciones">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="evaluacionInicial">Evaluación Inicial*</Label>
                      <Textarea
                        id="evaluacionInicial"
                        name="evaluacionInicial"
                        value={formData.evaluacionInicial}
                        onChange={handleChange}
                        required
                        placeholder="Evaluación kinésica inicial"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evaluacionFinal">Evaluación Final (al alta)</Label>
                      <Textarea
                        id="evaluacionFinal"
                        name="evaluacionFinal"
                        value={formData.evaluacionFinal}
                        onChange={handleChange}
                        placeholder="Evaluación kinésica final"
                        rows={6}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sesiones">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Registro de Prestaciones / Sesiones</h3>

                    {formData.sesiones.map((sesion, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`fecha-${index}`}>Fecha {index + 1}</Label>
                            <Input
                              id={`fecha-${index}`}
                              type="date"
                              value={sesion.fecha}
                              onChange={(e) => handleSesionChange(index, "fecha", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`observaciones-${index}`}>Prestaciones / Observaciones {index + 1}</Label>
                          <Textarea
                            id={`observaciones-${index}`}
                            value={sesion.observaciones}
                            onChange={(e) => handleSesionChange(index, "observaciones", e.target.value)}
                            placeholder="Detalle de prestaciones y observaciones"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addSesion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Ficha"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/pacientes")}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
const [formErrors, setFormErrors] = useState({
  telefono: "",
  email: "",
  edad: "",
  fechaNacimiento: ""
})
