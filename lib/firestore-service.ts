"use client"

import {
  initFirebase,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  deleteField,
} from "@/lib/firebase"
import type { Paciente, Sesion, Cita } from "./data"

// Función para obtener la instancia de Firestore
function getDb() {
  const { db: firestore } = initFirebase()
  if (!firestore) {
    console.error("Firestore no está inicializado")
  }
  return firestore
}

// Funciones para pacientes
export async function getPacientes(): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo pacientes...")
    const pacientesRef = collection(firestore, "pacientes")
    const snapshot = await getDocs(pacientesRef)

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      // Asegurarse de que todos los campos requeridos existan
      return {
        id: doc.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        rut: data.rut || "",
        email: data.email || "",
        telefono: data.telefono || "",
        fechaNacimiento: data.fechaNacimiento || "",
        direccion: data.direccion || "",
        diagnostico: data.diagnostico || data.diagnosticoMedico || "",
        antecedentesPersonales: data.antecedentesPersonales || data.antecedentesClinicosRelevantes || "",
        activo: typeof data.activo === "boolean" ? data.activo : true,
        createdAt: data.createdAt || Date.now(),
        fechaAlta: data.fechaAlta || null,
        notasAlta: data.notasAlta || null,
        prevision: data.prevision || "",
      } as Paciente
    })
  } catch (error) {
    console.error("Error al obtener pacientes:", error)
    return []
  }
}

export async function getPacientesActivos(): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo pacientes activos...")
    const pacientesRef = collection(firestore, "pacientes")
    const q = query(pacientesRef, where("activo", "==", true), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paciente[]
  } catch (error) {
    console.error("Error al obtener pacientes activos:", error)
    return []
  }
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  const firestore = getDb()
  if (!firestore) return null

  try {
    console.log(`Obteniendo paciente con ID: ${id}`)
    const docRef = doc(firestore, "pacientes", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log("Datos del paciente:", data)

      // Asegurarse de que todos los campos requeridos existan
      const paciente: Paciente = {
        id: docSnap.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        rut: data.rut || "",
        email: data.email || "",
        telefono: data.telefono || "",
        fechaNacimiento: data.fechaNacimiento || "",
        direccion: data.direccion || "",
        diagnostico: data.diagnostico || data.diagnosticoMedico || "",
        diagnosticoMedico: data.diagnosticoMedico || "",
        antecedentesPersonales: data.antecedentesPersonales || "",
        antecedentesClinicosRelevantes: data.antecedentesClinicosRelevantes || "",
        evaluacionInicial: data.evaluacionInicial || "",
        evaluacionFinal: data.evaluacionFinal || "",
        examenesAuxiliares: data.examenesAuxiliares || "",
        fechaInicio: data.fechaInicio || "",
        fechaAlta: data.fechaAlta || "",
        notasAlta: data.notasAlta || "",
        edad: data.edad || "",
        genero: data.genero || "",
        prevision: data.prevision || "",
        oda: data.oda || "",
        patologias: data.patologias || [],
        sesiones: data.sesiones || [],
        activo: typeof data.activo === "boolean" ? data.activo : true,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || null,
      }

      return paciente
    }

    // Si no se encuentra el paciente, intentar buscar por RUT
    console.log("Paciente no encontrado por ID, intentando buscar por otros medios...")

    // Intentar buscar por RUT si el ID parece ser un RUT
    if (id.includes(".") || id.includes("-")) {
      console.log("El ID parece ser un RUT, buscando por RUT...")
      const rutLimpio = id.replace(/\./g, "").replace(/-/g, "")

      const pacientesRef = collection(firestore, "pacientes")
      const q = query(pacientesRef, where("rut", "==", id))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const data = doc.data()

        return {
          id: doc.id,
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          rut: data.rut || "",
          email: data.email || "",
          telefono: data.telefono || "",
          fechaNacimiento: data.fechaNacimiento || "",
          direccion: data.direccion || "",
          diagnostico: data.diagnostico || data.diagnosticoMedico || "",
          diagnosticoMedico: data.diagnosticoMedico || "",
          antecedentesPersonales: data.antecedentesPersonales || "",
          antecedentesClinicosRelevantes: data.antecedentesClinicosRelevantes || "",
          evaluacionInicial: data.evaluacionInicial || "",
          evaluacionFinal: data.evaluacionFinal || "",
          examenesAuxiliares: data.examenesAuxiliares || "",
          fechaInicio: data.fechaInicio || "",
          fechaAlta: data.fechaAlta || "",
          notasAlta: data.notasAlta || "",
          edad: data.edad || "",
          genero: data.genero || "",
          prevision: data.prevision || "",
          oda: data.oda || "",
          patologias: data.patologias || [],
          sesiones: data.sesiones || [],
          activo: typeof data.activo === "boolean" ? data.activo : true,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || null,
        }
      }
    }

    // Como último recurso, obtener todos los pacientes y buscar por coincidencia parcial
    console.log("Intentando buscar paciente en toda la colección...")
    const pacientesRef = collection(firestore, "pacientes")
    const snapshot = await getDocs(pacientesRef)

    // Buscar coincidencia por ID parcial (por si el ID está truncado o formateado diferente)
    const pacienteEncontrado = snapshot.docs.find((doc) => doc.id === id || doc.id.includes(id) || id.includes(doc.id))

    if (pacienteEncontrado) {
      const data = pacienteEncontrado.data()

      return {
        id: pacienteEncontrado.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        rut: data.rut || "",
        email: data.email || "",
        telefono: data.telefono || "",
        fechaNacimiento: data.fechaNacimiento || "",
        direccion: data.direccion || "",
        diagnostico: data.diagnostico || data.diagnosticoMedico || "",
        diagnosticoMedico: data.diagnosticoMedico || "",
        antecedentesPersonales: data.antecedentesPersonales || "",
        antecedentesClinicosRelevantes: data.antecedentesClinicosRelevantes || "",
        evaluacionInicial: data.evaluacionInicial || "",
        evaluacionFinal: data.evaluacionFinal || "",
        examenesAuxiliares: data.examenesAuxiliares || "",
        fechaInicio: data.fechaInicio || "",
        fechaAlta: data.fechaAlta || "",
        notasAlta: data.notasAlta || "",
        edad: data.edad || "",
        genero: data.genero || "",
        prevision: data.prevision || "",
        oda: data.oda || "",
        patologias: data.patologias || [],
        sesiones: data.sesiones || [],
        activo: typeof data.activo === "boolean" ? data.activo : true,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || null,
      }
    }

    return null
  } catch (error) {
    console.error("Error al obtener paciente:", error)
    return null
  }
}

export async function crearPaciente(paciente: Omit<Paciente, "id" | "createdAt" | "activo">) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nuevo paciente...")
    const pacienteData = {
      ...paciente,
      activo: true,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(firestore, "pacientes"), pacienteData)
    console.log(`Paciente creado con ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error("Error al crear paciente:", error)
    throw error
  }
}

export async function actualizarPaciente(id: string, paciente: Partial<Omit<Paciente, "id" | "createdAt">>) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Actualizando paciente con ID: ${id}`)
    const docRef = doc(firestore, "pacientes", id)

    // Convertir valores null a deleteField() para eliminar el campo
    const updateData = { ...paciente }
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null) {
        updateData[key] = deleteField()
      }
    })

    await updateDoc(docRef, updateData)
    console.log("Paciente actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar paciente:", error)
    throw error
  }
}

export async function darDeAltaPaciente(id: string, notas: string) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Dando de alta al paciente con ID: ${id}`)
    const docRef = doc(firestore, "pacientes", id)
    await updateDoc(docRef, {
      activo: false,
      fechaAlta: new Date().toISOString(),
      notasAlta: notas,
    })
    console.log("Paciente dado de alta correctamente")
  } catch (error) {
    console.error("Error al dar de alta paciente:", error)
    throw error
  }
}

export async function eliminarPaciente(id: string) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Eliminando paciente con ID: ${id}`)
    const docRef = doc(firestore, "pacientes", id)
    await deleteDoc(docRef)
    console.log("Paciente eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar paciente:", error)
    throw error
  }
}

// Funciones para sesiones
export async function getSesiones(): Promise<Sesion[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo sesiones...")
    const sesionesRef = collection(firestore, "sesiones")
    const q = query(sesionesRef, orderBy("fecha", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      // Asegurarse de que la fecha sea un número o string
      const fecha = typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha

      return {
        id: doc.id,
        ...data,
        fecha,
      }
    }) as Sesion[]
  } catch (error) {
    console.error("Error al obtener sesiones:", error)
    return []
  }
}

export async function getSesion(id: string): Promise<Sesion | null> {
  const firestore = getDb()
  if (!firestore) return null

  try {
    console.log(`Obteniendo sesión con ID: ${id}`)
    const docRef = doc(firestore, "sesiones", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      // Asegurarse de que la fecha sea un número o string
      const fecha = typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha

      return {
        id: docSnap.id,
        ...data,
        fecha,
      } as Sesion
    }

    return null
  } catch (error) {
    console.error("Error al obtener sesión:", error)
    return null
  }
}

export async function getSesionesPaciente(pacienteId: string): Promise<Sesion[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo sesiones del paciente con ID: ${pacienteId}`)

    // Verificar que el ID del paciente sea válido
    if (!pacienteId || pacienteId.trim() === "") {
      console.error("ID de paciente inválido")
      return []
    }

    // IMPORTANTE: Vamos a probar con ambos formatos de ID para asegurar compatibilidad
    const sesionesRef = collection(firestore, "sesiones")

    // Primero intentamos con el ID exacto
    const q1 = query(sesionesRef, where("pacienteId", "==", pacienteId))

    console.log("Ejecutando consulta de sesiones con ID exacto...")
    const snapshot1 = await getDocs(q1)
    console.log(`Se encontraron ${snapshot1.docs.length} sesiones para el paciente con ID exacto ${pacienteId}`)

    // Si no encontramos nada, intentamos buscar en el objeto paciente.id
    let sesiones = []
    if (snapshot1.docs.length === 0) {
      console.log("Intentando buscar por paciente.id...")
      const q2 = query(sesionesRef, where("paciente.id", "==", pacienteId))
      const snapshot2 = await getDocs(q2)
      console.log(`Se encontraron ${snapshot2.docs.length} sesiones para el paciente con paciente.id ${pacienteId}`)

      sesiones = snapshot2.docs
    } else {
      sesiones = snapshot1.docs
    }

    // Convertir los documentos a objetos Sesion
    return sesiones.map((doc) => {
      const data = doc.data()
      console.log(`Datos de sesión ${doc.id}:`, data)

      // Asegurarse de que la fecha sea un número o string
      let fecha = data.fecha
      if (typeof data.fecha === "object" && data.fecha !== null) {
        if (data.fecha.toDate) {
          fecha = data.fecha.toDate().getTime()
        } else if (data.fecha.seconds) {
          fecha = data.fecha.seconds * 1000
        }
      }

      return {
        id: doc.id,
        ...data,
        fecha,
      }
    }) as Sesion[]
  } catch (error) {
    console.error("Error al obtener sesiones del paciente:", error)
    return []
  }
}

export async function crearSesion(sesion: Omit<Sesion, "id" | "createdAt">) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nueva sesión con datos:", JSON.stringify(sesion))

    // Asegurarse de que la fecha sea un timestamp
    let fechaTimestamp = sesion.fecha
    if (typeof sesion.fecha === "string") {
      fechaTimestamp = new Date(sesion.fecha).getTime()
    }

    // Asegurarse de que el pacienteId sea una cadena
    const pacienteId = String(sesion.pacienteId)

    const sesionData = {
      ...sesion,
      fecha: fechaTimestamp,
      pacienteId: pacienteId,
      createdAt: serverTimestamp(),
    }

    console.log("Datos finales de la sesión a guardar:", sesionData)
    const docRef = await addDoc(collection(firestore, "sesiones"), sesionData)
    console.log(`Sesión creada con ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error("Error al crear sesión:", error)
    throw error
  }
}

export async function actualizarSesion(id: string, sesion: Partial<Omit<Sesion, "id" | "createdAt">>) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Actualizando sesión con ID: ${id}`)
    const docRef = doc(firestore, "sesiones", id)
    await updateDoc(docRef, sesion)
    console.log("Sesión actualizada correctamente")
  } catch (error) {
    console.error("Error al actualizar sesión:", error)
    throw error
  }
}

export async function eliminarSesion(id: string) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Eliminando sesión con ID: ${id}`)
    const docRef = doc(firestore, "sesiones", id)
    await deleteDoc(docRef)
    console.log("Sesión eliminada correctamente")
  } catch (error) {
    console.error("Error al eliminar sesión:", error)
    throw error
  }
}

// Funciones para citas
export async function getCitas(): Promise<Cita[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo citas...")
    const citasRef = collection(firestore, "citas")
    const q = query(citasRef, orderBy("fecha", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      // Asegurarse de que la fecha sea un número
      const fecha = typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha

      return {
        id: doc.id,
        ...data,
        fecha,
      }
    }) as Cita[]
  } catch (error) {
    console.error("Error al obtener citas:", error)
    return []
  }
}

export async function getCitasPorFecha(fecha: Date): Promise<Cita[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo citas para la fecha: ${fecha.toLocaleDateString()}`)

    // Crear timestamps para el inicio y fin del día
    const inicioDelDia = new Date(fecha)
    inicioDelDia.setHours(0, 0, 0, 0)
    const finDelDia = new Date(fecha)
    finDelDia.setHours(23, 59, 59, 999)

    const inicioTimestamp = inicioDelDia.getTime()
    const finTimestamp = finDelDia.getTime()

    const citasRef = collection(firestore, "citas")
    const q = query(
      citasRef,
      where("fecha", ">=", inicioTimestamp),
      where("fecha", "<=", finTimestamp),
      orderBy("fecha", "asc"),
    )

    const snapshot = await getDocs(q)
    console.log(`Se encontraron ${snapshot.docs.length} citas para la fecha ${fecha.toLocaleDateString()}`)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        fecha: typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha,
      }
    }) as Cita[]
  } catch (error) {
    console.error(`Error al obtener citas para la fecha ${fecha.toLocaleDateString()}:`, error)
    return []
  }
}

export async function getCitasPaciente(pacienteId: string): Promise<Cita[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo citas del paciente con ID: ${pacienteId}`)

    // Verificar que el ID del paciente sea válido
    if (!pacienteId || pacienteId.trim() === "") {
      console.error("ID de paciente inválido")
      return []
    }

    const citasRef = collection(firestore, "citas")

    // Intentamos con el ID exacto
    const q = query(citasRef, where("pacienteId", "==", pacienteId), orderBy("fecha", "desc"))

    const snapshot = await getDocs(q)
    console.log(`Se encontraron ${snapshot.docs.length} citas para el paciente con ID ${pacienteId}`)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        fecha: typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha,
      }
    }) as Cita[]
  } catch (error) {
    console.error(`Error al obtener citas del paciente ${pacienteId}:`, error)
    return []
  }
}

export async function getCita(id: string): Promise<Cita | null> {
  const firestore = getDb()
  if (!firestore) return null

  try {
    console.log(`Obteniendo cita con ID: ${id}`)
    const docRef = doc(firestore, "citas", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      // Asegurarse de que la fecha sea un número
      const fecha = typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha

      return {
        id: docSnap.id,
        ...data,
        fecha,
      } as Cita
    }

    return null
  } catch (error) {
    console.error("Error al obtener cita:", error)
    return null
  }
}

export async function crearCita(cita: Omit<Cita, "id" | "createdAt" | "estado" | "updatedAt">): Promise<string> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nueva cita con datos:", JSON.stringify(cita))

    // Asegurarse de que la fecha sea un timestamp
    let fechaTimestamp = cita.fecha
    if (typeof cita.fecha === "string") {
      fechaTimestamp = new Date(cita.fecha).getTime()
    }

    // Asegurarse de que el pacienteId sea una cadena
    const pacienteId = String(cita.pacienteId)

    const citaData = {
      ...cita,
      fecha: fechaTimestamp,
      pacienteId: pacienteId,
      estado: "programada",
      createdAt: serverTimestamp(),
    }

    console.log("Datos finales de la cita a guardar:", citaData)
    const docRef = await addDoc(collection(firestore, "citas"), citaData)
    console.log(`Cita creada con ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error("Error al crear cita:", error)
    throw error
  }
}

export async function actualizarCita(id: string, cita: Partial<Omit<Cita, "id" | "createdAt">>): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Actualizando cita con ID: ${id}`)
    const docRef = doc(firestore, "citas", id)

    // Añadir timestamp de actualización
    const dataToUpdate = {
      ...cita,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, dataToUpdate)
    console.log("Cita actualizada correctamente")
  } catch (error) {
    console.error("Error al actualizar cita:", error)
    throw error
  }
}

export async function cambiarEstadoCita(id: string, estado: "programada" | "completada" | "cancelada"): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Cambiando estado de la cita ${id} a: ${estado}`)
    const docRef = doc(firestore, "citas", id)

    await updateDoc(docRef, {
      estado,
      updatedAt: serverTimestamp(),
    })

    console.log(`Estado de la cita ${id} actualizado a: ${estado}`)
  } catch (error) {
    console.error(`Error al cambiar estado de la cita ${id}:`, error)
    throw error
  }
}

export async function eliminarCita(id: string): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Eliminando cita con ID: ${id}`)
    const docRef = doc(firestore, "citas", id)
    await deleteDoc(docRef)
    console.log("Cita eliminada correctamente")
  } catch (error) {
    console.error("Error al eliminar cita:", error)
    throw error
  }
}

// Función de depuración para verificar la estructura de la colección de sesiones
export async function debugSesiones() {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Depurando colección de sesiones...")
    const sesionesRef = collection(firestore, "sesiones")
    const snapshot = await getDocs(sesionesRef)

    console.log(`Total de sesiones en la colección: ${snapshot.docs.length}`)

    const sesiones = snapshot.docs.map((doc) => {
      const data = doc.data()

      // Extraer información relevante para depuración
      let fechaInfo = "desconocido"
      if (data.fecha) {
        if (typeof data.fecha === "number") {
          fechaInfo = `número: ${data.fecha} (${new Date(data.fecha).toLocaleString()})`
        } else if (typeof data.fecha === "string") {
          fechaInfo = `string: ${data.fecha}`
        } else if (typeof data.fecha === "object") {
          if (data.fecha.toDate) {
            fechaInfo = `timestamp: ${data.fecha.toDate().toLocaleString()}`
          } else if (data.fecha.seconds) {
            fechaInfo = `firestore timestamp: ${new Date(data.fecha.seconds * 1000).toLocaleString()}`
          } else {
            fechaInfo = `objeto: ${JSON.stringify(data.fecha)}`
          }
        }
      }

      // Extraer información del paciente
      let pacienteInfo = "desconocido"
      if (data.paciente) {
        pacienteInfo = `id: ${data.paciente.id || "N/A"}, nombre: ${data.paciente.nombre || "N/A"} ${data.paciente.apellido || "N/A"}, rut: ${data.paciente.rut || "N/A"}`
      }

      return {
        id: doc.id,
        ...data,
        _debug: {
          fechaInfo,
          pacienteInfo,
          pacienteIdTipo: typeof data.pacienteId,
          tipoSesion: data.tipo || "N/A",
        },
      }
    })

    console.log("Estructura de sesiones:", sesiones)
    return sesiones
  } catch (error) {
    console.error("Error al depurar sesiones:", error)
    return []
  }
}

// Función de depuración para verificar la estructura de la colección de citas
export async function debugCitas() {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Depurando colección de citas...")
    const citasRef = collection(firestore, "citas")
    const snapshot = await getDocs(citasRef)

    console.log(`Total de citas en la colección: ${snapshot.docs.length}`)

    const citas = snapshot.docs.map((doc) => {
      const data = doc.data()

      // Extraer información relevante para depuración
      let fechaInfo = "desconocido"
      if (data.fecha) {
        if (typeof data.fecha === "number") {
          fechaInfo = `número: ${data.fecha} (${new Date(data.fecha).toLocaleString()})`
        } else if (typeof data.fecha === "string") {
          fechaInfo = `string: ${data.fecha}`
        } else if (typeof data.fecha === "object") {
          if (data.fecha.toDate) {
            fechaInfo = `timestamp: ${data.fecha.toDate().toLocaleString()}`
          } else if (data.fecha.seconds) {
            fechaInfo = `firestore timestamp: ${new Date(data.fecha.seconds * 1000).toLocaleString()}`
          } else {
            fechaInfo = `objeto: ${JSON.stringify(data.fecha)}`
          }
        }
      }

      // Extraer información del paciente
      let pacienteInfo = "desconocido"
      if (data.paciente) {
        pacienteInfo = `id: ${data.paciente.id || "N/A"}, nombre: ${data.paciente.nombre || "N/A"} ${data.paciente.apellido || "N/A"}, rut: ${data.paciente.rut || "N/A"}`
      }

      return {
        id: doc.id,
        ...data,
        _debug: {
          fechaInfo,
          pacienteInfo,
          pacienteIdTipo: typeof data.pacienteId,
          estado: data.estado || "N/A",
          hora: data.hora || "N/A",
        },
      }
    })

    console.log("Estructura de citas:", citas)
    return citas
  } catch (error) {
    console.error("Error al depurar citas:", error)
    return []
  }
}
