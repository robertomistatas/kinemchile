"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
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
import { 
  Plus, 
  Clock, 
  GripVertical, 
  Trash2, 
  Edit, 
  UserCheck,
  Users,
  X,
  RotateCcw
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Tipos para la cola de espera
interface PacienteEspera {
  id: string
  nombre: string
  turno: string
  color: string
  estado: 'esperando' | 'en-consulta' | 'atendido'
  horaIngreso: Date
}

// Colores predefinidos para los pacientes
const COLORES_PACIENTES = [
  '#3B82F6', // Azul
  '#EF4444', // Rojo
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#14B8A6', // Teal
  '#F97316', // Naranja
  '#6366F1', // Índigo
  '#84CC16'  // Lima
]

// Componente para item arrastrable de la cola
function PacienteItem({ paciente, onCambiarEstado, onEliminar }: {
  paciente: PacienteEspera
  onCambiarEstado: (id: string) => void
  onEliminar: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: paciente.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getEstadoInfo = () => {
    switch (paciente.estado) {
      case 'esperando':
        return { 
          texto: 'Esperando', 
          clase: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icono: <Clock className="h-4 w-4" />,
          boton: { texto: 'Atender', clase: 'bg-blue-600 hover:bg-blue-700' }
        }
      case 'en-consulta':
        return { 
          texto: 'En consulta', 
          clase: 'bg-blue-100 text-blue-800 border-blue-200',
          icono: <UserCheck className="h-4 w-4" />,
          boton: { texto: 'Finalizar', clase: 'bg-green-600 hover:bg-green-700' }
        }
      case 'atendido':
        return { 
          texto: 'Atendido', 
          clase: 'bg-green-100 text-green-800 border-green-200',
          icono: <UserCheck className="h-4 w-4" />,
          boton: { texto: 'Volver a cola', clase: 'bg-gray-600 hover:bg-gray-700' }
        }
      default:
        return { 
          texto: 'Esperando', 
          clase: 'bg-gray-100 text-gray-800 border-gray-200',
          icono: <Clock className="h-4 w-4" />,
          boton: { texto: 'Atender', clase: 'bg-blue-600 hover:bg-blue-700' }
        }
    }
  }

  const estadoInfo = getEstadoInfo()

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-3 cursor-move border-l-4 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-xl scale-105' : ''
      } ${paciente.estado === 'atendido' ? 'opacity-60' : ''}`}
    >
      <div 
        className="border-l-4" 
        style={{ borderLeftColor: paciente.color }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-lg">{paciente.nombre}</h3>
                  <span 
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: paciente.color }}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-1">Turno: <span className="font-medium">{paciente.turno}</span></p>
                <p className="text-xs text-gray-500">
                  Ingreso: {paciente.horaIngreso.toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${estadoInfo.clase} flex items-center space-x-1`}>
                {estadoInfo.icono}
                <span>{estadoInfo.texto}</span>
              </div>
              
              <Button
                size="sm"
                onClick={() => onCambiarEstado(paciente.id)}
                className={estadoInfo.boton.clase}
              >
                {estadoInfo.boton.texto}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEliminar(paciente.id)}
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default function ColaEsperaPage() {
  const { user } = useAuth()
  const [pacientesEspera, setPacientesEspera] = useState<PacienteEspera[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editandoPaciente, setEditandoPaciente] = useState<PacienteEspera | null>(null)
  const [nuevoFormData, setNuevoFormData] = useState({
    nombre: '',
    turno: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generar color aleatorio para nuevo paciente
  const getRandomColor = () => {
    return COLORES_PACIENTES[Math.floor(Math.random() * COLORES_PACIENTES.length)]
  }

  // Manejar fin de arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setPacientesEspera((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Agregar nuevo paciente
  const agregarPaciente = () => {
    if (!nuevoFormData.nombre.trim() || !nuevoFormData.turno.trim()) {
      return
    }

    const nuevoPaciente: PacienteEspera = {
      id: Date.now().toString(),
      nombre: nuevoFormData.nombre.trim(),
      turno: nuevoFormData.turno.trim(),
      color: getRandomColor(),
      estado: 'esperando',
      horaIngreso: new Date()
    }

    setPacientesEspera(prev => [...prev, nuevoPaciente])
    setNuevoFormData({ nombre: '', turno: '' })
    setIsDialogOpen(false)
  }

  // Cambiar estado del paciente
  const cambiarEstadoPaciente = (id: string) => {
    setPacientesEspera(prev => prev.map(paciente => {
      if (paciente.id === id) {
        switch (paciente.estado) {
          case 'esperando':
            return { ...paciente, estado: 'en-consulta' as const }
          case 'en-consulta':
            return { ...paciente, estado: 'atendido' as const }
          case 'atendido':
            return { ...paciente, estado: 'esperando' as const }
          default:
            return paciente
        }
      }
      return paciente
    }))
  }

  // Eliminar paciente
  const eliminarPaciente = (id: string) => {
    setPacientesEspera(prev => prev.filter(p => p.id !== id))
  }

  // Limpiar cola (eliminar atendidos)
  const limpiarAtendidos = () => {
    setPacientesEspera(prev => prev.filter(p => p.estado !== 'atendido'))
  }

  // Resetear cola
  const resetearCola = () => {
    setPacientesEspera([])
  }

  // Estadísticas de la cola
  const stats = {
    total: pacientesEspera.length,
    esperando: pacientesEspera.filter(p => p.estado === 'esperando').length,
    enConsulta: pacientesEspera.filter(p => p.estado === 'en-consulta').length,
    atendidos: pacientesEspera.filter(p => p.estado === 'atendido').length,
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Cola de Espera</h1>
            <p className="text-gray-600">Gestión de pacientes en espera - {new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Paciente
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.esperando}</p>
                  <p className="text-sm text-gray-600">Esperando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.enConsulta}</p>
                  <p className="text-sm text-gray-600">En Consulta</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.atendidos}</p>
                  <p className="text-sm text-gray-600">Atendidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={limpiarAtendidos}
            disabled={stats.atendidos === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Atendidos ({stats.atendidos})
          </Button>
          <Button 
            variant="outline" 
            onClick={resetearCola}
            disabled={stats.total === 0}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetear Cola
          </Button>
        </div>

        {/* Cola de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Pacientes en Cola</span>
            </CardTitle>
            <CardDescription>
              Arrastra los pacientes para reordenar la cola. Los colores ayudan a distinguir entre pacientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pacientesEspera.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No hay pacientes en cola</h3>
                <p className="text-gray-400 mb-4">Agrega el primer paciente para comenzar</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Paciente
                </Button>
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={pacientesEspera.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {pacientesEspera.map((paciente) => (
                      <PacienteItem
                        key={paciente.id}
                        paciente={paciente}
                        onCambiarEstado={cambiarEstadoPaciente}
                        onEliminar={eliminarPaciente}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Dialog para agregar paciente */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Paciente a la Cola</DialogTitle>
              <DialogDescription>
                Ingresa el nombre del paciente y su turno para agregarlo a la cola de espera.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Paciente</Label>
                <Input
                  id="nombre"
                  value={nuevoFormData.nombre}
                  onChange={(e) => setNuevoFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turno">Turno/Hora</Label>
                <Input
                  id="turno"
                  value={nuevoFormData.turno}
                  onChange={(e) => setNuevoFormData(prev => ({ ...prev, turno: e.target.value }))}
                  placeholder="Ej: 09:30, Turno 1, Urgente"
                  className="w-full"
                />
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  El paciente será agregado al final de la cola con estado "Esperando". 
                  Puedes arrastrarlo para cambiar su posición.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={agregarPaciente}
                disabled={!nuevoFormData.nombre.trim() || !nuevoFormData.turno.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
