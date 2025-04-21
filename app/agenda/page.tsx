"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type React from "react"
import { useRouter } from "next/navigation"
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
import { Clock, Plus, Search, User } from "lucide-react"
import { getCitas, createCita, getPacientes, getPacienteByRut } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import type { Paciente } from "@/lib/data"

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
  const { toast } = useToast()
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [searchRut, setSearchRut] = useState("")
  const [nuevaCita, setNuevaCita] = useState({
    pacienteId: "",
    pacienteNombre: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "09:00",
    duracion: "45",
    tipo: "Evaluación",
    estado: "pendiente",
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [citasData, pacientesData] = await Promise.all([getCitas(), getPacientes()])
      setCitas(citasData)
      setPacientes(pacientesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const buscarPacientePorRut = async () => {
    try {
      const paciente = await getPacienteByRut(searchRut)
      if (paciente) {
        setNuevaCita(prev => ({
          ...prev,
          pacienteId: paciente.id,
          pacienteNombre: `${paciente.nombre} ${paciente.apellido}`
        }))
        setIsNewPatient(false)
      } else {
        setIsNewPatient(true)
        toast({
          title: "Paciente no encontrado",
          description: "Deberá crear una nueva ficha para este paciente",
        })
      }
    } catch (error) {
      console.error("Error al buscar paciente:", error)
      toast({
        title: "Error",
        description: "Error al buscar el paciente",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNewPatient) {
      router.push("/pacientes/nuevo")
      return
    }

    try {
      const paciente = pacientes.find(p => p.id === nuevaCita.pacienteId)
      if (!paciente) throw new Error("Paciente no encontrado")

      await createCita({
        ...nuevaCita,
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`
      })
      
      await cargarDatos()
      toast({
        title: "Éxito",
        description: "Cita agendada correctamente",
      })
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error al crear cita:", error)
      toast({
        title: "Error",
        description: "No se pudo agendar la cita",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNuevaCita({
      pacienteId: "",
      pacienteNombre: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: "09:00",
      duracion: "45",
      tipo: "Evaluación",
      estado: "pendiente",
    })
    setSearchRut("")
    setIsNewPatient(false)
  }

  const citasDelDia = citas.filter(cita => cita.fecha === selectedDate)

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
                <DialogDescription>Busque el paciente por RUT o cree uno nuevo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="searchRut">RUT del Paciente</Label>
                    <div className="flex gap-2">
                      <Input
                        id="searchRut"
                        value={searchRut}
                        onChange={(e) => setSearchRut(e.target.value)}
                        placeholder="12.345.678-9"
                      />
                      <Button type="button" onClick={buscarPacientePorRut}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isNewPatient ? (
                    <div className="text-center">
                      <p className="mb-4">Paciente no encontrado. ¿Desea crear una nueva ficha?</p>
                      <Button type="submit" className="w-full">
                        Crear Nueva Ficha
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fecha">Fecha</Label>
                          <Input
                            id="fecha"
                            name="fecha"
                            type="date"
                            value={nuevaCita.fecha}
                            onChange={(e) => setNuevaCita(prev => ({ ...prev, fecha: e.target.value }))}
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
                            onChange={(e) => setNuevaCita(prev => ({ ...prev, hora: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duracion">Duración</Label>
                          <Select
                            value={nuevaCita.duracion}
                            onValueChange={(value) => setNuevaCita(prev => ({ ...prev, duracion: value }))}
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
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select
                            value={nuevaCita.tipo}
                            onValueChange={(value) => setNuevaCita(prev => ({ ...prev, tipo: value }))}
                          >
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
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {isNewPatient ? "Crear Nueva Ficha" : "Agendar Cita"}
                  </Button>
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
