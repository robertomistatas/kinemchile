"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPaciente, getSesionesPaciente, actualizarPaciente } from "@/lib/firestore"
import type { Paciente, Sesion, Usuario } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Printer, FileDown, ArrowLeft, CheckCircle, XCircle, RefreshCw, Edit, Save, X } from "lucide-react"
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
import { DateComboInput } from "@/components/ui/date-combo-input"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  const [activeTab, setActiveTab] = useState("informacion")

  // Estados para edición de sesiones
  const [editingSesionId, setEditingSesionId] = useState<string | null>(null)
  const [editingSesionData, setEditingSesionData] = useState<{ fecha: string; notas: string } | null>(null)
  const [savingSesion, setSavingSesion] = useState(false)
  
  // Estados para ordenamiento
  const [ordenSesiones, setOrdenSesiones] = useState<'asc' | 'desc'>('desc') // Más recientes primero
  const [ordenEvaluaciones, setOrdenEvaluaciones] = useState<'asc' | 'desc'>('desc')

  const [success, setSuccess] = useState("")

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
        console.error(`No se encontró el paciente con ID: ${id}`)
        setError(`No se encontró el paciente con ID: ${id}. Por favor, verifica que el ID sea correcto.`)
        setDataLoading(false)
        return
      }

      console.log("Paciente encontrado:", pacienteData)
      setPaciente(pacienteData)

      console.log(`Cargando sesiones para el paciente ${id}`)
      try {
        // Intentar obtener sesiones usando el ID del paciente
        const sesionesData = await getSesionesPaciente(id)
        console.log(`Sesiones cargadas: ${sesionesData.length}`, sesionesData)

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
      setError(`No se pudo cargar la información del paciente: ${error instanceof Error ? error.message : "Error desconocido"}`)
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

  // Funciones para editar sesiones
  const handleEditSesion = (sesion: Sesion) => {
    setEditingSesionId(sesion.id!)
    
    // Convertir timestamp a formato DD-MM-AAAA para la edición
    let fechaFormateada = ""
    if (typeof sesion.fecha === "number") {
      const date = new Date(sesion.fecha)
      fechaFormateada = date.toLocaleDateString("es-CL").split("/").join("-")
    } else if (typeof sesion.fecha === "string") {
      fechaFormateada = sesion.fecha
    }
    
    setEditingSesionData({
      fecha: fechaFormateada,
      notas: sesion.notas || ""
    })
  }

  const handleCancelEdit = () => {
    setEditingSesionId(null)
    setEditingSesionData(null)
  }

  const handleSaveSesion = async (sesionId: string) => {
    if (!editingSesionData) return

    try {
      setSavingSesion(true)
      
      // Convertir fecha DD-MM-AAAA a timestamp
      const [day, month, year] = editingSesionData.fecha.split("-").map(Number)
      const fechaLocal = new Date(year, month - 1, day, 12, 0, 0, 0)
      const fechaTimestamp = fechaLocal.getTime()

      // Importar y usar función de actualización 
      const { actualizarSesion } = await import("@/lib/firestore-service")
      
      await actualizarSesion(sesionId, {
        fecha: fechaTimestamp,
        notas: editingSesionData.notas
      } as any)

      // Actualizar estado local
      setSesiones(prev => prev.map(s => 
        s.id === sesionId 
          ? { ...s, fecha: fechaTimestamp, notas: editingSesionData.notas } as Sesion
          : s
      ))
      
      setEvaluaciones(prev => prev.map(e => 
        e.id === sesionId 
          ? { ...e, fecha: fechaTimestamp, notas: editingSesionData.notas } as Sesion
          : e
      ))

      // Limpiar estado de edición
      setEditingSesionId(null)
      setEditingSesionData(null)
      
    } catch (error) {
      console.error("Error al actualizar sesión:", error)
      setError("Error al actualizar la sesión")
    } finally {
      setSavingSesion(false)
    }
  }

  // Funciones de ordenamiento
  const ordenarSesiones = (sesiones: Sesion[], orden: 'asc' | 'desc') => {
    return [...sesiones].sort((a, b) => {
      const fechaA = typeof a.fecha === "number" ? a.fecha : new Date(a.fecha || 0).getTime()
      const fechaB = typeof b.fecha === "number" ? b.fecha : new Date(b.fecha || 0).getTime()
      
      return orden === 'asc' ? fechaA - fechaB : fechaB - fechaA
    })
  }

  const toggleOrdenSesiones = () => {
    setOrdenSesiones(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const toggleOrdenEvaluaciones = () => {
    setOrdenEvaluaciones(prev => prev === 'asc' ? 'desc' : 'asc')
  }

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

    // Añadir logo
    doc.addImage(
      "https://static.wixstatic.com/media/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png/v1/crop/x_0,y_0,w_920,h_343/fill/w_171,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png",
      "PNG",
      20,
      10,
      40,
      15,
    )

    // Título
    doc.setFontSize(20)
    doc.text("Ficha Clínica", 105, 20, { align: "center" })

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
    doc.text(`Diagnóstico: ${paciente.diagnosticoMedico || paciente.diagnostico || "No registrado"}`, 20, 110)

    if (paciente.antecedentesClinicosRelevantes) {
      doc.text(`Antecedentes Clínicos: ${paciente.antecedentesClinicosRelevantes}`, 20, 120)
    }

    // Estado
    doc.text(`Estado: ${paciente.activo ? "Activo" : "Dado de alta"}`, 20, 130)
    if (!paciente.activo && paciente.fechaAlta) {
      doc.text(`Fecha de alta: ${paciente.fechaAlta}`, 20, 140)
      doc.text(`Notas de alta: ${paciente.notasAlta || ""}`, 20, 150)
    }

    // Evaluaciones
    if (paciente.evaluacionInicial || paciente.evaluacionFinal) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Evaluaciones", 105, 15, { align: "center" })
      doc.setFontSize(12)

      if (paciente.evaluacionInicial) {
        doc.text("Evaluación Inicial:", 20, 30)
        const initialEvalLines = doc.splitTextToSize(paciente.evaluacionInicial, 170)
        doc.text(initialEvalLines, 20, 40)
      }

      if (paciente.evaluacionFinal) {
        const yPos = paciente.evaluacionInicial ? 80 : 30
        doc.text("Evaluación Final:", 20, yPos)
        const finalEvalLines = doc.splitTextToSize(paciente.evaluacionFinal, 170)
        doc.text(finalEvalLines, 20, yPos + 10)
      }
    }

    // Sesiones
    if (sesiones.length > 0 || evaluaciones.length > 0 || (paciente.sesiones && paciente.sesiones.length > 0)) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Historial de Sesiones y Evaluaciones", 105, 15, { align: "center" })

      // Sesiones de Firestore
      if (sesiones.length > 0 || evaluaciones.length > 0) {
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

      // Sesiones del objeto paciente
      if (paciente.sesiones && paciente.sesiones.length > 0) {
        const startY = sesiones.length > 0 || evaluaciones.length > 0 ? 150 : 25
        // @ts-ignore
        doc.autoTable({
          startY: startY,
          head: [["Fecha", "Observaciones"]],
          body: paciente.sesiones.map((sesion) => [sesion.fecha, sesion.observaciones || ""]),
        })
      }
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

  const handleEditPaciente = () => {
    router.push(`/pacientes/${id}/editar`)
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
            <AlertDescription>
              {error || "El paciente que estás buscando no existe o no se pudo cargar."}
            </AlertDescription>
          </Alert>
          <Button asChild className="no-print">
            <Link href="/pacientes">Volver a la lista de pacientes</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  // Verificar si hay sesiones en el objeto paciente
  const tieneSesionesEnObjeto = paciente.sesiones && paciente.sesiones.length > 0

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
            <Button variant="outline" onClick={handleEditPaciente} className="no-print">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
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
          <div className="flex items-center justify-between">
            <img
              src="https://static.wixstatic.com/media/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png/v1/crop/x_0,y_0,w_920,h_343/fill/w_171,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png"
              alt="Kinem Chile Logo"
              className="h-16"
            />
            <div>
              <h1 className="text-3xl font-bold text-center">Ficha Clínica</h1>
              <p className="text-center text-gray-500">Kinem Chile</p>
            </div>
            <div className="w-[171px]"></div> {/* Espacio para equilibrar el diseño */}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="print:mt-8">
          <TabsList className="no-print">
            <TabsTrigger value="informacion">Información Personal</TabsTrigger>
            <TabsTrigger value="clinica">Información Clínica</TabsTrigger>
            <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
            <TabsTrigger value="sesiones">Historial de Sesiones</TabsTrigger>
          </TabsList>

          {/* Para impresión, mostrar todas las secciones */}
          <div className="hidden print:block print:mb-6">
            <h2 className="text-2xl font-bold tracking-tight print:mb-4">Información Personal</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card">
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre completo</p>
                      <p>
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground mt-2">Fecha de Ingreso</p>
                      <p>{paciente.fechaIngreso || <span className="text-muted-foreground">No registrada</span>}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</p>
                      <p>{paciente.fechaIngreso || <span className="text-muted-foreground">No registrada</span>}</p>
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
                    {paciente.edad && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Edad</p>
                        <p>{paciente.edad}</p>
                      </div>
                    )}
                    {paciente.genero && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Género</p>
                        <p>{paciente.genero}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</p>
                      <p>{paciente.fechaNacimiento || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                      <p>{paciente.direccion || "No registrada"}</p>
                    </div>
                    {paciente.tratante_nombre && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Profesional Tratante</p>
                        <p>{paciente.tratante_nombre}</p>
                      </div>
                    )}
                    {paciente.prevision && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Previsión</p>
                        <p>{paciente.prevision}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle>Información Clínica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diagnóstico Médico</p>
                    <p>{paciente.diagnosticoMedico || paciente.diagnostico || "No registrado"}</p>
                  </div>
                  {paciente.antecedentesClinicosRelevantes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Antecedentes Clínicos Relevantes</p>
                      <p>{paciente.antecedentesClinicosRelevantes}</p>
                    </div>
                  )}
                  {paciente.antecedentesPersonales && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Antecedentes Personales</p>
                      <p>{paciente.antecedentesPersonales}</p>
                    </div>
                  )}
                  {paciente.examenesAuxiliares && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Exámenes Auxiliares</p>
                      <p>{paciente.examenesAuxiliares}</p>
                    </div>
                  )}
                  {paciente.fechaInicio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                      <p>{paciente.fechaInicio}</p>
                    </div>
                  )}
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

            {(paciente.evaluacionInicial || paciente.evaluacionFinal) && (
              <>
                <h2 className="text-2xl font-bold tracking-tight print:mt-8 print:mb-4">Evaluaciones</h2>
                <Card className="card">
                  <CardHeader>
                    <CardTitle>Evaluaciones del Paciente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {paciente.evaluacionInicial && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Evaluación Inicial</p>
                        <div className="mt-1 p-4 bg-muted rounded-md">
                          <p className="whitespace-pre-line">{paciente.evaluacionInicial}</p>
                        </div>
                      </div>
                    )}
                    {paciente.evaluacionFinal && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Evaluación Final</p>
                        <div className="mt-1 p-4 bg-muted rounded-md">
                          <p className="whitespace-pre-line">{paciente.evaluacionFinal}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight print:mt-8 print:mb-4">Historial de Sesiones</h2>
              {sesiones.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleOrdenSesiones}
                    className="print:hidden bg-blue-50 hover:bg-blue-100"
                  >
                    📅 Ordenar {ordenSesiones === 'asc' ? '↑ Más antiguas primero' : '↓ Más recientes primero'}
                  </Button>
                  <div className="text-xs text-muted-foreground self-center">
                    {sesiones.length} sesiones
                  </div>
                </div>
              )}
            </div>
            {sesiones.length === 0 && !tieneSesionesEnObjeto ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
              </div>
            ) : (
              <>
                {sesiones.length > 0 && (
                  <div className="rounded-md border mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Notas</TableHead>
                          <TableHead className="w-24">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordenarSesiones(sesiones, ordenSesiones).map((sesion) => (
                          <TableRow key={sesion.id}>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <DateComboInput
                                  value={editingSesionData?.fecha || ""}
                                  onChange={(value) => setEditingSesionData(prev => ({ ...prev!, fecha: value }))}
                                  placeholder="DD-MM-AAAA"
                                />
                              ) : (
                                typeof sesion.fecha === "number"
                                  ? new Date(sesion.fecha).toLocaleDateString("es-CL")
                                  : typeof sesion.fecha === "string"
                                    ? sesion.fecha
                                    : "Fecha no disponible"
                              )}
                            </TableCell>
                            <TableCell>{sesion.tipo}</TableCell>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <Textarea
                                  value={editingSesionData?.notas || ""}
                                  onChange={(e) => setEditingSesionData(prev => ({ ...prev!, notas: e.target.value }))}
                                  placeholder="Notas de la sesión"
                                  rows={2}
                                />
                              ) : (
                                sesion.notas
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleSaveSesion(sesion.id!)}
                                    disabled={savingSesion}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    💾 Guardar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={savingSesion}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    ❌ Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSesion(sesion)}
                                  className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                                >
                                  ✏️ Editar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {tieneSesionesEnObjeto && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paciente.sesiones!.map((sesion, index) => (
                          <TableRow key={index}>
                            <TableCell>{sesion.fecha}</TableCell>
                            <TableCell>{sesion.observaciones || ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight print:mt-8 print:mb-4">Evaluaciones Externas</h2>
              {evaluaciones.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleOrdenEvaluaciones}
                  className="print:hidden"
                >
                  Ordenar por fecha {ordenEvaluaciones === 'asc' ? '↑' : '↓'}
                </Button>
              )}
            </div>
            {evaluaciones.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">No hay evaluaciones externas registradas para este paciente.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenarSesiones(evaluaciones, ordenEvaluaciones).map((evaluacion) => (
                      <TableRow key={evaluacion.id}>
                        <TableCell>
                          {editingSesionId === evaluacion.id ? (
                            <DateComboInput
                              value={editingSesionData?.fecha || ""}
                              onChange={(value) => setEditingSesionData(prev => ({ ...prev!, fecha: value }))}
                              placeholder="DD-MM-AAAA"
                            />
                          ) : (
                            typeof evaluacion.fecha === "number"
                              ? new Date(evaluacion.fecha).toLocaleDateString("es-CL")
                              : typeof evaluacion.fecha === "string"
                                ? evaluacion.fecha
                                : "Fecha no disponible"
                          )}
                        </TableCell>
                        <TableCell>{evaluacion.tipo}</TableCell>
                        <TableCell>
                          {editingSesionId === evaluacion.id ? (
                            <Textarea
                              value={editingSesionData?.notas || ""}
                              onChange={(e) => setEditingSesionData(prev => ({ ...prev!, notas: e.target.value }))}
                              placeholder="Notas de la evaluación"
                              rows={2}
                            />
                          ) : (
                            evaluacion.notas
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSesionId === evaluacion.id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveSesion(evaluacion.id!)}
                                disabled={savingSesion}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={savingSesion}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSesion(evaluacion)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Para visualización en pantalla */}
          <TabsContent value="informacion" className="space-y-4 print:hidden">
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
                    {paciente.edad && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Edad</p>
                        <p>{paciente.edad}</p>
                      </div>
                    )}
                    {paciente.genero && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Género</p>
                        <p>{paciente.genero}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</p>
                      <p>{paciente.fechaNacimiento || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                      <p>{paciente.direccion || "No registrada"}</p>
                    </div>
                    {paciente.tratante_nombre && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Profesional Tratante</p>
                        <p>{paciente.tratante_nombre}</p>
                      </div>
                    )}
                    {paciente.prevision && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Previsión</p>
                        <p>{paciente.prevision}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clinica" className="space-y-4 print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Información Clínica</CardTitle>
                <CardDescription>Datos clínicos del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagnóstico Médico</p>
                  <p>{paciente.diagnosticoMedico || paciente.diagnostico || "No registrado"}</p>
                </div>
                {paciente.antecedentesClinicosRelevantes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Antecedentes Clínicos Relevantes</p>
                    <p>{paciente.antecedentesClinicosRelevantes}</p>
                  </div>
                )}
                {paciente.antecedentesPersonales && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Antecedentes Personales</p>
                    <p>{paciente.antecedentesPersonales}</p>
                  </div>
                )}
                {paciente.examenesAuxiliares && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Exámenes Auxiliares</p>
                    <p>{paciente.examenesAuxiliares}</p>
                  </div>
                )}
                {paciente.fechaInicio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                    <p>{paciente.fechaInicio}</p>
                  </div>
                )}
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
          </TabsContent>

          <TabsContent value="evaluaciones" className="space-y-4 print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones del Paciente</CardTitle>
                <CardDescription>Evaluaciones iniciales y finales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paciente.evaluacionInicial ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evaluación Inicial</p>
                    <div className="mt-1 p-4 bg-muted rounded-md">
                      <p className="whitespace-pre-line">{paciente.evaluacionInicial}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evaluación Inicial</p>
                    <p className="text-muted-foreground">No hay evaluación inicial registrada</p>
                  </div>
                )}
                {paciente.evaluacionFinal ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evaluación Final</p>
                    <div className="mt-1 p-4 bg-muted rounded-md">
                      <p className="whitespace-pre-line">{paciente.evaluacionFinal}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evaluación Final</p>
                    <p className="text-muted-foreground">No hay evaluación final registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold tracking-tight hidden print:block print:mb-4">Evaluaciones Externas</h2>
            {evaluaciones.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">No hay evaluaciones externas registradas para este paciente.</p>
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

          <TabsContent value="sesiones" className="space-y-4 print:hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Historial de Sesiones</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddSesion} 
                  className="no-print bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
                >
                  ➕ Añadir Sesión
                </Button>
                {sesiones.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleOrdenSesiones}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
                    >
                      📅 Fecha {ordenSesiones === 'asc' ? '↑' : '↓'}
                    </Button>
                    <div className="text-xs text-muted-foreground self-center">
                      {sesiones.length} sesiones
                    </div>
                  </>
                )}
              </div>
            </div>
            {sesiones.length === 0 && !tieneSesionesEnObjeto ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
                <p className="text-sm text-muted-foreground mt-2">Usa el botón "Añadir Sesión" arriba para comenzar.</p>
              </div>
            ) : (
              <>
                {sesiones.length > 0 && (
                  <div className="rounded-md border mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Notas</TableHead>
                          <TableHead className="w-24">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordenarSesiones(sesiones, ordenSesiones).map((sesion) => (
                          <TableRow key={sesion.id}>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <DateComboInput
                                  value={editingSesionData?.fecha || ""}
                                  onChange={(value) => setEditingSesionData(prev => ({ ...prev!, fecha: value }))}
                                  placeholder="DD-MM-AAAA"
                                />
                              ) : (
                                typeof sesion.fecha === "number"
                                  ? new Date(sesion.fecha).toLocaleDateString("es-CL")
                                  : typeof sesion.fecha === "string"
                                    ? sesion.fecha
                                    : "Fecha no disponible"
                              )}
                            </TableCell>
                            <TableCell>{sesion.tipo}</TableCell>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <Textarea
                                  value={editingSesionData?.notas || ""}
                                  onChange={(e) => setEditingSesionData(prev => ({ ...prev!, notas: e.target.value }))}
                                  placeholder="Notas de la sesión"
                                  rows={2}
                                />
                              ) : (
                                sesion.notas
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSesionId === sesion.id ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleSaveSesion(sesion.id!)}
                                    disabled={savingSesion}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    💾 Guardar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={savingSesion}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    ❌ Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSesion(sesion)}
                                  className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                                >
                                  ✏️ Editar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {tieneSesionesEnObjeto && (
                  <div className="rounded-md border">
                    <CardHeader>
                      <CardTitle>Sesiones Registradas en Ficha</CardTitle>
                    </CardHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paciente.sesiones!.map((sesion, index) => (
                          <TableRow key={index}>
                            <TableCell>{sesion.fecha}</TableCell>
                            <TableCell>{sesion.observaciones || ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
