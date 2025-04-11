"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { getPacienteById, updatePaciente } from "@/lib/firestore"
import { ArrowLeft, Plus, Save, Printer, FileDown, CheckCircle, FilePlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function FichaClinicaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paciente, setPaciente] = useState<any>(null)
  const fichaRef = useRef<HTMLDivElement>(null)
  const [isAltaDialogOpen, setIsAltaDialogOpen] = useState(false)
  const [isNuevaPatologiaDialogOpen, setIsNuevaPatologiaDialogOpen] = useState(false)
  const [nuevaPatologia, setNuevaPatologia] = useState({
    diagnosticoMedico: "",
    antecedentesClinicosRelevantes: "",
    examenesAuxiliares: "",
    evaluacionInicial: "",
    evaluacionFinal: "",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaAlta: "",
    sesiones: [
      {
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      },
    ],
  })

  const [formData, setFormData] = useState({
    oda: "",
    diagnosticoMedico: "",
    antecedentesClinicosRelevantes: "",
    examenesAuxiliares: "",
    evaluacionInicial: "",
    evaluacionFinal: "",
    fechaInicio: "",
    fechaAlta: "",
    patologias: [] as any[],
    sesiones: [
      {
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      },
    ],
  })

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const data = await getPacienteById(params.id)
        if (data) {
          setPaciente(data)
          setFormData({
            oda: data.oda || "",
            diagnosticoMedico: data.diagnosticoMedico || "",
            antecedentesClinicosRelevantes: data.antecedentesClinicosRelevantes || "",
            examenesAuxiliares: data.examenesAuxiliares || "",
            evaluacionInicial: data.evaluacionInicial || "",
            evaluacionFinal: data.evaluacionFinal || "",
            fechaInicio: data.fechaInicio || new Date().toISOString().split("T")[0],
            fechaAlta: data.fechaAlta || "",
            patologias: data.patologias || [],
            sesiones: data.sesiones || [
              {
                fecha: new Date().toISOString().split("T")[0],
                observaciones: "",
              },
            ],
          })
        }
      } catch (error) {
        console.error("Error al obtener paciente:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del paciente",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaciente()
  }, [params.id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNuevaPatologiaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNuevaPatologia((prev) => ({ ...prev, [name]: value }))
  }

  const handleSesionChange = (index: number, field: string, value: string) => {
    const updatedSesiones = [...formData.sesiones]
    updatedSesiones[index] = { ...updatedSesiones[index], [field]: value }
    setFormData((prev) => ({ ...prev, sesiones: updatedSesiones }))
  }

  const handleNuevaPatologiaSesionChange = (index: number, field: string, value: string) => {
    const updatedSesiones = [...nuevaPatologia.sesiones]
    updatedSesiones[index] = { ...updatedSesiones[index], [field]: value }
    setNuevaPatologia((prev) => ({ ...prev, sesiones: updatedSesiones }))
  }

  const addSesion = () => {
    setFormData((prev) => ({
      ...prev,
      sesiones: [
        ...prev.sesiones,
        {
          fecha: new Date().toISOString().split("T")[0],
          observaciones: "",
        },
      ],
    }))
  }

  const addNuevaPatologiaSesion = () => {
    setNuevaPatologia((prev) => ({
      ...prev,
      sesiones: [
        ...prev.sesiones,
        {
          fecha: new Date().toISOString().split("T")[0],
          observaciones: "",
        },
      ],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updatePaciente(params.id, formData)
      toast({
        title: "Éxito",
        description: "Ficha clínica actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar ficha:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la ficha clínica",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDarDeAlta = async () => {
    try {
      const fechaAlta = new Date().toISOString().split("T")[0]
      const updatedFormData = {
        ...formData,
        fechaAlta: fechaAlta,
      }

      await updatePaciente(params.id, updatedFormData)
      setFormData(updatedFormData)

      toast({
        title: "Éxito",
        description: "Paciente dado de alta correctamente",
      })

      setIsAltaDialogOpen(false)
    } catch (error) {
      console.error("Error al dar de alta al paciente:", error)
      toast({
        title: "Error",
        description: "No se pudo dar de alta al paciente",
        variant: "destructive",
      })
    }
  }

  const handleAgregarNuevaPatologia = async () => {
    try {
      // Validar campos requeridos
      if (!nuevaPatologia.diagnosticoMedico || !nuevaPatologia.evaluacionInicial) {
        toast({
          title: "Error",
          description: "Por favor complete los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Agregar la nueva patología al array de patologías
      const updatedPatologias = [
        ...formData.patologias,
        {
          ...nuevaPatologia,
          id: Date.now().toString(), // Generar un ID único
          fechaInicio: nuevaPatologia.fechaInicio || new Date().toISOString().split("T")[0],
        },
      ]

      const updatedFormData = {
        ...formData,
        patologias: updatedPatologias,
      }

      await updatePaciente(params.id, updatedFormData)
      setFormData(updatedFormData)

      toast({
        title: "Éxito",
        description: "Nueva patología agregada correctamente",
      })

      // Limpiar el formulario de nueva patología
      setNuevaPatologia({
        diagnosticoMedico: "",
        antecedentesClinicosRelevantes: "",
        examenesAuxiliares: "",
        evaluacionInicial: "",
        evaluacionFinal: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaAlta: "",
        sesiones: [
          {
            fecha: new Date().toISOString().split("T")[0],
            observaciones: "",
          },
        ],
      })

      setIsNuevaPatologiaDialogOpen(false)
    } catch (error) {
      console.error("Error al agregar nueva patología:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la nueva patología",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    if (!fichaRef.current) return

    try {
      toast({
        title: "Generando PDF",
        description: "Por favor espere mientras se genera el PDF...",
      })

      // Asegurarse de que todas las pestañas estén visibles para la exportación
      const allTabsContent = document.querySelectorAll('[role="tabpanel"]')
      allTabsContent.forEach((tab) => {
        if (tab instanceof HTMLElement) {
          tab.style.display = "block"
          tab.style.opacity = "1"
          tab.style.visibility = "visible"
        }
      })

      const canvas = await html2canvas(fichaRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        windowHeight: fichaRef.current.scrollHeight,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")

      // Calcular dimensiones para ajustar al PDF
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Agregar encabezado
      pdf.setFontSize(18)
      pdf.text(`Ficha Kinésica: ${paciente.nombre} ${paciente.apellido}`, 105, 15, { align: "center" })
      pdf.setFontSize(12)
      pdf.text(`RUT: ${paciente.rut}`, 105, 22, { align: "center" })
      pdf.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 105, 28, { align: "center" })

      // Agregar imagen de la ficha
      let position = 35

      // Si la imagen es más grande que una página, dividirla en múltiples páginas
      let heightLeft = imgHeight

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - position

      while (heightLeft > 0) {
        position = 0
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, -imgHeight + position + (pageHeight - position) * 1, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Restaurar la visualización de las pestañas
      allTabsContent.forEach((tab) => {
        if (tab instanceof HTMLElement) {
          tab.style.display = ""
          tab.style.opacity = ""
          tab.style.visibility = ""
        }
      })

      pdf.save(`Ficha_${paciente.nombre}_${paciente.apellido}.pdf`)

      toast({
        title: "PDF generado",
        description: "El PDF se ha generado correctamente",
      })
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!paciente) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <h1 className="text-2xl font-bold">Paciente no encontrado</h1>
          <p>El paciente que estás buscando no existe.</p>
          <Button asChild>
            <Link href="/pacientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista de pacientes
            </Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6" ref={fichaRef}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="print:hidden">
              <Link href={`/pacientes/${paciente.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Ficha Kinésica: {paciente.nombre} {paciente.apellido}
            </h1>
          </div>
          <div className="flex gap-2 print:hidden">
            <AlertDialog open={isAltaDialogOpen} onOpenChange={setIsAltaDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className={formData.fechaAlta ? "bg-green-100" : ""}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {formData.fechaAlta ? `Alta: ${formData.fechaAlta}` : "Dar de alta"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Dar de alta al paciente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción registrará la fecha actual como fecha de alta del paciente para esta patología.
                    {formData.fechaAlta && (
                      <p className="mt-2 font-semibold">
                        El paciente ya tiene una fecha de alta registrada: {formData.fechaAlta}. ¿Desea actualizarla?
                      </p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDarDeAlta}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isNuevaPatologiaDialogOpen} onOpenChange={setIsNuevaPatologiaDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Nueva patología
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar nueva patología</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar una nueva patología kinesiológica para este paciente.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="np-fechaInicio">Fecha de inicio</Label>
                        <Input
                          id="np-fechaInicio"
                          name="fechaInicio"
                          type="date"
                          value={nuevaPatologia.fechaInicio}
                          onChange={handleNuevaPatologiaChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="np-diagnosticoMedico">Diagnóstico Médico*</Label>
                      <Textarea
                        id="np-diagnosticoMedico"
                        name="diagnosticoMedico"
                        value={nuevaPatologia.diagnosticoMedico}
                        onChange={handleNuevaPatologiaChange}
                        required
                        placeholder="Diagnóstico médico del paciente"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="np-antecedentesClinicosRelevantes">Antecedentes Clínicos Relevantes</Label>
                      <Textarea
                        id="np-antecedentesClinicosRelevantes"
                        name="antecedentesClinicosRelevantes"
                        value={nuevaPatologia.antecedentesClinicosRelevantes}
                        onChange={handleNuevaPatologiaChange}
                        placeholder="Antecedentes clínicos relevantes del paciente"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="np-examenesAuxiliares">Exámenes Auxiliares</Label>
                      <Textarea
                        id="np-examenesAuxiliares"
                        name="examenesAuxiliares"
                        value={nuevaPatologia.examenesAuxiliares}
                        onChange={handleNuevaPatologiaChange}
                        placeholder="Resultados de exámenes auxiliares"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="np-evaluacionInicial">Evaluación Inicial*</Label>
                      <Textarea
                        id="np-evaluacionInicial"
                        name="evaluacionInicial"
                        value={nuevaPatologia.evaluacionInicial}
                        onChange={handleNuevaPatologiaChange}
                        required
                        placeholder="Evaluación kinésica inicial"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sesiones iniciales</Label>
                      {nuevaPatologia.sesiones.map((sesion, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-lg">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`np-fecha-${index}`}>Fecha {index + 1}</Label>
                              <Input
                                id={`np-fecha-${index}`}
                                type="date"
                                value={sesion.fecha}
                                onChange={(e) => handleNuevaPatologiaSesionChange(index, "fecha", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`np-observaciones-${index}`}>
                              Prestaciones / Observaciones {index + 1}
                            </Label>
                            <Textarea
                              id={`np-observaciones-${index}`}
                              value={sesion.observaciones}
                              onChange={(e) => handleNuevaPatologiaSesionChange(index, "observaciones", e.target.value)}
                              placeholder="Detalle de prestaciones y observaciones"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}

                      <Button type="button" variant="outline" onClick={addNuevaPatologiaSesion} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Sesión
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNuevaPatologiaDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAgregarNuevaPatologia}>Guardar nueva patología</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
            <CardDescription>Datos básicos del paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd>
                  {paciente.nombre} {paciente.apellido}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">RUT</dt>
                <dd>{paciente.rut}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Edad</dt>
                <dd>{paciente.edad || "No especificada"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd>{paciente.telefono}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd>{paciente.direccion || "No especificada"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ODA</dt>
                <dd>{paciente.oda || "No especificada"}</dd>
              </div>
              {formData.fechaInicio && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                  <dd>{formData.fechaInicio}</dd>
                </div>
              )}
              {formData.fechaAlta && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de alta</dt>
                  <dd className="font-medium text-green-600">{formData.fechaAlta}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Patologías anteriores */}
        {formData.patologias && formData.patologias.length > 0 && (
          <Card className="print:break-before-page">
            <CardHeader>
              <CardTitle>Patologías anteriores</CardTitle>
              <CardDescription>Historial de patologías tratadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.patologias.map((patologia, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{patologia.diagnosticoMedico}</h3>
                      <div className="text-sm">
                        <span className="text-gray-500">Inicio: {patologia.fechaInicio}</span>
                        {patologia.fechaAlta && (
                          <span className="ml-4 text-green-600">Alta: {patologia.fechaAlta}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patologia.antecedentesClinicosRelevantes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Antecedentes Clínicos</h4>
                          <p className="text-sm">{patologia.antecedentesClinicosRelevantes}</p>
                        </div>
                      )}

                      {patologia.examenesAuxiliares && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Exámenes Auxiliares</h4>
                          <p className="text-sm">{patologia.examenesAuxiliares}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Evaluación Inicial</h4>
                      <p className="text-sm">{patologia.evaluacionInicial}</p>
                    </div>

                    {patologia.evaluacionFinal && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Evaluación Final</h4>
                        <p className="text-sm">{patologia.evaluacionFinal}</p>
                      </div>
                    )}

                    {patologia.sesiones && patologia.sesiones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Sesiones ({patologia.sesiones.length})
                        </h4>
                        <div className="space-y-2">
                          {patologia.sesiones.map((sesion, sesionIndex) => (
                            <div key={sesionIndex} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                              <span className="font-medium">{sesion.fecha}:</span> {sesion.observaciones}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info-clinica" className="w-full">
            <TabsList className="grid w-full grid-cols-3 print:hidden">
              <TabsTrigger value="info-clinica">Información Clínica</TabsTrigger>
              <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
              <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
            </TabsList>

            <TabsContent value="info-clinica" className="print:block">
              <Card>
                <CardHeader className="print:pb-2">
                  <CardTitle>Información Clínica</CardTitle>
                  <CardDescription>Datos clínicos del paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="diagnosticoMedico">Diagnóstico Médico*</Label>
                      <Textarea
                        id="diagnosticoMedico"
                        name="diagnosticoMedico"
                        value={formData.diagnosticoMedico}
                        onChange={handleChange}
                        required
                        placeholder="Diagnóstico médico del paciente"
                        rows={3}
                        className="print:border-none print:p-0 print:resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="antecedentesClinicosRelevantes">Antecedentes Clínicos Relevantes</Label>
                      <Textarea
                        id="antecedentesClinicosRelevantes"
                        name="antecedentesClinicosRelevantes"
                        value={formData.antecedentesClinicosRelevantes}
                        onChange={handleChange}
                        placeholder="Antecedentes clínicos relevantes del paciente"
                        rows={3}
                        className="print:border-none print:p-0 print:resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examenesAuxiliares">Exámenes Auxiliares (Radiografías, Resonancias, etc.)</Label>
                      <Textarea
                        id="examenesAuxiliares"
                        name="examenesAuxiliares"
                        value={formData.examenesAuxiliares}
                        onChange={handleChange}
                        placeholder="Resultados de exámenes auxiliares"
                        rows={3}
                        className="print:border-none print:p-0 print:resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluaciones" className="print:block print:mt-4">
              <Card>
                <CardHeader className="print:pb-2">
                  <CardTitle>Evaluaciones Kinésicas</CardTitle>
                  <CardDescription>Evaluaciones realizadas al paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="evaluacionInicial">Evaluación Inicial*</Label>
                      <Textarea
                        id="evaluacionInicial"
                        name="evaluacionInicial"
                        value={formData.evaluacionInicial}
                        onChange={handleChange}
                        required
                        placeholder="Evaluación kinésica inicial"
                        rows={6}
                        className="print:border-none print:p-0 print:resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evaluacionFinal">Evaluación Final (al alta)</Label>
                      <Textarea
                        id="evaluacionFinal"
                        name="evaluacionFinal"
                        value={formData.evaluacionFinal}
                        onChange={handleChange}
                        placeholder="Evaluación kinésica final"
                        rows={6}
                        className="print:border-none print:p-0 print:resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sesiones" className="print:block print:mt-4">
              <Card>
                <CardHeader className="print:pb-2">
                  <CardTitle>Registro de Prestaciones / Sesiones</CardTitle>
                  <CardDescription>Historial de sesiones del paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formData.sesiones.map((sesion, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg print:border-dashed print:p-2">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`fecha-${index}`}>Fecha {index + 1}</Label>
                            <Input
                              id={`fecha-${index}`}
                              type="date"
                              value={sesion.fecha}
                              onChange={(e) => handleSesionChange(index, "fecha", e.target.value)}
                              required
                              className="print:border-none print:p-0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`observaciones-${index}`}>Prestaciones / Observaciones {index + 1}</Label>
                          <Textarea
                            id={`observaciones-${index}`}
                            value={sesion.observaciones}
                            onChange={(e) => handleSesionChange(index, "observaciones", e.target.value)}
                            placeholder="Detalle de prestaciones y observaciones"
                            rows={3}
                            className="print:border-none print:p-0 print:resize-none"
                          />
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addSesion} className="print:hidden">
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 print:hidden">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/pacientes/${paciente.id}`)}>
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint} className="ml-auto">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button type="button" variant="outline" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          [role="tabpanel"] {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </Layout>
  )
}
