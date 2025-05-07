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
import type { Paciente, Sesion } from "./data"

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
    const q = query(pacientesRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paciente[]
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
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Paciente
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
    const sesionesRef = collection(firestore, "sesiones")
    const q = query(sesionesRef, where("pacienteId", "==", pacienteId), orderBy("fecha", "desc"))
    const snapshot = await getDocs(q)

    console.log(`Se encontraron ${snapshot.docs.length} sesiones para el paciente ${pacienteId}`)

    // Convertir los documentos a objetos Sesion
    const sesiones = snapshot.docs.map((doc) => {
      const data = doc.data()
      // Asegurarse de que la fecha sea un número o string
      const fecha = typeof data.fecha === "object" && data.fecha.toDate ? data.fecha.toDate().getTime() : data.fecha

      return {
        id: doc.id,
        ...data,
        fecha,
      }
    }) as Sesion[]

    return sesiones
  } catch (error) {
    console.error("Error al obtener sesiones del paciente:", error)
    return []
  }
}

export async function crearSesion(sesion: Omit<Sesion, "id" | "createdAt">) {
  const firestore = getDb()
  if (!firestore) throw new Error("Firestore no está inicializado")

  try {
    console.log("Creando nueva sesión...")
    const sesionData = {
      ...sesion,
      createdAt: serverTimestamp(),
    }

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
