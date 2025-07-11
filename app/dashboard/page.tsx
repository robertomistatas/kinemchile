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
  // Todos los hooks deben ir antes de cualquier return condicional
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesActivos: 0,
    totalSesiones: 0,
    sesionesMes: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [proximasCitas, setProximasCitas] = useState<any[]>([]);
  const [saludo, setSaludo] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoading(true);
        const ahora = new Date();
        const [pacientes, sesiones, citasHoy] = await Promise.all([
          getPacientes(),
          getSesiones(),
          getCitasPorFecha(ahora),
        ]);
        // Filtrar según el rol del usuario
        let citasFiltradas = citasHoy;
        let sesionesFiltradas = sesiones;
        let pacientesFiltrados = pacientes;
        if (userInfo && userInfo.rol === "kinesiologa") {
          // Solo citas/sesiones donde el profesional es el usuario logueado
          citasFiltradas = citasHoy.filter((c: any) =>
            c.profesional_id === userInfo.id || c.profesional_nombre === userInfo.nombre
          );
          sesionesFiltradas = sesiones.filter((s: any) =>
            s.kinesiologo_id === userInfo.id || s.kinesiologo_nombre === userInfo.nombre
          );
          pacientesFiltrados = pacientes.filter((p: any) =>
            p.tratante_id === userInfo.id || p.tratante_nombre === userInfo.nombre
          );
        }

        const pacientesActivos = pacientesFiltrados.filter((p: any) => p.activo).length;
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const sesionesMes = sesionesFiltradas.filter((s: Sesion) => {
          const fechaSesion = new Date(s.fecha);
          return fechaSesion >= inicioMes;
        }).length;

        // Formatear las citas para mostrarlas en el dashboard
        const citasFormateadas = citasFiltradas.map((cita: any) => {
          let hora = "Sin hora";
          if (cita.fecha) {
            const fechaObj = typeof cita.fecha === 'number'
              ? new Date(cita.fecha)
              : typeof cita.fecha === 'string'
                ? new Date(cita.fecha)
                : cita.fecha.toDate
                  ? cita.fecha.toDate()
                  : new Date();
            hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          }
          let nombrePaciente = '';
          if (cita.paciente_nombre) {
            nombrePaciente = `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`
          } else if (cita.paciente && typeof cita.paciente === 'object') {
            nombrePaciente = `${cita.paciente.nombre || ''} ${cita.paciente.apellido || ''}`
          }
          const profesional = cita.profesional_nombre ||
            (cita.profesional_id ? 'Prof. ID: ' + cita.profesional_id : 'Sin asignar')
          return {
            id: cita.id,
            paciente: nombrePaciente.trim() || 'Paciente sin nombre',
            hora: hora,
            motivo: cita.motivo || 'Sin especificar',
            profesional: profesional
          }
        })
        citasFormateadas.sort((a: any, b: any) => a.hora.localeCompare(b.hora))
        setProximasCitas(citasFormateadas)
        setStats({
          totalPacientes: pacientesFiltrados.length,
          pacientesActivos,
          totalSesiones: sesionesFiltradas.length,
          sesionesMes,
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setDataLoading(false)
      }
    }
    if (user && userInfo) {
      fetchData()
    }
  }, [user, userInfo])

  useEffect(() => {
    // Saludo personalizado solo en cliente para evitar hydration mismatch
    const hora = new Date().getHours();
    if (hora < 12) setSaludo("Buenos días");
    else if (hora < 20) setSaludo("Buenas tardes");
    else setSaludo("Buenas noches");
  }, []);

  if (loading || !user || !userInfo) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{saludo && userInfo ? `${saludo}, ${userInfo.nombre}` : "Dashboard"}</h1>
          <p className="text-muted-foreground">Este es tu panel de gestión personalizado</p>
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
