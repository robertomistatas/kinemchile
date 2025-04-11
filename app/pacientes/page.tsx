"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Layout } from "@/components/layout"
import { Search, MoreHorizontal, Plus, FileText, Trash2 } from "lucide-react"
import { getPacientes, deletePaciente } from "@/lib/firestore"
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
import { useToast } from "@/hooks/use-toast"

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [pacienteToDelete, setPacienteToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchPacientes()
  }, [])

  const fetchPacientes = async () => {
    try {
      setLoading(true)
      const data = await getPacientes()
      setPacientes(data)
    } catch (error) {
      console.error("Error al obtener pacientes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePaciente = async () => {
    if (!pacienteToDelete) return

    try {
      await deletePaciente(pacienteToDelete)
      toast({
        title: "Éxito",
        description: "Paciente eliminado correctamente",
      })
      // Actualizar la lista de pacientes
      fetchPacientes()
    } catch (error) {
      console.error("Error al eliminar paciente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente",
        variant: "destructive",
      })
    } finally {
      setPacienteToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setPacienteToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const filteredPacientes = pacientes.filter(
    (paciente) =>
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.rut.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <Button asChild>
            <Link href="/pacientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar pacientes..."
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
                <TableHead className="hidden md:table-cell">Fecha de Nacimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                    <TableCell
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => router.push(`/pacientes/${paciente.id}/ficha`)}
                    >
                      {paciente.nombre} {paciente.apellido}
                    </TableCell>
                    <TableCell>{paciente.rut}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.telefono}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{paciente.fechaNacimiento}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${paciente.id}`}>Ver detalles</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${paciente.id}/editar`}>Editar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${paciente.id}/ficha`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver ficha clínica
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => confirmDelete(paciente.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paciente y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePaciente} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
