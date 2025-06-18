"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { collection, getDocs, getDb, addDoc, doc, updateDoc, deleteDoc } from "@/lib/firebase"
import type { Cita } from "@/lib/data"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugCitasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [citasBrutas, setCitasBrutas] = useState<any[]>([])
  const [citasFiltradas, setCitasFiltradas] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (date && citasBrutas.length > 0) {
      filtrarCitasPorFecha(date);
    }
  }, [date, citasBrutas]);

  const filtrarCitasPorFecha = (fecha: Date) => {
    // Crear timestamps para el inicio y fin del día
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);

    const inicioTimestamp = inicioDelDia.getTime();
    const finTimestamp = finDelDia.getTime();
    
    console.log(`Filtrando citas para ${fecha.toLocaleDateString()} (${inicioTimestamp} - ${finTimestamp})`);
    
    // Filtrar las citas que corresponden a la fecha seleccionada
    const citasDelDia = citasBrutas.filter(cita => {
      let fechaCita = cita.fecha;
      
      // Normalizar la fecha según su tipo
      if (typeof fechaCita === 'object' && fechaCita !== null) {
        if (fechaCita.toDate) {
          fechaCita = fechaCita.toDate().getTime();
        } else if (fechaCita.seconds) {
          fechaCita = fechaCita.seconds * 1000;
        } else {
          return false;
        }
      } else if (typeof fechaCita === 'string') {
        fechaCita = new Date(fechaCita).getTime();
      }
      
      // Si es un número, está en formato timestamp
      if (typeof fechaCita === 'number') {
        return fechaCita >= inicioTimestamp && fechaCita <= finTimestamp;
      }
      
      return false;
    });
    
    console.log(`Se encontraron ${citasDelDia.length} citas para el día ${fecha.toLocaleDateString()}`);
    setCitasFiltradas(citasDelDia);
  };

  const fetchTodasLasCitas = async () => {
    try {
      setDataLoading(true);
      console.log("Obteniendo todas las citas de la base de datos...");
      
      const citasRef = collection(getDb(), "citas");
      const snapshot = await getDocs(citasRef);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Se encontraron ${data.length} citas en total`);
      
      // Mostrar detalles de cada cita para depuración
      data.forEach((cita: any, index) => {
        console.log(`Cita ${index + 1}:`);
        console.log(`  ID: ${cita.id}`);
        console.log(`  Fecha (tipo): ${typeof cita.fecha}`);
        console.log(`  Fecha (valor): ${cita.fecha}`);
        if (typeof cita.fecha === 'number') {
          console.log(`  Fecha formateada: ${new Date(cita.fecha).toLocaleString()}`);
        }
        console.log(`  Hora: ${cita.hora}`);
        console.log(`  Estado: ${cita.estado}`);
      });

      setCitasBrutas(data);
      if (date) {
        filtrarCitasPorFecha(date);
      }
      
      setMensaje({
        tipo: 'success',
        texto: `Se encontraron ${data.length} citas en total`
      });
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setMensaje({
        tipo: 'error',
        texto: `Error al cargar citas: ${error}`
      });
    } finally {
      setDataLoading(false);
    }
  };

  const corregirFechasCitas = async () => {
    if (!citasBrutas.length) {
      setMensaje({
        tipo: 'error',
        texto: "No hay citas para corregir. Primero carga las citas."
      });
      return;
    }

    try {
      setDataLoading(true);
      let citasCorregidas = 0;
      
      for (const cita of citasBrutas) {
        let requiereCorreccion = false;
        let fechaCorregida: number = 0;
        
        // Verificar y corregir el formato de fecha
        if (typeof cita.fecha === 'object' && cita.fecha !== null) {
          // Es un objeto Timestamp de Firebase
          if (cita.fecha.toDate) {
            fechaCorregida = cita.fecha.toDate().getTime();
            requiereCorreccion = true;
          } else if (cita.fecha.seconds) {
            fechaCorregida = cita.fecha.seconds * 1000;
            requiereCorreccion = true;
          }
        } else if (typeof cita.fecha === 'string') {
          // Es una cadena de texto
          fechaCorregida = new Date(cita.fecha).getTime();
          requiereCorreccion = true;
        }
        
        // Solo actualizar si se necesita corrección y tenemos un valor numérico válido
        if (requiereCorreccion && !isNaN(fechaCorregida) && fechaCorregida > 0) {
          const citaRef = doc(getDb(), "citas", cita.id);
          await updateDoc(citaRef, {
            fecha: fechaCorregida
          });
          citasCorregidas++;
        }
      }
      
      setMensaje({
        tipo: 'success',
        texto: `Se corrigieron ${citasCorregidas} citas`
      });
      
      // Recargar las citas después de la corrección
      await fetchTodasLasCitas();
    } catch (error) {
      console.error("Error al corregir citas:", error);
      setMensaje({
        tipo: 'error',
        texto: `Error al corregir citas: ${error}`
      });
    } finally {
      setDataLoading(false);
    }
  };
  
  const crearCitaDePrueba = async () => {
    if (!date) {
      setMensaje({
        tipo: 'error',
        texto: "Selecciona una fecha para la cita de prueba"
      });
      return;
    }
    
    try {
      setDataLoading(true);
      
      // Crear timestamp para la fecha seleccionada al mediodía
      const fechaCita = new Date(date);
      fechaCita.setHours(12, 0, 0, 0);
      const timestamp = fechaCita.getTime();
      
      // Datos de la cita de prueba
      const citaData = {
        pacienteId: "paciente-prueba-123",
        paciente: {
          id: "paciente-prueba-123",
          nombre: "Paciente",
          apellido: "De Prueba",
          rut: "12345678-9"
        },
        fecha: timestamp, // Guardamos como timestamp numérico
        hora: "12:00",
        motivo: "Cita de prueba creada desde la herramienta de diagnóstico",
        prevision: "Fonasa",
        duracion: 60,
        estado: "programada",
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(getDb(), "citas"), citaData);
      
      setMensaje({
        tipo: 'success',
        texto: `Cita de prueba creada con ID: ${docRef.id}`
      });
      
      // Recargar las citas
      await fetchTodasLasCitas();
    } catch (error) {
      console.error("Error al crear cita de prueba:", error);
      setMensaje({
        tipo: 'error',
        texto: `Error al crear cita de prueba: ${error}`
      });
    } finally {
      setDataLoading(false);
    }
  };
  
  const volver = () => {
    router.push("/agenda");
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Depuración de Citas</h1>
            <p className="text-sm text-muted-foreground">Herramienta para verificar y corregir citas en Firestore</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={volver} variant="outline">
              Volver a Agenda
            </Button>
            <Button onClick={fetchTodasLasCitas} disabled={dataLoading}>
              {dataLoading ? "Cargando..." : "Cargar todas las citas"}
            </Button>
          </div>
        </div>
        
        {mensaje && (
          <Alert className={mensaje.tipo === 'error' ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}>
            <AlertDescription>{mensaje.texto}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Selecciona una fecha para filtrar las citas</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" initialFocus />
              
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={corregirFechasCitas}
                    disabled={dataLoading || !citasBrutas.length}
                    variant="outline"
                    className="flex-1"
                  >
                    Corregir formato de fechas
                  </Button>
                  
                  <Button
                    onClick={crearCitaDePrueba}
                    disabled={dataLoading || !date}
                    className="flex-1"
                  >
                    Crear cita de prueba
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  <p><strong>Fecha seleccionada:</strong> {date?.toLocaleDateString()}</p>
                  <p><strong>Timestamp:</strong> {date?.getTime()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Citas de la fecha seleccionada</CardTitle>
              <CardDescription>
                {date ? `${date?.toLocaleDateString()} - ${citasFiltradas.length} citas encontradas` : "Selecciona una fecha"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {citasFiltradas.length === 0 ? (
                <p className="text-muted-foreground">No hay citas para esta fecha o no se han cargado los datos</p>
              ) : (
                <div className="space-y-4">
                  {citasFiltradas.map((cita) => (
                    <div key={cita.id} className="rounded-md border p-4">
                      <div className="grid grid-cols-1 gap-2">
                        <p><strong>ID:</strong> {cita.id}</p>
                        <p>
                          <strong>Fecha (Valor):</strong> {cita.fecha ? cita.fecha.toString() : 'No disponible'}
                        </p>
                        <p>
                          <strong>Fecha (Tipo):</strong> {typeof cita.fecha}
                        </p>
                        <p>
                          <strong>Fecha formateada:</strong> {typeof cita.fecha === 'number' 
                            ? new Date(cita.fecha).toLocaleString() 
                            : typeof cita.fecha === 'object' && cita.fecha !== null && cita.fecha.toDate 
                              ? cita.fecha.toDate().toLocaleString()
                              : 'Formato no reconocido'}
                        </p>
                        <p><strong>Hora:</strong> {cita.hora}</p>
                        <p><strong>Estado:</strong> {cita.estado}</p>
                        <p>
                          <strong>Paciente:</strong> {cita.paciente 
                            ? `${cita.paciente.nombre} ${cita.paciente.apellido}` 
                            : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todas las citas en la base de datos</CardTitle>
            <CardDescription>Se muestran todas las citas sin filtrar - Total: {citasBrutas.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {citasBrutas.length === 0 ? (
              <p className="text-muted-foreground">Haz clic en "Cargar todas las citas" para ver los datos</p>
            ) : (
              <div className="space-y-4">
                {citasBrutas.map((cita) => (
                  <div key={cita.id} className="rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p><strong>ID:</strong> {cita.id}</p>
                        <p>
                          <strong>Fecha (Tipo):</strong> {typeof cita.fecha}
                        </p>
                        <p>
                          <strong>Fecha (Valor):</strong> {cita.fecha ? cita.fecha.toString() : 'No disponible'}
                        </p>
                        <p>
                          <strong>Fecha formateada:</strong> {typeof cita.fecha === 'number' 
                            ? new Date(cita.fecha).toLocaleString() 
                            : typeof cita.fecha === 'object' && cita.fecha !== null && cita.fecha.toDate 
                              ? cita.fecha.toDate().toLocaleString()
                              : 'Formato no reconocido'}
                        </p>
                      </div>
                      <div>
                        <p><strong>Hora:</strong> {cita.hora}</p>
                        <p><strong>Estado:</strong> {cita.estado}</p>
                        <p><strong>Paciente ID:</strong> {cita.pacienteId}</p>
                        <p>
                          <strong>Paciente:</strong> {cita.paciente 
                            ? `${cita.paciente.nombre} ${cita.paciente.apellido}` 
                            : 'No disponible'}
                        </p>
                        <p><strong>Creado:</strong> {
                          cita.createdAt
                            ? typeof cita.createdAt === 'number'
                              ? new Date(cita.createdAt).toLocaleString()
                              : typeof cita.createdAt === 'object' && cita.createdAt !== null && cita.createdAt.toDate
                                ? cita.createdAt.toDate().toLocaleString()
                                : cita.createdAt.toString()
                            : 'No disponible'
                        }</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}