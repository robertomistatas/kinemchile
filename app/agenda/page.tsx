"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientesActivos, getPaciente, crearPaciente } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Clock, AlertCircle, CheckCircle, UserPlus } from "lucide-react"
import { PacienteCombobox } from "@/components/paciente-combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatearRut, validarRut } from "@/lib/utils"

// Tipo para las citas
interface Cita {
  id: string
  fecha: Date
  hora: string
  pacienteId: string
  pacienteNombre: string
  motivo: string
  prevision?: string
}

export default function AgendaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [showNuevaCita, setShowNuevaCita] = useState(false)
  const [citaEnEdicion, setCitaEnEdicion] = useState<Cita | null>(null)
  const [formData, setFormData] = useState({
    pacienteId: "",
    fecha: new Date(),
    hora: "09:00",
    motivo: "",
    prevision: "",
  })
  const [dataLoading, setDataLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [activeTab, setActiveTab] = useState("paciente-existente")
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    prevision: "",
  })
  const [nuevoPacienteErrors, setNuevoPacienteErrors] = useState<Record<string, string>>({})

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
        console.log("Pacientes cargados:", data.length)
        setPacientes(data)
      } catch (error) {
        console.error("Error al cargar pacientes:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchPacientes()
    }
  }, [user])

  // Datos de ejemplo para citas
  useEffect(() => {
    // En una implementación real, esto vendría de la base de datos
    const citasEjemplo: Cita[] = [
      {
        id: "1",
        fecha: new Date(),
        hora: "09:00",
        pacienteId: "1",
        pacienteNombre: "Juan Pérez",
        motivo: "Control mensual",
        prevision: "Fonasa",
      },
      {
        id: "2",
        fecha: new Date(),
        hora: "10:30",
        pacienteId: "2",
        pacienteNombre: "María González",
        motivo: "Evaluación inicial",
        prevision: "Isapre",
      },
    ]
    setCitas(citasEjemplo)
  }, [])

  useEffect(() => {
    async function fetchPacienteSeleccionado() {
      if (!formData.pacienteId) {
        setSelectedPaciente(null)
        setFormData((prev) => ({ ...prev, prevision: "" }))
        return
      }

      try {
        const paciente = await getPaciente(formData.pacienteId)
        setSelectedPaciente(paciente)

        // Si el paciente tiene previsión, actualizar el formulario
        if (paciente && paciente.prevision) {
          setFormData((prev) => ({ ...prev, prevision: paciente.prevision }))
        }
      } catch (error) {
        console.error("Error al cargar paciente seleccionado:", error)
      }
    }

    if (formData.pacienteId) {
      fetchPacienteSeleccionado()
    }
  }, [formData.pacienteId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNuevoPacienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "rut") {
      setNuevoPaciente({ ...nuevoPaciente, [name]: formatearRut(value) })
    } else {
      setNuevoPaciente({ ...nuevoPaciente, [name]: value })
    }

    // Limpiar error del campo
    if (nuevoPacienteErrors[name]) {
      setNuevoPacienteErrors({ ...nuevoPacienteErrors, [name]: "" })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (activeTab === "paciente-existente") {
      setFormData({ ...formData, [name]: value })
    } else {
      setNuevoPaciente({ ...nuevoPaciente, [name]: value })
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setFormData({ ...formData, fecha: newDate })
    }
  }

  const validateNuevoPaciente = () => {
    const errors: Record<string, string> = {}

    if (!nuevoPaciente.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
    }

    if (!nuevoPaciente.apellido.trim()) {
      errors.apellido = "El apellido es obligatorio"
    }

    if (!nuevoPaciente.rut.trim()) {
      errors.rut = "El RUT es obligatorio"
    } else if (!validarRut(nuevoPaciente.rut)) {
      errors.rut = "El RUT ingresado no es válido"
    }

    setNuevoPacienteErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrearPacienteRapido = async () => {
    if (!validateNuevoPaciente()) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // Crear paciente básico
      const pacienteId = await crearPaciente({
        nombre: nuevoPaciente.nombre,
        apellido: nuevoPaciente.apellido,
        rut: nuevoPaciente.rut,
        telefono: nuevoPaciente.telefono,
        prevision: nuevoPaciente.prevision,
        email: "",
        fechaNacimiento: "",
      })

      // Obtener el paciente recién creado
      const pacienteCreado = await getPaciente(pacienteId)

      // Actualizar la lista de pacientes
      setPacientes([...pacientes, pacienteCreado])

      // Seleccionar el paciente recién creado
      setFormData({
        ...formData,
        pacienteId: pacienteId,
        prevision: nuevoPaciente.prevision,
      })

      setSelectedPaciente(pacienteCreado)

      // Cambiar a la pestaña de paciente existente
      setActiveTab("paciente-existente")

      // Limpiar el formulario de nuevo paciente
      setNuevoPaciente({
        nombre: "",
        apellido: "",
        rut: "",
        telefono: "",
        prevision: "",
      })
    } catch (error) {
      console.error("Error al crear paciente rápido:", error)
      setError("Error al crear el paciente. Por favor, intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      if (activeTab === "paciente-nuevo") {
        handleCrearPacienteRapido()
        return
      }

      if (!formData.pacienteId || !selectedPaciente) {
        setError("Debes seleccionar un paciente")
        setSubmitting(false)
        return
      }

      const nuevaCita: Cita = {
        id: citaEnEdicion ? citaEnEdicion.id : Date.now().toString(),
        fecha: formData.fecha,
        hora: formData.hora,
        pacienteId: formData.pacienteId,
        pacienteNombre: `${selectedPaciente.nombre} ${selectedPaciente.apellido}`,
        motivo: formData.motivo,
        prevision: formData.prevision,
      }

      if (citaEnEdicion) {
        // Actualizar cita existente
        setCitas(citas.map((c) => (c.id === citaEnEdicion.id ? nuevaCita : c)))
      } else {
        // Agregar nueva cita
        setCitas([...citas, nuevaCita])
      }

      setSuccess(true)

      // Esperar 1.5 segundos antes de cerrar el diálogo
      setTimeout(() => {
        resetForm()
      }, 1500)
    } catch (error) {
      console.error("Error al guardar cita:", error)
      setError("Error al procesar la solicitud. Por favor, intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditarCita = (cita: Cita) => {
    setCitaEnEdicion(cita)
    setFormData({
      pacienteId: cita.pacienteId,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo,
      prevision: cita.prevision || "",
    })
    setActiveTab("paciente-existente")
    setShowNuevaCita(true)
  }

  const handleEliminarCita = (id: string) => {
    setCitas(citas.filter((c) => c.id !== id))
  }

  const resetForm = () => {
    setFormData({
      pacienteId: "",
      fecha: new Date(),
      hora: "09:00",
      motivo: "",
      prevision: "",
    })
    setNuevoPaciente({
      nombre: "",
      apellido: "",
      rut: "",
      telefono: "",
      prevision: "",
    })
    setSelectedPaciente(null)
    setCitaEnEdicion(null)
    setShowNuevaCita(false)
    setSuccess(false)
    setError("")
    setActiveTab("paciente-existente")
    setNuevoPacienteErrors({})
  }

  // Filtrar citas por fecha seleccionada
  const citasDelDia = citas
    .filter(
      (cita) =>
        cita.fecha.getDate() === date?.getDate() &&
        cita.fecha.getMonth() === date?.getMonth() &&
        cita.fecha.getFullYear() === date?.getFullYear(),
    )
    .sort((a, b) => a.hora.localeCompare(b.hora))

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground">Gestión de citas y horarios</p>
          </div>
          <Button onClick={() => setShowNuevaCita(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Selecciona una fecha para ver las citas</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Citas del día</CardTitle>
              <CardDescription>{date ? date.toLocaleDateString() : "Selecciona una fecha"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {citasDelDia.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay citas programadas para este día.</p>
                ) : (
                  citasDelDia.map((cita) => (
                    <div key={cita.id} className="flex items-center justify-between rounded-md border p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{cita.pacienteNombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {cita.hora} - {cita.motivo}
                          </p>
                          {cita.prevision && (
                            <p className="text-xs text-muted-foreground">Previsión: {cita.prevision}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditarCita(cita)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEliminarCita(cita.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diálogo para nueva cita */}
        <Dialog open={showNuevaCita} onOpenChange={setShowNuevaCita}>
          <DialogContent className="sm:max-w-[600px] rounded-lg">
            <DialogHeader>
              <DialogTitle>{citaEnEdicion ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
              <DialogDescription>
                {citaEnEdicion
                  ? "Modifica los detalles de la cita existente."
                  : "Completa el formulario para agendar una nueva cita."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {citaEnEdicion ? "Cita actualizada correctamente." : "Cita agendada correctamente."}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paciente-existente">Paciente existente</TabsTrigger>
                <TabsTrigger value="paciente-nuevo">Paciente nuevo</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <div className="py-4">
                  <TabsContent value="paciente-existente" className="mt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paciente">Paciente</Label>
                        <PacienteCombobox
                          pacientes={pacientes}
                          selectedPacienteId={formData.pacienteId}
                          onSelect={(value) => handleSelectChange("pacienteId", value)}
                          onCreateNew={() => setActiveTab("paciente-nuevo")}
                          disabled={dataLoading || submitting || success}
                          placeholder={dataLoading ? "Cargando pacientes..." : "Buscar paciente..."}
                        />
                      </div>

                      {selectedPaciente && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                          <p>
                            <strong>Paciente:</strong> {selectedPaciente.nombre} {selectedPaciente.apellido}
                          </p>
                          <p>
                            <strong>RUT:</strong> {selectedPaciente.rut}
                          </p>
                          {selectedPaciente.telefono && (
                            <p>
                              <strong>Teléfono:</strong> {selectedPaciente.telefono}
                            </p>
                          )}
                          {selectedPaciente.prevision && (
                            <p>
                              <strong>Previsión:</strong> {selectedPaciente.prevision}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="paciente-nuevo" className="mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            name="nombre"
                            value={nuevoPaciente.nombre}
                            onChange={handleNuevoPacienteChange}
                            placeholder="Nombre del paciente"
                            disabled={submitting || success}
                          />
                          {nuevoPacienteErrors.nombre && (
                            <p className="text-sm text-red-500">{nuevoPacienteErrors.nombre}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellido">Apellido</Label>
                          <Input
                            id="apellido"
                            name="apellido"
                            value={nuevoPaciente.apellido}
                            onChange={handleNuevoPacienteChange}
                            placeholder="Apellido del paciente"
                            disabled={submitting || success}
                          />
                          {nuevoPacienteErrors.apellido && (
                            <p className="text-sm text-red-500">{nuevoPacienteErrors.apellido}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rut">RUT</Label>
                          <Input
                            id="rut"
                            name="rut"
                            value={nuevoPaciente.rut}
                            onChange={handleNuevoPacienteChange}
                            placeholder="12.345.678-9"
                            disabled={submitting || success}
                          />
                          {nuevoPacienteErrors.rut && <p className="text-sm text-red-500">{nuevoPacienteErrors.rut}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            name="telefono"
                            value={nuevoPaciente.telefono}
                            onChange={handleNuevoPacienteChange}
                            placeholder="+56 9 1234 5678"
                            disabled={submitting || success}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prevision-nuevo">Previsión</Label>
                        <Select
                          value={nuevoPaciente.prevision}
                          onValueChange={(value) => handleSelectChange("prevision", value)}
                          disabled={submitting || success}
                        >
                          <SelectTrigger id="prevision-nuevo">
                            <SelectValue placeholder="Selecciona previsión" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Particular">Particular</SelectItem>
                            <SelectItem value="Fonasa">Fonasa</SelectItem>
                            <SelectItem value="Isapre">Isapre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={handleCrearPacienteRapido}
                          className="w-full"
                          disabled={submitting || success}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Crear paciente y continuar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <div className="rounded-md border">
                          <Calendar
                            mode="single"
                            selected={formData.fecha}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                          id="hora"
                          name="hora"
                          type="time"
                          value={formData.hora}
                          onChange={handleInputChange}
                          required
                          disabled={submitting || success}
                          className="mb-4"
                        />

                        <Label htmlFor="prevision" className="mt-4">
                          Previsión
                        </Label>
                        <Select
                          value={formData.prevision}
                          onValueChange={(value) => handleSelectChange("prevision", value)}
                          disabled={submitting || success}
                        >
                          <SelectTrigger id="prevision">
                            <SelectValue placeholder="Selecciona previsión" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Particular">Particular</SelectItem>
                            <SelectItem value="Fonasa">Fonasa</SelectItem>
                            <SelectItem value="Isapre">Isapre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivo">Motivo</Label>
                      <Textarea
                        id="motivo"
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleInputChange}
                        placeholder="Motivo de la cita"
                        rows={3}
                        disabled={submitting || success}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || success || (activeTab === "paciente-existente" && !formData.pacienteId)}
                  >
                    {submitting ? "Guardando..." : citaEnEdicion ? "Guardar cambios" : "Agendar cita"}
                  </Button>
                </DialogFooter>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
