"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientesActivos } from "@/lib/firestore"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

// Tipo para las citas
interface Cita {
  id: string
  fecha: Date
  hora: string
  pacienteId: string
  pacienteNombre: string
  motivo: string
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
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPacientes() {
      try {
        const data = await getPacientesActivos()
        setPacientes(data)
      } catch (error) {
        console.error("Error al cargar pacientes:", error)
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
      },
      {
        id: "2",
        fecha: new Date(),
        hora: "10:30",
        pacienteId: "2",
        pacienteNombre: "María González",
        motivo: "Evaluación inicial",
      },
    ]
    setCitas(citasEjemplo)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setFormData({ ...formData, fecha: newDate })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const paciente = pacientes.find((p) => p.id === formData.pacienteId)

    if (!paciente) return

    const nuevaCita: Cita = {
      id: citaEnEdicion ? citaEnEdicion.id : Date.now().toString(),
      fecha: formData.fecha,
      hora: formData.hora,
      pacienteId: formData.pacienteId,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
      motivo: formData.motivo,
    }

    if (citaEnEdicion) {
      // Actualizar cita existente
      setCitas(citas.map((c) => (c.id === citaEnEdicion.id ? nuevaCita : c)))
    } else {
      // Agregar nueva cita
      setCitas([...citas, nuevaCita])
    }

    resetForm()
  }

  const handleEditarCita = (cita: Cita) => {
    setCitaEnEdicion(cita)
    setFormData({
      pacienteId: cita.pacienteId,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo,
    })
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
    })
    setCitaEnEdicion(null)
    setShowNuevaCita(false)
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{citaEnEdicion ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
              <DialogDescription>
                {citaEnEdicion
                  ? "Modifica los detalles de la cita existente."
                  : "Completa el formulario para agendar una nueva cita."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente">Paciente</Label>
                  <Select
                    value={formData.pacienteId}
                    onValueChange={(value) => handleSelectChange("pacienteId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map((paciente) => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nombre} {paciente.apellido} - {paciente.rut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                    />
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">{citaEnEdicion ? "Guardar cambios" : "Agendar cita"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
