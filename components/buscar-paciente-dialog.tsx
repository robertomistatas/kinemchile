"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, User, Plus, X, Check, AlertCircle } from "lucide-react"
import { buscarPacientes } from "@/lib/firestore-service"
import type { Paciente } from "@/lib/data"

interface BuscarPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPacienteSeleccionado: (paciente: { 
    id?: string
    nombre: string 
    rut?: string
    tieneFicha: boolean
  }) => void
}

interface PacienteEncontrado extends Paciente {
  tieneFicha: boolean
}

export function BuscarPacienteDialog({ 
  open, 
  onOpenChange, 
  onPacienteSeleccionado 
}: BuscarPacienteDialogProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [pacientesEncontrados, setPacientesEncontrados] = useState<PacienteEncontrado[]>([])
  const [estaBuscando, setEstaBuscando] = useState(false)
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteEncontrado | null>(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [nombreSinFicha, setNombreSinFicha] = useState('')

  // Resetear estado cuando se abre/cierra el dialog
  useEffect(() => {
    if (!open) {
      setTerminoBusqueda('')
      setPacientesEncontrados([])
      setBusquedaRealizada(false)
      setPacienteSeleccionado(null)
      setMostrarConfirmacion(false)
      setNombreSinFicha('')
    }
  }, [open])

  // Búsqueda con debounce
  const buscarPacientesDebounced = useCallback(
    debounce(async (termino: string) => {
      if (termino.trim().length < 2) {
        setPacientesEncontrados([])
        setBusquedaRealizada(false)
        return
      }

      setEstaBuscando(true)
      try {
        const pacientes = await buscarPacientes(termino)
        const pacientesConFicha = pacientes.map(p => ({ ...p, tieneFicha: true }))
        setPacientesEncontrados(pacientesConFicha)
        setBusquedaRealizada(true)
      } catch (error) {
        console.error('Error en la búsqueda:', error)
        setPacientesEncontrados([])
        setBusquedaRealizada(true)
      } finally {
        setEstaBuscando(false)
      }
    }, 500),
    []
  )

  // Realizar búsqueda cuando cambia el término
  useEffect(() => {
    buscarPacientesDebounced(terminoBusqueda)
  }, [terminoBusqueda, buscarPacientesDebounced])

  const seleccionarPaciente = (paciente: PacienteEncontrado) => {
    setPacienteSeleccionado(paciente)
    setMostrarConfirmacion(true)
  }

  const confirmarSeleccion = () => {
    if (pacienteSeleccionado) {
      onPacienteSeleccionado({
        id: pacienteSeleccionado.id,
        nombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
        rut: pacienteSeleccionado.rut,
        tieneFicha: true
      })
      onOpenChange(false)
    }
  }

  const crearSinFicha = () => {
    if (nombreSinFicha.trim()) {
      onPacienteSeleccionado({
        nombre: nombreSinFicha.trim(),
        tieneFicha: false
      })
      onOpenChange(false)
    }
  }

  const irACrearFicha = () => {
    // Aquí podrías redirigir a la página de crear paciente
    // Por ahora, cerraremos el dialog
    alert('Funcionalidad de crear ficha será implementada próximamente')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Buscar Paciente</span>
          </DialogTitle>
        </DialogHeader>

        {!mostrarConfirmacion ? (
          <div className="space-y-4">
            {/* Campo de búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="busqueda">Nombre o RUT del paciente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  placeholder="Ej: Juan Pérez, 12.345.678-9"
                  className="pl-10"
                  autoFocus
                />
              </div>
              {estaBuscando && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Buscando...</span>
                </div>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {busquedaRealizada && (
              <div className="space-y-3">
                {pacientesEncontrados.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Pacientes encontrados ({pacientesEncontrados.length})
                      </h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Con ficha
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {pacientesEncontrados.map((paciente) => (
                        <Card 
                          key={paciente.id} 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => seleccionarPaciente(paciente)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {paciente.nombre} {paciente.apellido}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>RUT: {paciente.rut}</span>
                                    {paciente.telefono && (
                                      <span>Tel: {paciente.telefono}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Seleccionar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron pacientes con el término "{terminoBusqueda}".
                    </AlertDescription>
                  </Alert>
                )}

                {/* Opciones cuando no se encuentra paciente */}
                {pacientesEncontrados.length === 0 && terminoBusqueda.trim().length >= 2 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700">¿Qué deseas hacer?</h3>
                    
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="nombre-sin-ficha">Atender sin ficha</Label>
                        <Input
                          id="nombre-sin-ficha"
                          value={nombreSinFicha}
                          onChange={(e) => setNombreSinFicha(e.target.value)}
                          placeholder="Ingresa solo el nombre del paciente"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={crearSinFicha}
                          disabled={!nombreSinFicha.trim()}
                          className="flex-1"
                          variant="outline"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Atender sin ficha
                        </Button>
                        
                        <Button 
                          onClick={irACrearFicha}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear ficha nueva
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Confirmación de selección */
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                ¿Es este el paciente que deseas agregar a la cola?
              </AlertDescription>
            </Alert>

            {pacienteSeleccionado && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>RUT: {pacienteSeleccionado.rut}</span>
                        {pacienteSeleccionado.telefono && (
                          <span>Tel: {pacienteSeleccionado.telefono}</span>
                        )}
                      </div>
                      <Badge className="mt-1 bg-green-100 text-green-800">
                        Tiene ficha médica
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button 
                onClick={confirmarSeleccion}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar y agregar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Utility function para debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
