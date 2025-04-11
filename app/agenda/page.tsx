"use client"

import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout"
import { pacientesMock } from "@/lib/data"
import { Clock, Plus, User } from "lucide-react"

// Datos de ejemplo para citas
const citasMock = [
  {
    id: "1",
    pacienteId: "1",
    pacienteNombre: "Juan Pérez",
    fecha: "2024-04-05",
    hora: "09:00",
    duracion: "45",
    tipo: "Evaluación",
    estado: "confirmada",
  },
  {
    id: "2",
    pacienteId: "2",
    pacienteNombre: "Ana González",
    fecha: "2024-04-05",
    hora: "10:00",
    duracion: "45",
    tipo: "Control",
    estado: "confirmada",
  },
  {
    id: "3",
    pacienteId: "4",
    pacienteNombre: "Carla Muñoz",
    fecha: "2024-04-05",
    hora: "11:00",
    duracion: "45",
    tipo: "Tratamiento",
    estado: "pendiente",
  },
  {
    id: "4",
    pacienteId: "5",
    pacienteNombre: "Roberto Vega",
    fecha: "2024-04-06",
    hora: "09:00",
    duracion: "45",
    tipo: "Control",
    estado: "confirmada",
  },
]

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-04-05")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nuevaCita, setNuevaCita] = useState({
    pacienteId: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "09:00",
    duracion: "45",
    tipo: "Evaluación",
    estado: "pendiente",
  })

  // Filtrar citas por fecha seleccionada
  const citasDelDia = citasMock
    .filter((cita) => cita.fecha === selectedDate)
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevaCita((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNuevaCita((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // En una aplicación real, aquí enviaríamos los datos a la API
    console.log("Nueva cita:", nuevaCita)

    // Cerrar el diálogo
    setIsDialogOpen(false)

    // Limpiar el formulario
    setNuevaCita({
      pacienteId: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: "09:00",
      duracion: "45",
      tipo: "Evaluación",
      estado: "pendiente",
    })
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agendar Nueva Cita</DialogTitle>
                <DialogDescription>Complete los datos para agendar una nueva cita</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pacienteId">Paciente</Label>
                    <Select
                      value={nuevaCita.pacienteId}
                      onValueChange={(value) => handleSelectChange("pacienteId", value)}
                    >
                      <SelectTrigger id="pacienteId">
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientesMock.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id}>
                            {paciente.nombre} {paciente.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        name="fecha"
                        type="date"
                        value={nuevaCita.fecha}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        name="hora"
                        type="time"
                        value={nuevaCita.hora}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duracion">Duración (min)</Label>
                      <Select
                        value={nuevaCita.duracion}
                        onValueChange={(value) => handleSelectChange("duracion", value)}
                      >
                        <SelectTrigger id="duracion">
                          <SelectValue placeholder="Duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipo">Tipo de Cita</Label>
                      <Select value={nuevaCita.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Evaluación">Evaluación</SelectItem>
                          <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                          <SelectItem value="Control">Control</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Agendar Cita</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Seleccione una fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" value={selectedDate} onChange={handleDateChange} />
                </div>
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="font-medium">Resumen del día</h3>
                    <p className="text-sm text-gray-500">{citasDelDia.length} citas programadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Citas del{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
              <CardDescription>Listado de citas programadas para la fecha seleccionada</CardDescription>
            </CardHeader>
            <CardContent>
              {citasDelDia.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <p>No hay citas programadas para esta fecha.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Agendar Cita
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Agendar Nueva Cita</DialogTitle>
                        <DialogDescription>Complete los datos para agendar una nueva cita</DialogDescription>
                      </DialogHeader>
                      {/* Formulario de cita */}
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {citasDelDia.map((cita) => {
                    const paciente = pacientesMock.find((p) => p.id === cita.pacienteId)
                    return (
                      <div
                        key={cita.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          cita.estado === "confirmada"
                            ? "border-green-200 bg-green-50"
                            : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {cita.hora} - {cita.tipo}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{cita.pacienteNombre}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/pacientes/${cita.pacienteId}`}>Ver Paciente</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/pacientes/${cita.pacienteId}/ficha`}>Ficha Clínica</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
