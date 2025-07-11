"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, Edit, Trash2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientes } from "@/lib/firestore"
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

export default function PacientesPage() {
  const { user, loading, userInfo } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [pacienteAEliminar, setPacienteAEliminar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verTodos, setVerTodos] = useState(false)

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
        if (!verTodos && (userInfo?.rol === "kinesiologo" || userInfo?.rol === "profesional")) {
          data = (await getPacientes()).filter((p) => p.tratante_id === userInfo.id)
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

  // Filtrar solo pacientes activos y según el término de búsqueda
  const filteredPacientes = pacientes
    .filter((paciente) => paciente.activo) // Mostrar solo activos
    .filter(
      (paciente) =>
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paciente.email && paciente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (paciente.telefono && paciente.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const handleEliminarPaciente = (id: string) => {
    setPacienteAEliminar(id)
  }

  const confirmarEliminarPaciente = async () => {
    if (!pacienteAEliminar) return

    try {
      await eliminarPaciente(pacienteAEliminar)
      // Recargar la lista desde la base de datos
      let data
      if (userInfo?.rol === "kinesiologo") {
        data = await getPacientes(userInfo.id)
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
            <p className="text-sm text-muted-foreground">Mayo 2025 - Listado de pacientes</p>
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
              placeholder="Buscar por nombre, RUT, email o teléfono..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
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
              ) : filteredPacientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron pacientes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">
                      <Link href={`/pacientes/${paciente.id}`} className="hover:underline">
                        {paciente.nombre} {paciente.apellido}
                      </Link>
                    </TableCell>
                    <TableCell>{paciente.rut}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.telefono}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.email}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar paciente"
                          onClick={() => handleEliminarPaciente(paciente.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
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
