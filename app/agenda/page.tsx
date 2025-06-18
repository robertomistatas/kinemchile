"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  getPaciente,
  crearPaciente,
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  eliminarCita,
  cambiarEstadoCita,
} from "@/lib/firestore"
import type { Paciente, Cita } from "@/lib/data"
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
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  CalendarIcon,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatearRut, validarRut } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { collection, getDocs, getDb } from "@/lib/firebase"
import { PacienteSearchOptimized } from "@/components/paciente-search-optimized"

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
  const [citasLoading, setCitasLoading] = useState(false)
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPacientes() {
      try {
        setDataLoading(true)
        console.log("Cargando pacientes para el diálogo de citas...")

        // Obtener todos los pacientes (sin filtrar)
        const pacientesRef = collection(getDb(), "pacientes")
        const snapshot = await getDocs(pacientesRef)

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Paciente[]

        console.log(`Pacientes cargados en Agenda: ${data.length}`)

        // Verificar que los datos tengan la estructura correcta
        if (data.length > 0) {
          console.log("Ejemplo de paciente:", {
            id: data[0].id,
            nombre: data[0].nombre,
            apellido: data[0].apellido,
            rut: data[0].rut,
          })
        } else {
          console.log("No se encontraron pacientes")
        }

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
  // Cargar citas para la fecha seleccionada
  useEffect(() => {
    async function fetchCitas() {
      if (!date) return

      try {
        setCitasLoading(true)
        const citasData = await getCitasPorFecha(date)
        console.log(`Citas cargadas para ${date.toLocaleDateString()}:`, citasData.length)
        
        if (citasData.length > 0) {
          console.log("Ejemplo de cita cargada:", {
            id: citasData[0].id,
            pacienteId: citasData[0].pacienteId,
            fecha: new Date(citasData[0].fecha).toLocaleString(),
            hora: citasData[0].hora,
            estado: citasData[0].estado
          });
        }
        
        setCitas(citasData)
      } catch (error) {
        console.error("Error al cargar citas:", error)
      } finally {
        setCitasLoading(false)
      }
    }

    if (user && date) {
      fetchCitas()
    }
  }, [user, date])

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
  const handleSubmit = async (e: React.FormEvent) => {
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

      // Crear objeto de fecha combinando la fecha y hora
      const fechaHora = new Date(formData.fecha)
      const [horas, minutos] = formData.hora.split(":").map(Number)
      fechaHora.setHours(horas, minutos, 0, 0)

      // Datos de la cita
      const citaData = {
        fecha: fechaHora.getTime(),
        hora: formData.hora,
        pacienteId: formData.pacienteId,
        paciente: {
          id: selectedPaciente.id,
          nombre: selectedPaciente.nombre,
          apellido: selectedPaciente.apellido,
          rut: selectedPaciente.rut,
        },        motivo: formData.motivo || "",
        prevision: formData.prevision || "",
        duracion: 60, // Añadir duración por defecto (1 hora)
        estado: "programada", // Asegurarnos que el estado se incluya
      }
      
      if (citaEnEdicion && citaEnEdicion.id) {
        // Actualizar cita existente
        await actualizarCita(citaEnEdicion.id, citaData)

        // Actualizar la lista de citas
        setCitas(
          citas.map((c) =>
            c.id === citaEnEdicion.id
              ? {
                  ...citaData,
                  id: citaEnEdicion.id,
                  estado: citaEnEdicion.estado || "programada",
                  createdAt: citaEnEdicion.createdAt || Date.now(),
                } as Cita
              : c,
          ),
        )
      } else {
        // Crear nueva cita
        const citaId = await crearCita({
          ...citaData,
          // Convertir fecha de número a string si es necesario según el modelo de datos
          fecha: citaData.fecha.toString()
        })

        // Siempre añadir la cita a la lista si estamos en la fecha correcta
        if (fechaHora.toDateString() === date?.toDateString()) {
          console.log("Añadiendo nueva cita a la lista con ID:", citaId)
          
          // Crear objeto de cita completo para mostrar en la UI
          const nuevaCita: Cita = {
            id: citaId,
            ...citaData,
            fecha: citaData.fecha, // Mantener como número para la UI
            estado: "programada",
            createdAt: Date.now(),
          }
          
          console.log("Nueva cita creada:", nuevaCita);
          setCitas((citasActuales) => [...citasActuales, nuevaCita])
        } else {
          console.log("La fecha de la cita no coincide con la fecha seleccionada. No se muestra en la lista actual.")
        }
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

    // Extraer la fecha y hora de la cita
    const fechaCita = new Date(cita.fecha)

    setFormData({
      pacienteId: cita.pacienteId,
      fecha: fechaCita,
      hora: cita.hora,
      motivo: cita.motivo,
      prevision: cita.prevision || "",
    })

    setActiveTab("paciente-existente")
    setShowNuevaCita(true)
  }
  const handleEliminarCita = async (id: string | null) => {
    if (!id) {
      console.error("No se proporcionó un ID de cita válido");
      setConfirmDelete(null);
      return;
    }
    
    try {
      await eliminarCita(id)
      setCitas(citas.filter((c) => c.id !== id))
      setConfirmDelete(null)
    } catch (error) {
      console.error("Error al eliminar cita:", error)
      setError("Error al eliminar la cita. Por favor, intenta nuevamente.")
    }
  }

  const handleCambiarEstadoCita = async (id: string | undefined, nuevoEstado: "programada" | "completada" | "cancelada") => {
    if (!id) {
      console.error("No se proporcionó un ID de cita válido");
      return;
    }
    try {
      await cambiarEstadoCita(id, nuevoEstado)

      // Actualizar el estado en la lista local
      setCitas(citas.map((cita) => (cita.id === id ? { ...cita, estado: nuevoEstado, updatedAt: Date.now() } : cita)))
    } catch (error) {
      console.error(`Error al cambiar estado de la cita ${id}:`, error)
      setError("Error al actualizar el estado de la cita. Por favor, intenta nuevamente.")
    }
  }

  const resetForm = () => {
    console.log("Reseteando formulario de cita")
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
  // Ordenar citas por hora
  const citasOrdenadas = [...citas].sort((a, b) => {
    // Primero por hora
    const comparacionHora = a.hora.localeCompare(b.hora)
    if (comparacionHora !== 0) return comparacionHora

    // Si la hora es igual, ordenar por estado (programada, completada, cancelada)
    const prioridadEstado: Record<string, number> = { programada: 0, completada: 1, cancelada: 2 }
    // Asignamos una prioridad por defecto (3) para estados desconocidos
    return (prioridadEstado[a.estado] ?? 3) - (prioridadEstado[b.estado] ?? 3)
  })

  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" initialFocus />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Citas del día</CardTitle>
                <CardDescription>{date ? date.toLocaleDateString() : "Selecciona una fecha"}</CardDescription>
              </div>
              {citasLoading && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {citasOrdenadas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay citas programadas para este día.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowNuevaCita(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar cita
                    </Button>
                  </div>
                ) : (
                  citasOrdenadas.map((cita) => (
                    <div
                      key={cita.id}
                      className={`flex items-center justify-between rounded-md border p-4 ${
                        cita.estado === "cancelada" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            cita.estado === "programada"
                              ? "bg-blue-100 text-blue-800"
                              : cita.estado === "completada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cita.estado === "programada" ? (
                            <Clock className="h-5 w-5" />
                          ) : cita.estado === "completada" ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {cita.paciente?.nombre || cita.pacienteNombre || "Sin nombre"} {cita.paciente?.apellido || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cita.hora} - {cita.motivo}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getEstadoColor(cita.estado)}`}
                            >
                              {cita.estado === "programada"
                                ? "Programada"
                                : cita.estado === "completada"
                                  ? "Completada"
                                  : "Cancelada"}
                            </span>
                            {cita.prevision && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                {cita.prevision}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Opciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditarCita(cita)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {cita.estado !== "completada" && (
                              <DropdownMenuItem onClick={() => handleCambiarEstadoCita(cita.id, "completada")}>
                                <Check className="mr-2 h-4 w-4" />
                                Marcar como completada
                              </DropdownMenuItem>
                            )}
                            {cita.estado !== "cancelada" && (
                              <DropdownMenuItem onClick={() => handleCambiarEstadoCita(cita.id, "cancelada")}>
                                <X className="mr-2 h-4 w-4" />
                                Cancelar cita
                              </DropdownMenuItem>
                            )}
                            {cita.estado !== "programada" && (
                              <DropdownMenuItem onClick={() => handleCambiarEstadoCita(cita.id, "programada")}>
                                <Clock className="mr-2 h-4 w-4" />
                                Marcar como programada
                              </DropdownMenuItem>
                            )}                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => cita.id && setConfirmDelete(cita.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                        <div className="relative">
                          <PacienteSearchOptimized
                            pacientes={pacientes}
                            selectedPacienteId={formData.pacienteId}
                            onSelect={(value) => {
                              console.log("Paciente seleccionado en diálogo:", value)
                              handleSelectChange("pacienteId", value)
                            }}
                            onCreateNew={() => setActiveTab("paciente-nuevo")}
                            disabled={dataLoading || submitting || success}
                            placeholder={dataLoading ? "Cargando pacientes..." : "Buscar paciente..."}
                            loading={dataLoading}
                          />
                        </div>

                        {pacientes.length === 0 && !dataLoading && (
                          <p className="text-sm text-amber-600">
                            No hay pacientes disponibles. Crea un nuevo paciente en la pestaña "Paciente nuevo".
                          </p>
                        )}

                        {/* Botón de depuración - solo visible en desarrollo */}
                        {process.env.NODE_ENV !== "production" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => {
                              console.log("Pacientes disponibles:", pacientes.length)
                              console.log("Pacientes:", pacientes.slice(0, 5))
                              console.log("ID seleccionado:", formData.pacienteId)
                              console.log("Paciente seleccionado:", selectedPaciente)
                            }}
                          >
                            Debug: Ver pacientes en consola
                          </Button>
                        )}
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

        {/* Diálogo de confirmación para eliminar cita */}
        <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => confirmDelete && handleEliminarCita(confirmDelete)}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
