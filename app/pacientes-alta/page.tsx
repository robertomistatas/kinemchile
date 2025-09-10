"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPacientesInactivos, getPacientesInactivosPorProfesional } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import { Search, Filter, X } from "lucide-react"
import Link from "next/link"

export default function PacientesAltaPage() {
  const { user, userInfo, loading } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [verTodos, setVerTodos] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  const cargarPacientes = async (mostrarTodos = false) => {
    if (!user?.uid || !userInfo?.nombre) {
      console.log("❌ [PACIENTES-ALTA] No hay usuario autenticado o falta información del profesional")
      console.log(`   user.uid: ${user?.uid}`)
      console.log(`   userInfo.nombre: ${userInfo?.nombre}`)
      return
    }
    
    setDataLoading(true)
    try {
      console.log(`🔍 [PACIENTES-ALTA] Iniciando carga de pacientes...`)
      console.log(`👤 [PACIENTES-ALTA] Usuario: UID=${user.uid}`)
      console.log(`👤 [PACIENTES-ALTA] Usuario: displayName=${user.displayName}`)
      console.log(`👤 [PACIENTES-ALTA] Usuario: email=${user.email}`)
      console.log(`👩‍⚕️ [PACIENTES-ALTA] Profesional: nombre=${userInfo.nombre}`)
      console.log(`👩‍⚕️ [PACIENTES-ALTA] Profesional: función=${userInfo.funcion}`)
      console.log(`⚙️ [PACIENTES-ALTA] Modo: ${mostrarTodos ? 'TODOS LOS PACIENTES' : 'MIS PACIENTES'}`)
      
      let data: Paciente[] = []
      
      if (mostrarTodos) {
        console.log('📋 [PACIENTES-ALTA] Obteniendo TODOS los pacientes inactivos...')
        data = await getPacientesInactivos()
      } else {
        console.log(`🎯 [PACIENTES-ALTA] Obteniendo pacientes inactivos del profesional: ${userInfo.nombre}`)
        data = await getPacientesInactivosPorProfesional(userInfo.nombre)
      }
      
      console.log(`📊 [PACIENTES-ALTA] Resultado: ${data.length} pacientes obtenidos`)
      if (data.length > 0) {
        console.log(`📋 [PACIENTES-ALTA] Pacientes encontrados:`)
        data.forEach((p, i) => {
          console.log(`   ${i+1}. ${p.nombre} ${p.apellido} - Alta por: ${p.profesional_alta_nombre || 'N/A'}`)
        })
      } else {
        console.log(`❌ [PACIENTES-ALTA] No se encontraron pacientes`)
        if (!mostrarTodos) {
          console.log(`💡 [PACIENTES-ALTA] Sugerencia: Verificar que el profesional ${userInfo.nombre} tenga pacientes dados de alta asignados`)
        }
      }
      
      setPacientes(data)
      setPacientesFiltrados(data)
    } catch (error) {
      console.error("💥 [PACIENTES-ALTA] Error al cargar pacientes dados de alta:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (user && userInfo) {
      cargarPacientes(verTodos)
    }
  }, [user, userInfo, verTodos])

  const handleToggleVerTodos = () => {
    const nuevoVerTodos = !verTodos
    setVerTodos(nuevoVerTodos)
    cargarPacientes(nuevoVerTodos)
  }

  // Función para filtrar pacientes según la búsqueda
  const filtrarPacientes = (textoBusqueda: string) => {
    if (!textoBusqueda.trim()) {
      setPacientesFiltrados(pacientes)
      return
    }

    const busquedaLower = textoBusqueda.toLowerCase().trim()
    const pacientesFiltrados = pacientes.filter(paciente => {
      // Buscar por nombre completo
      const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase()
      if (nombreCompleto.includes(busquedaLower)) return true

      // Buscar por nombre parcial
      if (paciente.nombre.toLowerCase().includes(busquedaLower)) return true
      if (paciente.apellido.toLowerCase().includes(busquedaLower)) return true

      // Buscar por RUT (con o sin puntos y guión)
      const rutLimpio = paciente.rut.replace(/[.-]/g, '').toLowerCase()
      const busquedaRutLimpio = busquedaLower.replace(/[.-]/g, '')
      if (rutLimpio.includes(busquedaRutLimpio)) return true

      return false
    })

    setPacientesFiltrados(pacientesFiltrados)
  }

  // Efecto para filtrar cuando cambia la búsqueda o los pacientes
  useEffect(() => {
    filtrarPacientes(busqueda)
  }, [busqueda, pacientes])

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value)
  }

  const limpiarBusqueda = () => {
    setBusqueda("")
  }

  if (loading || !user) return null

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes de Alta</h1>
            <p className="text-sm text-muted-foreground">
              {verTodos 
                ? "Mostrando todos los pacientes dados de alta" 
                : "Mostrando tus pacientes dados de alta"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleToggleVerTodos} variant="outline">
              {verTodos ? "Ver mis pacientes" : "Ver todos"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/pacientes">Volver a Pacientes</Link>
            </Button>
          </div>
        </div>

        {/* Buscador de pacientes dados de alta */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
              <Input
                type="text"
                placeholder="Buscar pacientes por nombre, apellido o RUT..."
                value={busqueda}
                onChange={handleBusquedaChange}
                className="pl-10 pr-10 border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900"
              />
              {busqueda && (
                <Button
                  onClick={limpiarBusqueda}
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <X className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
            {busqueda && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
              </p>
            )}
          </CardContent>
        </Card>

        {dataLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <p>Cargando pacientes...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
            {pacientesFiltrados.length === 0 ? (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>
                    {busqueda ? "No se encontraron pacientes" : "No hay pacientes dados de alta"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {busqueda 
                      ? `No se encontraron pacientes que coincidan con "${busqueda}"` 
                      : verTodos 
                        ? "No hay pacientes dados de alta en el sistema." 
                        : "No tienes pacientes dados de alta asignados."
                    }
                  </p>
                  {busqueda && (
                    <Button 
                      onClick={limpiarBusqueda} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              pacientesFiltrados.map((paciente) => (
                <Card key={paciente.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                  <CardContent className="p-6">
                    {/* Header con nombre y estado */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {paciente.nombre.toUpperCase()} {paciente.apellido.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-2 w-2 rounded-full bg-red-400"></div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">Dado de Alta</span>
                        </div>
                      </div>
                    </div>

                    {/* Información principal en dos columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">RUT</span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{paciente.rut}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{paciente.telefono}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm break-all">{paciente.email}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de alta</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{paciente.fechaAlta ? new Date(paciente.fechaAlta).toLocaleDateString() : "-"}</p>
                      </div>
                    </div>

                    {/* Información del profesional */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Tratante</span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-300 font-medium">
                        {paciente.profesional_alta_nombre || 
                         paciente.tratante_nombre || 
                         paciente.kinesiologo_nombre || 
                         "No especificado"}
                      </p>
                    </div>

                    {/* Notas de alta */}
                    {paciente.notasAlta && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Notas de alta</span>
                        </div>
                        <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">{paciente.notasAlta}</p>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-2">
                      <Button asChild variant="outline" className="flex-1 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                        <Link href={`/pacientes/${paciente.id}`}>Ver ficha</Link>
                      </Button>
                      <Button asChild variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Link href={`/pacientes/${paciente.id}?reactivar=1`}>Quitar alta</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
