"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, CheckCircle, FileText } from "lucide-react"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getSesiones } from "@/lib/firestore"
import type { Sesion } from "@/lib/data"

export default function PrestacionesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchSesiones() {
      try {
        setDataLoading(true)
        const data = await getSesiones()
        setSesiones(data)
      } catch (error) {
        console.error("Error al cargar sesiones:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchSesiones()
    }
  }, [user])

  // Filtrar sesiones según el término de búsqueda
  const filteredSesiones = sesiones.filter(
    (sesion) =>
      sesion.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sesion.paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sesion.paciente.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sesion.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Prestaciones / Sesiones</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/prestaciones/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Sesión
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/prestaciones/alta">
                <CheckCircle className="mr-2 h-4 w-4" />
                Dar de Alta
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar sesiones..."
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
                <TableHead>Fecha</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando sesiones...
                  </TableCell>
                </TableRow>
              ) : filteredSesiones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron sesiones.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSesiones.map((sesion) => (
                  <TableRow key={sesion.id}>
                    <TableCell>
                      {typeof sesion.fecha === "string" ? sesion.fecha : new Date(sesion.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sesion.paciente.nombre} {sesion.paciente.apellido}
                    </TableCell>
                    <TableCell>{sesion.paciente.rut}</TableCell>
                    <TableCell className="hidden md:table-cell">{sesion.tipo}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-xs truncate">{sesion.notas}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Ver detalles de la sesión">
                        <Link href={`/prestaciones/${sesion.id}`}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}
