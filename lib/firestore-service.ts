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
import type { Paciente, Sesion, Cita, Usuario } from "./data"

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

    const pacientes = snapshot.docs.map((doc) => {
      const data = doc.data()
      // Asegurarse de que todos los campos requeridos existan
      const paciente = {
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
        createdAt: data.createdAt ? data.createdAt.toString() : Date.now().toString(),
        fechaAlta: data.fechaAlta || null,
        notasAlta: data.notasAlta || null,
        prevision: data.prevision || "",
        kinesiologo_id: data.kinesiologo_id || null,
        kinesiologo_nombre: data.kinesiologo_nombre || null,
        tratante_id: data.tratante_id || null,
        tratante_nombre: data.tratante_nombre || null,
        tratante_funcion: data.tratante_funcion || null,
        fechaIngreso: data.fechaIngreso || "",
      } as Paciente
      
      return paciente
    })
    
    return pacientes
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

    // Primero intentamos con la consulta filtrada
    try {
      const pacientesRef = collection(firestore, "pacientes")
      const q = query(pacientesRef, where("activo", "==", true), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      console.log(`Consulta filtrada: Se encontraron ${snapshot.docs.length} pacientes activos`)

      if (snapshot.docs.length > 0) {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Paciente[]
      }
    } catch (error) {
      console.error("Error en consulta filtrada:", error)
    }

    // Si la consulta filtrada falla o no devuelve resultados, intentamos obtener todos los pacientes
    console.log("Intentando obtener todos los pacientes...")
    const pacientesRef = collection(firestore, "pacientes")
    const snapshot = await getDocs(pacientesRef)

    console.log(`Se encontraron ${snapshot.docs.length} pacientes en total`)

    // Filtrar los activos en memoria
    const pacientesActivos = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
        } as Paciente
      })
      .filter((p) => p.activo !== false)

    console.log(`Filtrados en memoria: ${pacientesActivos.length} pacientes activos`)

    return pacientesActivos
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
        kinesiologo_id: data.kinesiologo_id || null,
        kinesiologo_nombre: data.kinesiologo_nombre || null,
        fechaIngreso: data.fechaIngreso || "",
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
          kinesiologo_id: data.kinesiologo_id || null,
          kinesiologo_nombre: data.kinesiologo_nombre || null,
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
        kinesiologo_id: data.kinesiologo_id || null,
        kinesiologo_nombre: data.kinesiologo_nombre || null,
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

export async function darDeAltaPaciente(id: string, notas: string, profesionalId?: string, profesionalNombre?: string) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Dando de alta al paciente con ID: ${id}`)
    const docRef = doc(firestore, "pacientes", id)
    
    const updateData: any = {
      activo: false,
      fechaAlta: new Date().toISOString(),
      notasAlta: notas,
    }
    
    // Si se proporciona el profesional que da de alta, guardarlo
    if (profesionalId) {
      updateData.profesional_alta_id = profesionalId
      if (profesionalNombre) {
        updateData.profesional_alta_nombre = profesionalNombre
      }
    }
    
    await updateDoc(docRef, updateData)
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

// Funciones para obtener pacientes dados de alta
export async function getPacientesInactivos(): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo todos los pacientes dados de alta...")
    const pacientesRef = collection(firestore, "pacientes")
    const q = query(pacientesRef, where("activo", "==", false))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
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
        antecedentesPersonales: data.antecedentesPersonales || data.antecedentesClinicosRelevantes || "",
        activo: typeof data.activo === "boolean" ? data.activo : true,
        createdAt: data.createdAt ? data.createdAt.toString() : Date.now().toString(),
        fechaAlta: data.fechaAlta || "",
        notasAlta: data.notasAlta || "",
        prevision: data.prevision || "",
        kinesiologo_id: data.kinesiologo_id || null,
        kinesiologo_nombre: data.kinesiologo_nombre || null,
        tratante_id: data.tratante_id || null,
        tratante_nombre: data.tratante_nombre || null,
        tratante_funcion: data.tratante_funcion || null,
        profesional_alta_id: data.profesional_alta_id || null,
        profesional_alta_nombre: data.profesional_alta_nombre || null,
        fechaIngreso: data.fechaIngreso || "",
      } as Paciente
    })
  } catch (error) {
    console.error("Error al obtener pacientes dados de alta:", error)
    return []
  }
}

export async function getPacientesInactivosPorProfesional(profesionalId: string): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo pacientes dados de alta del profesional ${profesionalId}...`)
    
    // Primero, obtener información del usuario para buscar por nombre también
    let nombreProfesional = ""
    try {
      // Intentar obtener el nombre del profesional desde la colección usuarios
      const usuarioRef = doc(firestore, "usuarios", profesionalId)
      const usuarioDoc = await getDoc(usuarioRef)
      if (usuarioDoc.exists()) {
        const usuarioData = usuarioDoc.data()
        nombreProfesional = usuarioData.nombre || usuarioData.displayName || ""
        console.log(`Nombre del profesional encontrado: ${nombreProfesional}`)
      }
    } catch (error) {
      console.log("No se pudo obtener el nombre del profesional desde usuarios:", error)
    }

    const pacientesRef = collection(firestore, "pacientes")
    
    // Crear las consultas por ID
    const consultasPorId = [
      getDocs(query(pacientesRef, where("activo", "==", false), where("kinesiologo_id", "==", profesionalId))),
      getDocs(query(pacientesRef, where("activo", "==", false), where("tratante_id", "==", profesionalId))),
      getDocs(query(pacientesRef, where("activo", "==", false), where("profesional_alta_id", "==", profesionalId)))
    ]

    // Si tenemos nombre del profesional, agregar consultas por nombre
    const consultasPorNombre = nombreProfesional ? [
      getDocs(query(pacientesRef, where("activo", "==", false), where("kinesiologo_nombre", "==", nombreProfesional))),
      getDocs(query(pacientesRef, where("activo", "==", false), where("tratante_nombre", "==", nombreProfesional))),
      getDocs(query(pacientesRef, where("activo", "==", false), where("profesional_alta_nombre", "==", nombreProfesional)))
    ] : []

    // Ejecutar todas las consultas
    const todasLasConsultas = [...consultasPorId, ...consultasPorNombre]
    const resultados = await Promise.all(todasLasConsultas)
    
    const [queryKinesiologo, queryTratante, queryProfesionalAlta, ...consultasNombre] = resultados

    console.log(`Query kinesiologo_id encontró ${queryKinesiologo.docs.length} documentos`)
    console.log(`Query tratante_id encontró ${queryTratante.docs.length} documentos`)
    console.log(`Query profesional_alta_id encontró ${queryProfesionalAlta.docs.length} documentos`)
    
    if (consultasNombre.length > 0) {
      consultasNombre.forEach((consulta, index) => {
        const tipos = ["kinesiologo_nombre", "tratante_nombre", "profesional_alta_nombre"]
        console.log(`Query ${tipos[index]} encontró ${consulta.docs.length} documentos`)
      })
    }

    // Combinar resultados y eliminar duplicados usando Map
    const pacientesMap = new Map()
    
    const procesarDocumentos = (docs: any[], tipo: string) => {
      docs.forEach(doc => {
        const data = doc.data()
        console.log(`Paciente por ${tipo}:`, {
          id: doc.id,
          nombre: data.nombre,
          activo: data.activo,
          profesional: data[tipo] || data.profesional_alta_id || data.tratante_nombre || data.kinesiologo_nombre
        })
        
        pacientesMap.set(doc.id, {
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
          createdAt: data.createdAt ? data.createdAt.toString() : Date.now().toString(),
          fechaAlta: data.fechaAlta || "",
          notasAlta: data.notasAlta || "",
          prevision: data.prevision || "",
          kinesiologo_id: data.kinesiologo_id || null,
          kinesiologo_nombre: data.kinesiologo_nombre || null,
          tratante_id: data.tratante_id || null,
          tratante_nombre: data.tratante_nombre || null,
          tratante_funcion: data.tratante_funcion || null,
          profesional_alta_id: data.profesional_alta_id || null,
          profesional_alta_nombre: data.profesional_alta_nombre || null,
          fechaIngreso: data.fechaIngreso || "",
        })
      })
    }

    // Procesar consultas por ID
    procesarDocumentos(queryKinesiologo.docs, "kinesiologo_id")
    procesarDocumentos(queryTratante.docs, "tratante_id") 
    procesarDocumentos(queryProfesionalAlta.docs, "profesional_alta_id")

    // Procesar consultas por nombre si existen
    if (consultasNombre.length > 0) {
      const tipos = ["kinesiologo_nombre", "tratante_nombre", "profesional_alta_nombre"]
      consultasNombre.forEach((consulta, index) => {
        procesarDocumentos(consulta.docs, tipos[index])
      })
    }

    const pacientes = Array.from(pacientesMap.values()) as Paciente[]
    console.log(`Se encontraron ${pacientes.length} pacientes dados de alta para el profesional ${profesionalId}`)
    
    return pacientes
  } catch (error) {
    console.error(`Error al obtener pacientes dados de alta del profesional ${profesionalId}:`, error)
    return []
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

    // Crear timestamps para el inicio y fin del día - usando valores UTC consistentes
    const inicioDelDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0)
    const finDelDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999)

    const inicioTimestamp = inicioDelDia.getTime()
    const finTimestamp = finDelDia.getTime()

    console.log(`Buscando citas entre: ${new Date(inicioTimestamp).toLocaleString()} y ${new Date(finTimestamp).toLocaleString()}`)
    console.log(`Timestamps: inicio=${inicioTimestamp}, fin=${finTimestamp}`)
    
    // IMPORTANTE: En lugar de usar queries complejas, obtenemos todas las citas y filtramos manualmente
    // para evitar problemas con los formatos de fecha en Firestore
    const citasRef = collection(firestore, "citas")
    const snapshot = await getDocs(citasRef)
    console.log(`Obtenidas ${snapshot.docs.length} citas totales de la base de datos`)
    
    // Procesamos todas las citas y filtramos por fecha manualmente para mayor precisión
    const citasConDatos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }));
    
    // Filtrar manualmente por fecha
    const citasFiltradas = citasConDatos.filter((cita: any) => {
      // Extraer y normalizar la fecha de la cita
      let fechaCita: number | null = null;
      
      if (cita.fecha) {
        // Si es un timestamp numérico
        if (typeof cita.fecha === 'number') {
          fechaCita = cita.fecha;
        } 
        // Si es un string de fecha
        else if (typeof cita.fecha === 'string') {
          fechaCita = new Date(cita.fecha).getTime();
        }
        // Si es un timestamp de Firestore
        else if (typeof cita.fecha === 'object') {
          if (cita.fecha.toDate) {
            fechaCita = cita.fecha.toDate().getTime();
          } else if (cita.fecha.seconds) {
            fechaCita = cita.fecha.seconds * 1000;
          }
        }
      }
      
      // Si tenemos una fecha válida, comparar con el rango del día
      if (fechaCita !== null) {
        // Comparar si está en el rango del día seleccionado
        const diaCoincide = fechaCita >= inicioTimestamp && fechaCita <= finTimestamp;
        
        // Imprimir diagnóstico detallado de cada cita encontrada
        console.log(`Cita ID ${cita.id}: fecha=${fechaCita}, formato=${typeof cita.fecha}, ¿coincide con el día ${fecha.toDateString()}? ${diaCoincide}`);
        
        return diaCoincide;
      }
      
      return false;
    });
    
    console.log(`Se encontraron ${citasFiltradas.length} citas para la fecha ${fecha.toLocaleDateString()} tras filtrado manual`);
          // Procesar los resultados y convertir campos según sea necesario
    return citasFiltradas.map((cita: any) => {
      // Normalizar la fecha (asegurarse que sea timestamp)
      let fechaNormalizada = cita.fecha;
      if (typeof cita.fecha === "object" && cita.fecha !== null) {
        if (cita.fecha.toDate) {
          fechaNormalizada = cita.fecha.toDate().getTime();
        } else if (cita.fecha.seconds) {
          fechaNormalizada = cita.fecha.seconds * 1000;
        }
      } else if (typeof cita.fecha === "string") {
        fechaNormalizada = new Date(cita.fecha).getTime();
      }
      
      // Asegurar que exista una duración predeterminada
      const duracion = cita.duracion || 60;
      
      // Asegurar que exista un estado predeterminado
      const estado = cita.estado || "programada";
      
      // Crear el objeto cita con datos normalizados
      return {
        id: cita.id,
        pacienteId: cita.pacienteId || "",
        fecha: fechaNormalizada,
        hora: cita.hora || "",
        duracion: duracion,
        estado: estado,
        motivo: cita.motivo || "",
        prevision: cita.prevision || "",
        createdAt: cita.createdAt || Date.now(),
        // Añadir campos que podrían faltar para garantizar compatibilidad con la interfaz
        paciente: cita.paciente || { 
          id: cita.pacienteId || "",
          nombre: cita.pacienteNombre || "Sin nombre",
          apellido: cita.pacienteApellido || "",
          rut: cita.pacienteRut || ""
        }
      } as Cita;
      if (!idsExistentes.has(cita.id)) {
        // Crear un documento similar al que devolvería Firestore
        citasCombinadas.push({
          id: cita.id,
          data: () => cita,
          exists: () => true
        });
      }
    });
    
    console.log(`Total combinado: ${citasCombinadas.length} citas para la fecha ${fecha.toLocaleDateString()}`)    // Procesar los resultados y convertir campos según sea necesario
    return citasCombinadas.map((doc) => {
      // Si es un documento de Firestore, obtener los datos
      const data = doc.data ? doc.data() : doc;
      
      // Normalizar la fecha (asegurarse que sea timestamp)
      let fechaNormalizada = data.fecha;
      if (typeof data.fecha === "object" && data.fecha !== null) {
        if (data.fecha.toDate) {
          fechaNormalizada = data.fecha.toDate().getTime();
        } else if (data.fecha.seconds) {
          fechaNormalizada = data.fecha.seconds * 1000;
        }
      } else if (typeof data.fecha === "string") {
        fechaNormalizada = new Date(data.fecha).getTime();
      }
      
      // Asegurar que exista una duración predeterminada
      const duracion = data.duracion || 60;
      
      // Asegurar que exista un estado predeterminado
      const estado = data.estado || "programada";
      
      // Crear el objeto cita con datos normalizados
      return {
        id: doc.id,
        pacienteId: data.pacienteId || "",
        fecha: fechaNormalizada,
        hora: data.hora || "",
        duracion: duracion,
        estado: estado,
        motivo: data.motivo || "",
        prevision: data.prevision || "",
        createdAt: data.createdAt || Date.now(),
        // Añadir campos que podrían faltar para garantizar compatibilidad con la interfaz
        paciente: data.paciente || { 
          id: data.pacienteId || "",
          nombre: data.pacienteNombre || "Sin nombre",
          apellido: data.pacienteApellido || "",
          rut: data.pacienteRut || ""
        }
      } as Cita;
    });
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

export async function crearCita(cita: Omit<Cita, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nueva cita con datos:", JSON.stringify(cita))

    // Asegurarse de que la fecha sea un timestamp numérico
    let fechaTimestamp: number;
    if (typeof cita.fecha === "string") {
      // Convertir string a número
      fechaTimestamp = new Date(cita.fecha).getTime();
      console.log(`Convertir fecha string a timestamp: ${cita.fecha} -> ${fechaTimestamp}`);
    } else if (typeof cita.fecha === "number") {
      // Ya es un timestamp numérico
      fechaTimestamp = cita.fecha;
      console.log(`Fecha ya es timestamp numérico: ${fechaTimestamp}`);
    } else if (cita.fecha instanceof Date) {
      // Si es un objeto Date
      fechaTimestamp = (cita.fecha as Date).getTime();
      console.log(`Convertir objeto Date a timestamp: ${fechaTimestamp}`);
    } else {
      // Si es algo inesperado, usar fecha actual
      fechaTimestamp = new Date().getTime();
      console.log(`Fecha en formato desconocido, usando timestamp actual: ${fechaTimestamp}`);
    }

    // Crear objeto de fecha para validar el timestamp
    const fechaCita = new Date(fechaTimestamp);
    console.log(`Fecha formateada para verificación: ${fechaCita.toLocaleDateString()} ${fechaCita.toLocaleTimeString()}`);

    // Asegurarse de que el pacienteId sea una cadena
    const pacienteId = String(cita.pacienteId)

    // Asegurarse de que se establezca la duración si no existe
    const duracion = cita.duracion || 60;

    // Asegurar que el estado sea "programada" si no viene definido
    const estado = cita.estado || "programada";

    const citaData = {
      ...cita,
      fecha: fechaTimestamp, // Siempre guardamos como número
      pacienteId: pacienteId,
      estado: estado,
      duracion: duracion,
      createdAt: Date.now(), // Usar Date.now() en lugar de serverTimestamp para consistencia
    }

    console.log("Datos finales de la cita a guardar:", JSON.stringify(citaData))
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

// Funciones para usuarios
export async function getUsuarios(): Promise<Usuario[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo usuarios...")
    const usuariosRef = collection(firestore, "usuarios")
    const snapshot = await getDocs(usuariosRef)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Usuario[]
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

export async function getUsuario(id: string): Promise<Usuario | null> {
  const firestore = getDb()
  if (!firestore) return null

  try {
    console.log(`Obteniendo usuario con ID: ${id}`)
    const docRef = doc(firestore, "usuarios", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Usuario
    }

    return null
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return null
  }
}

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  const firestore = getDb()
  if (!firestore) return null

  try {
    console.log(`Buscando usuario con email: ${email}`)
    const usuariosRef = collection(firestore, "usuarios")
    const q = query(usuariosRef, where("email", "==", email))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      } as Usuario
    }

    return null
  } catch (error) {
    console.error("Error al buscar usuario por email:", error)
    return null
  }
}

export async function crearUsuario(usuario: Omit<Usuario, "id" | "createdAt">): Promise<string> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nuevo usuario...")

    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await getUsuarioByEmail(usuario.email)
    if (usuarioExistente) {
      throw new Error(`Ya existe un usuario con el email ${usuario.email}`)
    }

    const usuarioData = {
      ...usuario,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(firestore, "usuarios"), usuarioData)
    console.log(`Usuario creado con ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error("Error al crear usuario:", error)
    throw error
  }
}

export async function actualizarUsuario(
  id: string,
  usuario: Partial<Omit<Usuario, "id" | "createdAt">>,
): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Actualizando usuario con ID: ${id}`)
    const docRef = doc(firestore, "usuarios", id)

    // Añadir timestamp de actualización
    const dataToUpdate = {
      ...usuario,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, dataToUpdate)
    console.log("Usuario actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    throw error
  }
}

export async function eliminarUsuario(id: string): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Eliminando usuario con ID: ${id}`)
    const docRef = doc(firestore, "usuarios", id)
    await deleteDoc(docRef)
    console.log("Usuario eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    throw error
  }
}

// Funciones para asignar kinesiólogo a paciente
export async function asignarKinesiologoAPaciente(
  pacienteId: string,
  kinesiologoId: string,
  kinesiologoNombre: string,
): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Asignando kinesiólogo ${kinesiologoId} al paciente ${pacienteId}`)
    const docRef = doc(firestore, "pacientes", pacienteId)

    await updateDoc(docRef, {
      kinesiologo_id: kinesiologoId,
      kinesiologo_nombre: kinesiologoNombre,
      updatedAt: serverTimestamp(),
    })

    console.log("Kinesiólogo asignado correctamente")
  } catch (error) {
    console.error("Error al asignar kinesiólogo:", error)
    throw error
  }
}

// Modificar la función getPacientes para filtrar por kinesiólogo
export async function getPacientesPorKinesiologo(kinesiologoId: string): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo pacientes del profesional ${kinesiologoId}...`)
    const pacientesRef = collection(firestore, "pacientes")
    
    // Buscar tanto por kinesiologo_id (legacy) como por tratante_id (nuevo)
    const [queryKinesiologo, queryTratante] = await Promise.all([
      getDocs(query(pacientesRef, where("kinesiologo_id", "==", kinesiologoId))),
      getDocs(query(pacientesRef, where("tratante_id", "==", kinesiologoId)))
    ])

    // Combinar resultados y eliminar duplicados
    const pacientesMap = new Map()
    
    queryKinesiologo.docs.forEach(doc => {
      pacientesMap.set(doc.id, { id: doc.id, ...doc.data() })
    })
    
    queryTratante.docs.forEach(doc => {
      pacientesMap.set(doc.id, { id: doc.id, ...doc.data() })
    })

    const pacientes = Array.from(pacientesMap.values()) as Paciente[]
    console.log(`Se encontraron ${pacientes.length} pacientes para el profesional ${kinesiologoId}`)
    
    return pacientes
  } catch (error) {
    console.error(`Error al obtener pacientes del profesional ${kinesiologoId}:`, error)
    return []
  }
}

// Modificar la función getPacientesActivos para filtrar por kinesiólogo si es necesario
export async function getPacientesActivosPorKinesiologo(kinesiologoId: string): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo pacientes activos del kinesiólogo ${kinesiologoId}...`)
    const pacientesRef = collection(firestore, "pacientes")
    const q = query(pacientesRef, where("activo", "==", true), where("kinesiologo_id", "==", kinesiologoId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paciente[]
  } catch (error) {
    console.error(`Error al obtener pacientes activos del kinesiólogo ${kinesiologoId}:`, error)
    return []
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

// Añadir estas funciones para manejar la asignación de tratante

export async function asignarTratanteAPaciente(
  pacienteId: string,
  tratanteId: string,
  tratanteNombre: string,
  tratanteFuncion: string,
): Promise<void> {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log(`Asignando tratante ${tratanteId} al paciente ${pacienteId}`)
    const docRef = doc(firestore, "pacientes", pacienteId)

    await updateDoc(docRef, {
      tratante_id: tratanteId,
      tratante_nombre: tratanteNombre,
      tratante_funcion: tratanteFuncion,
      updatedAt: serverTimestamp(),
    })

    console.log("Tratante asignado correctamente")
  } catch (error) {
    console.error("Error al asignar tratante:", error)
    throw error
  }
}

export async function getProfesionalesPorFuncion(funcion: string): Promise<Usuario[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log(`Obteniendo profesionales con función ${funcion}...`)
    const usuariosRef = collection(firestore, "usuarios")
    const q = query(usuariosRef, where("funcion", "==", funcion))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Usuario[]
  } catch (error) {
    console.error(`Error al obtener profesionales con función ${funcion}:`, error)
    return []
  }
}

export async function getProfesionales(): Promise<Usuario[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo profesionales (kinesiólogos y médicos)...")
    const usuariosRef = collection(firestore, "usuarios")
    const q = query(usuariosRef, where("funcion", "in", ["kinesiologa", "medico"]))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Usuario[]
  } catch (error) {
    // Si falla la consulta con "in", intentamos con consultas separadas
    try {
      console.log("Intentando obtener profesionales con consultas separadas...")
      const usuariosRef = collection(firestore, "usuarios")

      const kinesiologasSnapshot = await getDocs(query(usuariosRef, where("funcion", "==", "kinesiologa")))

      const medicosSnapshot = await getDocs(query(usuariosRef, where("funcion", "==", "medico")))

      const kinesiologas = kinesiologasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const medicos = medicosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return [...kinesiologas, ...medicos] as Usuario[]
    } catch (secondError) {
      console.error("Error al obtener profesionales:", secondError)
      return []
    }
  }
}
