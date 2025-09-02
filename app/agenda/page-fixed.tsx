"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import {
  getColaEsperaDia,
  agregarPacienteACola,
  actualizarEstadoPacienteCola,
  eliminarPacienteDeCola,
  reordenarCola,
  limpiarColaDia,
  getEstadisticasColaDia
} from "@/lib/firestore-service"
import type { PacienteEspera } from "@/lib/data"
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
  RotateCcw,
  Settings,
  Download,
  Upload,
  Save,
  FileText,
  UserX,
  Calendar
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfiguracionCola } from "@/components/configuracion-cola"
import { BuscarPacienteDialog } from "@/components/buscar-paciente-dialog"

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
function PacienteItem({ paciente, onCambiarEstado, onEliminar, onVerFicha }: {
  paciente: PacienteEspera
  onCambiarEstado: (id: string) => void
  onEliminar: (id: string) => void
  onVerFicha: (pacienteId: string) => void
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
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          boton: 'Atender',
          colorBoton: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'en-consulta':
        return {
          texto: 'En Consulta',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          boton: 'Finalizar',
          colorBoton: 'bg-green-500 hover:bg-green-600'
        }
      case 'atendido':
        return {
          texto: 'Atendido',
          color: 'bg-green-100 text-green-800 border-green-300',
          boton: 'Volver',
          colorBoton: 'bg-yellow-500 hover:bg-yellow-600'
        }
      default:
        return {
          texto: 'Desconocido',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          boton: 'Acción',
          colorBoton: 'bg-gray-500 hover:bg-gray-600'
        }
    }
  }

  const estadoInfo = getEstadoInfo()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{ 
              backgroundColor: paciente.color,
              borderColor: paciente.color 
            }}
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {paciente.pacienteId && paciente.tieneFicha ? (
                <button
                  onClick={() => onVerFicha(paciente.pacienteId!)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  {paciente.nombre}
                </button>
              ) : (
                <h3 className="font-medium text-gray-900">{paciente.nombre}</h3>
              )}
              
              {paciente.tieneFicha && (
                <Badge variant="secondary" className="text-xs">
                  Con ficha
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Turno: {paciente.turno}</span>
              {paciente.rut && <span>• RUT: {paciente.rut}</span>}
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Ingreso: {paciente.horaIngreso.toLocaleTimeString()}</span>
              <span>• Esperando: {Math.floor((new Date().getTime() - paciente.horaIngreso.getTime()) / 60000)} min</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={estadoInfo.color}>
            {estadoInfo.texto}
          </Badge>
          
          <Button
            size="sm"
            onClick={() => onCambiarEstado(paciente.id)}
            className={`${estadoInfo.colorBoton} text-white`}
          >
            {estadoInfo.boton}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEliminar(paciente.id)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ColaEsperaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pacientesEspera, setPacientesEspera] = useState<PacienteEspera[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBuscarPacienteOpen, setIsBuscarPacienteOpen] = useState(false)
  const [editandoPaciente, setEditandoPaciente] = useState<PacienteEspera | null>(null)
  const [loading, setLoading] = useState(true)
  const [nuevoFormData, setNuevoFormData] = useState({
    nombre: '',
    turno: ''
  })
  
  // Configuración de la cola (seguirá usando localStorage)
  const [configuracion, setConfiguracion] = useState({
    sonidosHabilitados: true,
    volumen: 0.5,
    mostrarTiempos: true,
    autoAvanzar: false
  })

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  }

  // Función para cargar datos de la cola desde Firestore
  const cargarColaDia = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando cola del día desde Firestore...')
      
      const pacientes = await getColaEsperaDia()
      setPacientesEspera(pacientes)
      
      console.log(`✅ Cola cargada: ${pacientes.length} pacientes`)
    } catch (error) {
      console.error('❌ Error al cargar cola:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarColaDia()
    
    // Cargar configuración desde localStorage
    const savedConfig = localStorage.getItem('cola-espera-config')
    if (savedConfig) {
      try {
        setConfiguracion(JSON.parse(savedConfig))
        console.log('⚙️ Configuración cargada desde localStorage')
      } catch (error) {
        console.error('❌ Error al cargar configuración:', error)
      }
    }
  }, [])

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cola-espera-config', JSON.stringify(configuracion))
  }, [configuracion])

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
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = pacientesEspera.findIndex((item) => item.id === active.id)
      const newIndex = pacientesEspera.findIndex((item) => item.id === over?.id)

      const nuevosItems = arrayMove(pacientesEspera, oldIndex, newIndex)
      
      // Actualizar estado local inmediatamente para UX
      setPacientesEspera(nuevosItems)
      
      // Actualizar orden en Firestore
      try {
        console.log('🔄 Reordenando cola en Firestore...')
        const success = await reordenarCola(nuevosItems)
        if (!success) {
          // Si falla, revertir cambios
          setPacientesEspera(pacientesEspera)
          console.error('❌ Error al reordenar cola, revirtiendo cambios')
        } else {
          console.log('✅ Cola reordenada correctamente')
        }
      } catch (error) {
        console.error('❌ Error al reordenar cola:', error)
        // Revertir cambios
        setPacientesEspera(pacientesEspera)
      }
    }
  }

  // Agregar nuevo paciente
  const agregarPaciente = async () => {
    if (!nuevoFormData.nombre.trim() || !nuevoFormData.turno.trim()) {
      return
    }

    const nuevoPaciente = {
      nombre: nuevoFormData.nombre.trim(),
      turno: nuevoFormData.turno.trim(),
      color: getRandomColor(),
      estado: 'esperando' as const,
      horaIngreso: new Date(),
      tieneFicha: false, // Por defecto, si se usa el formulario manual
      fechaCola: getFechaHoy()
    }

    try {
      console.log('➕ Agregando paciente manual a Firestore...')
      const id = await agregarPacienteACola(nuevoPaciente)
      
      if (id) {
        // Agregar al estado local con el ID de Firestore
        const pacienteConId = { ...nuevoPaciente, id }
        setPacientesEspera(prev => [...prev, pacienteConId])
        setNuevoFormData({ nombre: '', turno: '' })
        setIsDialogOpen(false)
        console.log('✅ Paciente agregado correctamente')
      } else {
        console.error('❌ Error al agregar paciente')
      }
    } catch (error) {
      console.error('❌ Error al agregar paciente:', error)
    }
  }

  // Manejar selección de paciente desde el buscador
  const manejarPacienteSeleccionado = async (pacienteData: {
    id?: string
    nombre: string
    rut?: string
    tieneFicha: boolean
  }) => {
    // Generar turno automático basado en la hora actual
    const ahora = new Date()
    const turnoAutomatico = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`
    
    const nuevoPaciente = {
      nombre: pacienteData.nombre,
      turno: turnoAutomatico,
      color: getRandomColor(),
      estado: 'esperando' as const,
      horaIngreso: new Date(),
      pacienteId: pacienteData.id,
      rut: pacienteData.rut,
      tieneFicha: pacienteData.tieneFicha,
      fechaCola: getFechaHoy()
    }

    try {
      console.log(`➕ Agregando paciente desde buscador: ${pacienteData.nombre}`)
      const id = await agregarPacienteACola(nuevoPaciente)
      
      if (id) {
        // Agregar al estado local con el ID de Firestore
        const pacienteConId = { ...nuevoPaciente, id }
        setPacientesEspera(prev => [...prev, pacienteConId])
        console.log(`✅ Paciente agregado a la cola: ${pacienteData.nombre} (${pacienteData.tieneFicha ? 'Con ficha' : 'Sin ficha'})`)
      } else {
        console.error('❌ Error al agregar paciente desde buscador')
      }
    } catch (error) {
      console.error('❌ Error al agregar paciente desde buscador:', error)
    }
  }

  // Navegar a la ficha del paciente
  const verFichaPaciente = (pacienteId: string) => {
    console.log(`📋 Abriendo ficha del paciente: ${pacienteId}`)
    router.push(`/pacientes/${pacienteId}?from=agenda`)
  }

  // Cambiar estado del paciente
  const cambiarEstadoPaciente = async (id: string) => {
    try {
      const paciente = pacientesEspera.find(p => p.id === id)
      if (!paciente) return

      let nuevoEstado: 'esperando' | 'en-consulta' | 'atendido'
      
      switch (paciente.estado) {
        case 'esperando':
          nuevoEstado = 'en-consulta'
          break
        case 'en-consulta':
          nuevoEstado = 'atendido'
          break
        case 'atendido':
          nuevoEstado = 'esperando'
          break
        default:
          return
      }

      console.log(`🔄 Cambiando estado de ${paciente.nombre} a: ${nuevoEstado}`)
      
      const success = await actualizarEstadoPacienteCola(id, nuevoEstado)
      if (success) {
        // Actualizar estado local
        setPacientesEspera(prev => prev.map(p => 
          p.id === id ? { ...p, estado: nuevoEstado } : p
        ))
        console.log(`✅ Estado actualizado correctamente`)
      } else {
        console.error('❌ Error al actualizar estado')
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado del paciente:', error)
    }
  }

  // Eliminar paciente
  const eliminarPaciente = async (id: string) => {
    try {
      console.log(`🗑️ Eliminando paciente: ${id}`)
      
      const success = await eliminarPacienteDeCola(id)
      if (success) {
        // Actualizar estado local
        setPacientesEspera(prev => prev.filter(p => p.id !== id))
        console.log(`✅ Paciente eliminado correctamente`)
      } else {
        console.error('❌ Error al eliminar paciente')
      }
    } catch (error) {
      console.error('❌ Error al eliminar paciente:', error)
    }
  }

  // Limpiar cola (marcar atendidos como finalizados, pero mantenerlos)
  const limpiarAtendidos = () => {
    // En lugar de eliminar, podríamos agregar un estado 'finalizado' si se desea
    // Por ahora mantenemos los atendidos como están
    console.log('Los pacientes atendidos se mantienen en la cola del día')
  }

  // Resetear cola del día actual
  const resetearCola = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar todos los pacientes de la cola del día actual?')) {
      try {
        console.log('🧹 Reseteando cola del día...')
        
        const success = await limpiarColaDia()
        if (success) {
          setPacientesEspera([])
          console.log('✅ Cola reseteada correctamente')
        } else {
          console.error('❌ Error al resetear cola')
        }
      } catch (error) {
        console.error('❌ Error al resetear cola:', error)
      }
    }
  }

  // Exportar cola a archivo JSON
  const exportarCola = () => {
    const data = {
      pacientes: pacientesEspera,
      fecha: new Date().toISOString(),
      configuracion
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cola-espera-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Importar cola desde archivo JSON
  const importarCola = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.pacientes && Array.isArray(data.pacientes)) {
          const pacientes = data.pacientes.map((p: any) => ({
            ...p,
            horaIngreso: new Date(p.horaIngreso)
          }))
          setPacientesEspera(pacientes)
          
          if (data.configuracion) {
            setConfiguracion(data.configuracion)
          }
        }
      } catch (error) {
        console.error('Error al importar cola:', error)
        alert('Error al importar el archivo. Verifica que sea un archivo válido.')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  // Estadísticas de la cola
  const stats = {
    total: pacientesEspera.length,
    esperando: pacientesEspera.filter(p => p.estado === 'esperando').length,
    enConsulta: pacientesEspera.filter(p => p.estado === 'en-consulta').length,
    atendidos: pacientesEspera.filter(p => p.estado === 'atendido').length,
    conFicha: pacientesEspera.filter(p => p.tieneFicha).length,
    sinFicha: pacientesEspera.filter(p => !p.tieneFicha).length,
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Cola de Espera</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Calendar className="h-4 w-4" />
              <p>Gestión de pacientes en espera - {new Date().toLocaleDateString('es-CL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              📅 La cola se mantiene durante todo el día y se renueva automáticamente cada día
            </p>
          </div>
          <Button 
            onClick={() => setIsBuscarPacienteOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Paciente
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">Cargando cola del día desde Firestore...</p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.conFicha}</p>
                    <p className="text-sm text-gray-600">Con Ficha</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.sinFicha}</p>
                    <p className="text-sm text-gray-600">Sin Ficha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Información de persistencia diaria */}
        {!loading && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Cola del Día - {new Date().toLocaleDateString('es-CL')}</h3>
                    <p className="text-sm text-blue-600">
                      Los pacientes permanecen en la cola durante todo el día. La cola se renueva automáticamente cada día.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">{stats.total}</p>
                  <p className="text-sm text-blue-600">Total del día</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones rápidas */}
        {!loading && (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Agregar Manual
            </Button>

            <Button 
              variant="outline" 
              onClick={limpiarAtendidos}
              disabled={true}
              className="opacity-50"
              title="Los pacientes atendidos se mantienen en la cola del día"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Atendidos del día ({stats.atendidos})
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetearCola}
              disabled={stats.total === 0}
              className="text-red-600 border-red-200 hover:bg-red-50"
              title="Elimina todos los pacientes de la cola del día actual"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetear Cola del Día
            </Button>

            {/* Botón de debug temporal */}
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('🔍 DEBUG - Estado actual pacientesEspera:', pacientesEspera)
                
                try {
                  const pacientesFirestore = await getColaEsperaDia()
                  console.log('🔍 DEBUG - Datos en Firestore:', pacientesFirestore)
                  
                  const estadisticas = await getEstadisticasColaDia()
                  console.log('🔍 DEBUG - Estadísticas:', estadisticas)
                  
                  alert(`Debug info (ver consola):\nEstado local: ${pacientesEspera.length} pacientes\nFirestore: ${pacientesFirestore.length} pacientes\nÚltima carga: ${loading ? 'Cargando...' : 'Completada'}`)
                } catch (error) {
                  console.error('🔍 DEBUG - Error:', error)
                  alert('Error al obtener debug info: ' + error)
                }
              }}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              🐛 Debug Firestore
            </Button>

            <ConfiguracionCola 
              configuracion={configuracion}
              onActualizar={setConfiguracion}
            />

            <Button 
              variant="outline" 
              onClick={exportarCola}
              disabled={stats.total === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importarCola}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="importar-cola"
              />
              <Button variant="outline" asChild>
                <label htmlFor="importar-cola" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </label>
              </Button>
            </div>
          </div>
        )}

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
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : pacientesEspera.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes en cola</h3>
                <p className="mt-1 text-sm text-gray-500">Agrega el primer paciente para comenzar</p>
                <div className="mt-6">
                  <Button onClick={() => setIsBuscarPacienteOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Paciente
                  </Button>
                </div>
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
                  <div className="space-y-3">
                    {pacientesEspera.map((paciente) => (
                      <PacienteItem
                        key={paciente.id}
                        paciente={paciente}
                        onCambiarEstado={cambiarEstadoPaciente}
                        onEliminar={eliminarPaciente}
                        onVerFicha={verFichaPaciente}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Dialog para agregar paciente manualmente */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Paciente Manualmente</DialogTitle>
              <DialogDescription>
                Ingresa el nombre del paciente y su turno para agregarlo a la cola de espera.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del paciente</Label>
                <Input
                  id="nombre"
                  value={nuevoFormData.nombre}
                  onChange={(e) => setNuevoFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="turno">Turno</Label>
                <Input
                  id="turno"
                  value={nuevoFormData.turno}
                  onChange={(e) => setNuevoFormData(prev => ({ ...prev, turno: e.target.value }))}
                  placeholder="14:30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={agregarPaciente}>
                Agregar a la Cola
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para buscar pacientes */}
        <BuscarPacienteDialog
          isOpen={isBuscarPacienteOpen}
          onClose={() => setIsBuscarPacienteOpen(false)}
          onPacienteSeleccionado={manejarPacienteSeleccionado}
        />
      </div>
    </Layout>
  )
}
