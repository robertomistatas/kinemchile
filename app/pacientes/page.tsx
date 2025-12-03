"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientes, getPacientesPorKinesiologo } from "@/lib/firestore-service"
import { eliminarPaciente } from "@/lib/firestore-service"
import type { Paciente } from "@/lib/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Helper para capitalizar primera letra
function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PacientesPage() {
  const { user, loading, userInfo } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [pacienteAEliminar, setPacienteAEliminar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verTodos, setVerTodos] = useState(false)
  
  // Estados para ordenamiento
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'fechaIngreso'>('nombre')
  const [ordenAscendente, setOrdenAscendente] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchPacientes() {
      try {
        setDataLoading(true)

        let data
        // Si el usuario es profesional y no está en modo verTodos, cargar solo sus pacientes
        if (!verTodos && (userInfo?.rol === "kinesiologo" || userInfo?.rol === "profesional") && userInfo.id) {
          data = await getPacientesPorKinesiologo(userInfo.id)
        } else {
          // Si es admin, recepcionista o está en modo verTodos, cargar todos los pacientes
          data = await getPacientes()
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
  }, [user, userInfo, verTodos])

  // Función para manejar el cambio de ordenamiento
  const handleOrdenar = (campo: 'nombre' | 'fechaIngreso') => {
    if (ordenarPor === campo) {
      // Si es el mismo campo, cambiar la dirección
      setOrdenAscendente(!ordenAscendente)
    } else {
      // Si es campo diferente, cambiar campo y poner ascendente
      setOrdenarPor(campo)
      setOrdenAscendente(true)
    }
  }

  // Función para convertir fecha DD-MM-AAAA a formato comparable
  const convertirFechaParaComparacion = (fecha: string): Date => {
    if (!fecha) return new Date(0) // Fecha muy antigua para fechas vacías
    
    const partes = fecha.split('-')
    if (partes.length !== 3) return new Date(0)
    
    const dia = parseInt(partes[0])
    const mes = parseInt(partes[1]) - 1 // Los meses en JavaScript van de 0-11
    const año = parseInt(partes[2])
    
    return new Date(año, mes, dia)
  }

  // Filtrar y ordenar pacientes
  const pacientesFiltradosYOrdenados = pacientes
    .filter((paciente) => paciente.activo) // Mostrar solo activos
    .filter(
      (paciente) =>
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paciente.telefono && paciente.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (paciente.fechaIngreso && paciente.fechaIngreso.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparacion = 0
      
      if (ordenarPor === 'nombre') {
        const nombreCompleto_a = `${a.nombre} ${a.apellido}`.toLowerCase()
        const nombreCompleto_b = `${b.nombre} ${b.apellido}`.toLowerCase()
        comparacion = nombreCompleto_a.localeCompare(nombreCompleto_b)
      } else if (ordenarPor === 'fechaIngreso') {
        const fecha_a = convertirFechaParaComparacion(a.fechaIngreso || '')
        const fecha_b = convertirFechaParaComparacion(b.fechaIngreso || '')
        comparacion = fecha_a.getTime() - fecha_b.getTime()
      }
      
      return ordenAscendente ? comparacion : -comparacion
    })

  // Generar mes y año actual dinámicamente
  const ahora = new Date();
  const mesAnio = capitalize(
    ahora.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  );

  const handleEliminarPaciente = (id: string) => {
    setPacienteAEliminar(id)
  }

  const confirmarEliminarPaciente = async () => {
    if (!pacienteAEliminar) return

    try {
      await eliminarPaciente(pacienteAEliminar)
      // Recargar la lista desde la base de datos
      let data
      if (userInfo?.rol === "kinesiologo" && userInfo.id) {
        data = await getPacientesPorKinesiologo(userInfo.id)
      } else {
        data = await getPacientes()
      }
      setPacientes(data)
    } catch (error) {
      console.error("Error al eliminar paciente:", error)
      setError("No se pudo eliminar el paciente. Intenta nuevamente.")
    } finally {
      setPacienteAEliminar(null)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Botón para alternar entre ver todos o solo asignados */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-sm text-muted-foreground">
              {mesAnio} - Listado de pacientes
            </p>
          </div>
          <div className="flex gap-2">
            {(userInfo?.rol === "kinesiologo" || userInfo?.rol === "profesional") && (
              <Button
                variant={verTodos ? "secondary" : "outline"}
                onClick={() => setVerTodos((v) => !v)}
              >
                {verTodos ? "Ver solo mis pacientes" : "Ver todos los pacientes"}
              </Button>
            )}
            <Button asChild>
              <Link href="/pacientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paciente
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por nombre, RUT, teléfono o fecha de ingreso..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Indicador de ordenamiento */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Ordenado por:</span>
          <span className="font-medium">
            {ordenarPor === 'nombre' ? 'Nombre' : 'Fecha de Ingreso'}
          </span>
          <span>
            ({ordenAscendente ? 'A-Z' : 'Z-A'})
          </span>
          {ordenarPor === 'fechaIngreso' && (
            <span className="text-xs">
              (más {ordenAscendente ? 'antiguos' : 'recientes'} primero)
            </span>
          )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleOrdenar('nombre')}
                  >
                    Nombre
                    {ordenarPor === 'nombre' ? (
                      ordenAscendente ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>RUT</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleOrdenar('fechaIngreso')}
                  >
                    Fecha de Ingreso
                    {ordenarPor === 'fechaIngreso' ? (
                      ordenAscendente ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Profesional Tratante</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando pacientes...
                  </TableCell>
                </TableRow>
              ) : pacientesFiltradosYOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron pacientes.
                  </TableCell>
                </TableRow>
              ) : (
                pacientesFiltradosYOrdenados.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">
                      <Link href={`/pacientes/${paciente.id}`} className="hover:underline">
                        {paciente.nombre} {paciente.apellido}
                      </Link>
                    </TableCell>
                    <TableCell>{paciente.rut}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.telefono}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {paciente.fechaIngreso || <span className="text-muted-foreground">No ingresada</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          paciente.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {paciente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {paciente.tratante_nombre || <span className="text-muted-foreground">Sin asignar</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Ver ficha del paciente">
                          <Link href={`/pacientes/${paciente.id}`}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Ver ficha</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar paciente">
                          <Link href={`/pacientes/${paciente.id}/editar`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        {user?.email === "roberto@mistatas.com" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Eliminar paciente"
                            onClick={() => paciente.id && handleEliminarPaciente(paciente.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Diálogo de confirmación para eliminar paciente */}
        <AlertDialog open={!!pacienteAEliminar} onOpenChange={(open) => !open && setPacienteAEliminar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al paciente y todos sus datos
                asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmarEliminarPaciente} className="bg-red-500 hover:bg-red-600">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  )
}
