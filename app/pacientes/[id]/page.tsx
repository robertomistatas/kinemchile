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
import { AlertCircle, Printer, FileDown, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
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

export default function PacienteDetallePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [notasAlta, setNotasAlta] = useState("")
  const [showAltaDialog, setShowAltaDialog] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoading(true)
        const pacienteData = await getPaciente(id)
        setPaciente(pacienteData)

        const sesionesData = await getSesionesPaciente(id)
        setSesiones(sesionesData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("No se pudo cargar la información del paciente")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && id) {
      fetchData()
    }
  }, [user, id])

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
    if (sesiones.length > 0) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Historial de Sesiones", 105, 15, { align: "center" })

      // @ts-ignore
      doc.autoTable({
        startY: 25,
        head: [["Fecha", "Tipo", "Notas"]],
        body: sesiones.map((sesion) => [
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
      await actualizarPaciente(id, {
        activo: true,
        fechaAlta: undefined,
        notasAlta: undefined,
      })

      // Actualizar el estado local
      setPaciente({
        ...paciente,
        activo: true,
        fechaAlta: undefined,
        notasAlta: undefined,
      })
    } catch (error) {
      console.error("Error al reactivar al paciente:", error)
      setError("Error al procesar la solicitud de reactivación")
    }
  }

  if (loading || !user) {
    return null
  }

  if (dataLoading) {
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
            <Button variant="outline" size="icon" asChild>
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
          <Button asChild>
            <Link href="/pacientes">Volver a la lista de pacientes</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 print:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="print:hidden">
              <Link href="/pacientes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Ficha del Paciente</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="print:hidden">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="print:hidden">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            {paciente.activo ? (
              <Dialog open={showAltaDialog} onOpenChange={setShowAltaDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" className="print:hidden">
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
              <Button variant="default" onClick={handleReactivarPaciente} className="print:hidden">
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
          <Card>
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

          <Card>
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

        <Tabs defaultValue="sesiones" className="print:mt-8">
          <TabsList className="print:hidden">
            <TabsTrigger value="sesiones">Historial de Sesiones</TabsTrigger>
            <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          </TabsList>
          <TabsContent value="sesiones" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight hidden print:block print:mb-4">Historial de Sesiones</h2>
            {sesiones.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
                <Button asChild className="mt-4 print:hidden">
                  <Link href={`/prestaciones/nueva?pacienteId=${id}`}>Añadir Sesión</Link>
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
                          {typeof sesion.fecha === "string"
                            ? sesion.fecha
                            : new Date(sesion.fecha).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sesion.tipo}</TableCell>
                        <TableCell>{sesion.notas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="evaluaciones" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight hidden print:block print:mb-4">Evaluaciones</h2>
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">No hay evaluaciones registradas para este paciente.</p>
              <Button className="mt-4 print:hidden">Añadir Evaluación</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
