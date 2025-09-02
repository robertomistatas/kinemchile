"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { getPacientesInactivos, getPacientesInactivosPorProfesional } from "@/lib/firestore"
import type { Paciente } from "@/lib/data"
import Link from "next/link"

export default function PacientesAltaPage() {
  const { user, userInfo, loading } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [verTodos, setVerTodos] = useState(false)

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

        {dataLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <p>Cargando pacientes...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pacientes.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No hay pacientes dados de alta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {verTodos 
                      ? "No hay pacientes dados de alta en el sistema." 
                      : "No tienes pacientes dados de alta asignados."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              pacientes.map((paciente) => (
                <Card key={paciente.id}>
                  <CardHeader>
                    <CardTitle>{paciente.nombre} {paciente.apellido}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>RUT:</strong> {paciente.rut}</p>
                    <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                    <p><strong>Email:</strong> {paciente.email}</p>
                    <p><strong>Fecha de alta:</strong> {paciente.fechaAlta ? new Date(paciente.fechaAlta).toLocaleDateString() : "-"}</p>
                    
                    {/* Mostrar información del profesional */}
                    {paciente.profesional_alta_nombre && (
                      <p><strong>Dado de alta por:</strong> {paciente.profesional_alta_nombre}</p>
                    )}
                    {paciente.tratante_nombre && !paciente.profesional_alta_nombre && (
                      <p><strong>Tratante:</strong> {paciente.tratante_nombre}</p>
                    )}
                    {paciente.kinesiologo_nombre && !paciente.profesional_alta_nombre && !paciente.tratante_nombre && (
                      <p><strong>Kinesiólogo:</strong> {paciente.kinesiologo_nombre}</p>
                    )}
                    
                    {paciente.notasAlta && <p><strong>Notas de alta:</strong> {paciente.notasAlta}</p>}
                    
                    <div className="flex gap-2 mt-4">
                      <Button asChild variant="outline">
                        <Link href={`/pacientes/${paciente.id}`}>Ver ficha</Link>
                      </Button>
                      <Button asChild variant="secondary">
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
