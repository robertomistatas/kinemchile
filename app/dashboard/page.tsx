"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getPacientes, getSesiones, getCitasPorFecha } from "@/lib/firestore"
import type { Paciente, Sesion, Cita } from "@/lib/data"
import { Users, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesActivos: 0,
    totalSesiones: 0,
    sesionesMes: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [proximasCitas, setProximasCitas] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoading(true)
        const ahora = new Date()
        
        // Obtener pacientes, sesiones y citas del día actual
        const [pacientes, sesiones, citasHoy] = await Promise.all([
          getPacientes(), 
          getSesiones(),
          getCitasPorFecha(ahora)
        ])

        const pacientesActivos = pacientes.filter((p: any) => p.activo).length

        // Calcular sesiones del mes actual
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        const sesionesMes = sesiones.filter((s: Sesion) => {
          const fechaSesion = new Date(s.fecha)
          return fechaSesion >= inicioMes
        }).length

        // Formatear las citas para mostrarlas en el dashboard
        const citasFormateadas = citasHoy.map((cita: any) => {
          // Extraer hora de la fecha de la cita
          let hora = "Sin hora"
          if (cita.fecha) {
            const fechaObj = typeof cita.fecha === 'number' 
              ? new Date(cita.fecha) 
              : typeof cita.fecha === 'string' 
                ? new Date(cita.fecha)
                : cita.fecha.toDate ? cita.fecha.toDate() : new Date()
            
            hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          }

          // Formatear nombre del paciente
          const nombrePaciente = `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`
          
          return {
            id: cita.id,
            paciente: nombrePaciente.trim() || 'Paciente sin nombre',
            hora: hora,
            motivo: cita.motivo || 'Sin especificar',
            profesional: cita.profesional_nombre || 'Sin asignar'
          }
        })

        // Ordenar las citas por hora
        citasFormateadas.sort((a: any, b: any) => {
          return a.hora.localeCompare(b.hora)
        })

        // Actualizar el estado
        setProximasCitas(citasFormateadas)
        setStats({
          totalPacientes: pacientes.length,
          pacientesActivos,
          totalSesiones: sesiones.length,
          sesionesMes,
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de gestión de Kinem Chile</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataLoading ? "..." : stats.totalPacientes}</div>
              <p className="text-xs text-muted-foreground">
                {dataLoading ? "..." : stats.pacientesActivos} pacientes activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataLoading ? "..." : stats.totalSesiones}</div>
              <p className="text-xs text-muted-foreground">
                {dataLoading ? "..." : stats.sesionesMes} sesiones este mes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataLoading ? "..." : proximasCitas.length}</div>
              <p className="text-xs text-muted-foreground">Citas para hoy</p>              <div className="mt-4 space-y-3">
                {proximasCitas.length > 0 ? (
                  proximasCitas.map((cita) => (
                    <div key={cita.id} className="flex flex-col gap-1 border-b pb-2 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{cita.hora}</span>
                        <span className="font-medium">{cita.paciente}</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-6">
                        <span className="block">Motivo: {cita.motivo}</span>
                        <span className="block">Prof.: {cita.profesional || 'Sin asignar'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No hay citas programadas para hoy</div>
                )}
                <Button variant="link" size="sm" asChild className="px-0">
                  <Link href="/agenda">Ver todas las citas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
