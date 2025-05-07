"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPaciente, getSesionesPaciente, actualizarPaciente } from "@/lib/firestore"
import type { Paciente, Sesion } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Printer, FileDown, ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Importar el componente de depuración
import { DebugSesiones } from "@/components/debug-sesiones"

export default function PacienteDetallePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Sesion[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [notasAlta, setNotasAlta] = useState("")
  const [showAltaDialog, setShowAltaDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("sesiones")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Función para cargar los datos del paciente y sus sesiones
  const fetchData = async () => {
    try {
      setDataLoading(true)
      setError("")

      console.log(`Cargando datos del paciente ${id}`)
      const pacienteData = await getPaciente(id)

      if (!pacienteData) {
        setError("No se encontró el paciente")
        setDataLoading(false)
        return
      }

      setPaciente(pacienteData)

      console.log(`Cargando sesiones para el paciente ${id}`)
      try {
        // Intentar obtener sesiones usando el ID del paciente
        const sesionesData = await getSesionesPaciente(id)
        console.log(`Sesiones cargadas: ${sesionesData.length}`, sesionesData)

        if (sesionesData.length === 0) {
          // Si no hay sesiones, verificar si hay un problema con el componente de depuración
          console.log("No se encontraron sesiones. Verificando con el componente de depuración...")
          const debugResult = await DebugSesiones({ pacienteId: id })
          console.log("Resultado de depuración:", debugResult)

          // Buscar sesiones que coincidan con el paciente actual
          const matchingSesiones = debugResult.filter(
            (s) =>
              s.pacienteId === id ||
              (s.paciente && s.paciente.id === id) ||
              (s.paciente && s.paciente.rut === pacienteData.rut),
          )

          if (matchingSesiones.length > 0) {
            console.log("Se encontraron sesiones en la depuración:", matchingSesiones)
            // Usar estas sesiones si se encontraron
            const evaluacionesData = matchingSesiones.filter(
              (s) => s.tipo === "Evaluación" || s.tipo === "Reevaluación",
            )
            const otherSesiones = matchingSesiones.filter((s) => s.tipo !== "Evaluación" && s.tipo !== "Reevaluación")

            setSesiones(otherSesiones)
            setEvaluaciones(evaluacionesData)
            setDataLoading(false)
            setRefreshing(false)
            return
          }
        }

        // Separar sesiones y evaluaciones
        const evaluacionesData = sesionesData.filter((s) => s.tipo === "Evaluación" || s.tipo === "Reevaluación")
        const otherSesiones = sesionesData.filter((s) => s.tipo !== "Evaluación" && s.tipo !== "Reevaluación")

        console.log(`Sesiones filtradas: ${otherSesiones.length}`, otherSesiones)
        console.log(`Evaluaciones filtradas: ${evaluacionesData.length}`, evaluacionesData)

        setSesiones(otherSesiones)
        setEvaluaciones(evaluacionesData)
      } catch (sesionesError) {
        console.error("Error al cargar sesiones:", sesionesError)
        setError("Error al cargar las sesiones del paciente")
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError("No se pudo cargar la información del paciente")
    } finally {
      setDataLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user && id) {
      fetchData()
    }
  }, [user, id])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    if (!paciente) return

    const doc = new jsPDF()

    // Título
    doc.setFontSize(20)
    doc.text("Ficha Clínica", 105, 15, { align: "center" })

    // Información del paciente
    doc.setFontSize(12)
    doc.text(`Paciente: ${paciente.nombre} ${paciente.apellido}`, 20, 30)
    doc.text(`RUT: ${paciente.rut}`, 20, 40)
    doc.text(`Teléfono: ${paciente.telefono || "No registrado"}`, 20, 50)
    doc.text(`Email: ${paciente.email || "No registrado"}`, 20, 60)
    doc.text(`Fecha de nacimiento: ${paciente.fechaNacimiento || "No registrada"}`, 20, 70)
    doc.text(`Dirección: ${paciente.direccion || "No registrada"}`, 20, 80)

    // Información clínica
    doc.setFontSize(16)
    doc.text("Información Clínica", 20, 100)
    doc.setFontSize(12)
    doc.text(`Diagnóstico: ${paciente.diagnostico || "No registrado"}`, 20, 110)

    // Estado
    doc.text(`Estado: ${paciente.activo ? "Activo" : "Dado de alta"}`, 20, 120)
    if (!paciente.activo && paciente.fechaAlta) {
      doc.text(`Fecha de alta: ${paciente.fechaAlta}`, 20, 130)
      doc.text(`Notas de alta: ${paciente.notasAlta || ""}`, 20, 140)
    }

    // Sesiones
    if (sesiones.length > 0 || evaluaciones.length > 0) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Historial de Sesiones y Evaluaciones", 105, 15, { align: "center" })

      // @ts-ignore
      doc.autoTable({
        startY: 25,
        head: [["Fecha", "Tipo", "Notas"]],
        body: [...sesiones, ...evaluaciones].map((sesion) => [
          typeof sesion.fecha === "string" ? sesion.fecha : new Date(sesion.fecha).toLocaleDateString(),
          sesion.tipo,
          sesion.notas,
        ]),
      })
    }

    doc.save(`ficha_${paciente.nombre}_${paciente.apellido}.pdf`)
  }

  const handleDarDeAlta = async () => {
    if (!paciente) return

    try {
      setError("")
      await actualizarPaciente(id, {
        activo: false,
        fechaAlta: new Date().toISOString(),
        notasAlta,
      })

      // Actualizar el estado local
      setPaciente({
        ...paciente,
        activo: false,
        fechaAlta: new Date().toISOString(),
        notasAlta,
      })

      setShowAltaDialog(false)
    } catch (error) {
      console.error("Error al dar de alta al paciente:", error)
      setError("Error al procesar la solicitud de alta")
    }
  }

  const handleReactivarPaciente = async () => {
    if (!paciente) return

    try {
      setError("")
      setDataLoading(true)

      // Actualizar en la base de datos
      await actualizarPaciente(id, {
        activo: true,
        fechaAlta: null,
        notasAlta: null,
      })

      // Volver a cargar los datos del paciente para asegurar consistencia
      await fetchData()
    } catch (error) {
      console.error("Error al reactivar al paciente:", error)
      setError("Error al procesar la solicitud de reactivación")
      setDataLoading(false)
    }
  }

  const handleAddEvaluacion = () => {
    router.push(`/prestaciones/nueva?pacienteId=${id}&tipo=Evaluación`)
  }

  const handleAddSesion = () => {
    router.push(`/prestaciones/nueva?pacienteId=${id}&tipo=Tratamiento`)
  }

  if (loading || !user) {
    return null
  }

  if (dataLoading && !refreshing) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (error || !paciente) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="no-print">
              <Link href="/pacientes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Paciente no encontrado</h1>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>El paciente que estás buscando no existe o no se pudo cargar.</AlertDescription>
          </Alert>
          <Button asChild className="no-print">
            <Link href="/pacientes">Volver a la lista de pacientes</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 print-area">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="no-print">
              <Link href="/pacientes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Ficha del Paciente</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="no-print" disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button variant="outline" onClick={handlePrint} className="no-print">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="no-print">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            {paciente.activo ? (
              <Dialog open={showAltaDialog} onOpenChange={setShowAltaDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" className="no-print">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Dar de Alta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dar de Alta al Paciente</DialogTitle>
                    <DialogDescription>
                      Estás a punto de dar de alta a {paciente.nombre} {paciente.apellido}. Esta acción registrará la
                      fecha actual como fecha de alta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notas de alta</label>
                      <Textarea
                        value={notasAlta}
                        onChange={(e) => setNotasAlta(e.target.value)}
                        placeholder="Ingresa las notas de alta del paciente"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAltaDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleDarDeAlta}>Confirmar Alta</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="default" onClick={handleReactivarPaciente} className="no-print">
                <XCircle className="mr-2 h-4 w-4" />
                Quitar Alta
              </Button>
            )}
          </div>
        </div>

        {/* Título para impresión */}
        <div className="hidden print:block print:mb-6">
          <h1 className="text-3xl font-bold text-center">Ficha Clínica</h1>
          <p className="text-center text-gray-500">Kinem Chile</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos personales del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre completo</p>
                  <p>
                    {paciente.nombre} {paciente.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RUT</p>
                  <p>{paciente.rut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p>{paciente.telefono || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{paciente.email || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</p>
                  <p>{paciente.fechaNacimiento || "No registrada"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p>{paciente.direccion || "No registrada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle>Información Clínica</CardTitle>
              <CardDescription>Datos clínicos del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                <p>{paciente.diagnostico || "No registrado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className={paciente.activo ? "text-green-600" : "text-red-600"}>
                  {paciente.activo ? "Activo" : "Dado de alta"}
                </p>
              </div>
              {!paciente.activo && paciente.fechaAlta && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de alta</p>
                    <p>{new Date(paciente.fechaAlta).toLocaleDateString()}</p>
                  </div>
                  {paciente.notasAlta && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notas de alta</p>
                      <p>{paciente.notasAlta}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="page">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="print:mt-8">
            <TabsList className="no-print">
              <TabsTrigger value="sesiones">Historial de Sesiones</TabsTrigger>
              <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
            </TabsList>

            {/* Para impresión, mostrar ambas secciones */}
            <div className="hidden print:block print:mb-6">
              <h2 className="text-2xl font-bold tracking-tight print:mb-4">Historial de Sesiones</h2>
              {sesiones.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sesiones.map((sesion) => (
                        <TableRow key={sesion.id}>
                          <TableCell>
                            {typeof sesion.fecha === "number"
                              ? new Date(sesion.fecha).toLocaleDateString()
                              : typeof sesion.fecha === "string"
                                ? sesion.fecha
                                : "Fecha no disponible"}
                          </TableCell>
                          <TableCell>{sesion.tipo}</TableCell>
                          <TableCell>{sesion.notas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <h2 className="text-2xl font-bold tracking-tight print:mt-8 print:mb-4">Evaluaciones</h2>
              {evaluaciones.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No hay evaluaciones registradas para este paciente.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluaciones.map((evaluacion) => (
                        <TableRow key={evaluacion.id}>
                          <TableCell>
                            {typeof evaluacion.fecha === "number"
                              ? new Date(evaluacion.fecha).toLocaleDateString()
                              : typeof evaluacion.fecha === "string"
                                ? evaluacion.fecha
                                : "Fecha no disponible"}
                          </TableCell>
                          <TableCell>{evaluacion.tipo}</TableCell>
                          <TableCell>{evaluacion.notas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Para visualización en pantalla */}
            <TabsContent value="sesiones" className="space-y-4 print:hidden">
              <h2 className="text-2xl font-bold tracking-tight hidden print:block print:mb-4">Historial de Sesiones</h2>
              {sesiones.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
                  <Button className="mt-4 no-print" onClick={handleAddSesion}>
                    Añadir Sesión
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sesiones.map((sesion) => (
                        <TableRow key={sesion.id}>
                          <TableCell>
                            {typeof sesion.fecha === "number"
                              ? new Date(sesion.fecha).toLocaleDateString()
                              : typeof sesion.fecha === "string"
                                ? sesion.fecha
                                : "Fecha no disponible"}
                          </TableCell>
                          <TableCell>{sesion.tipo}</TableCell>
                          <TableCell>{sesion.notas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 flex justify-end">
                    <Button onClick={handleAddSesion} className="no-print">
                      Añadir Sesión
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="evaluaciones" className="space-y-4 print:hidden">
              <h2 className="text-2xl font-bold tracking-tight hidden print:block print:mb-4">Evaluaciones</h2>
              {evaluaciones.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No hay evaluaciones registradas para este paciente.</p>
                  <Button className="mt-4 no-print" onClick={handleAddEvaluacion}>
                    Añadir Evaluación
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluaciones.map((evaluacion) => (
                        <TableRow key={evaluacion.id}>
                          <TableCell>
                            {typeof evaluacion.fecha === "number"
                              ? new Date(evaluacion.fecha).toLocaleDateString()
                              : typeof evaluacion.fecha === "string"
                                ? evaluacion.fecha
                                : "Fecha no disponible"}
                          </TableCell>
                          <TableCell>{evaluacion.tipo}</TableCell>
                          <TableCell>{evaluacion.notas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 flex justify-end">
                    <Button onClick={handleAddEvaluacion} className="no-print">
                      Añadir Evaluación
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        {/* Añadir el componente al final del JSX, justo antes del cierre del div principal */}
        <div className="no-print mt-8">
          <DebugSesiones pacienteId={id} />
        </div>
      </div>
    </Layout>
  )
}
