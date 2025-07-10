import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"

// Define the Paciente type
export interface Paciente {
  id: string
  nombre: string
  apellido: string
  rut: string
  email: string
  telefono: string
  fechaNacimiento: string
  direccion: string
  diagnostico: string
  antecedentesPersonales: string
  activo: boolean
  createdAt: number
  fechaAlta: string | null
  notasAlta: string | null
  prevision: string
  kinesiologo_id: string | null
  kinesiologo_nombre: string | null
}

// Initialize Firebase (replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Function to initialize and get the Firestore database
const getDb = () => {
  try {
    const firestore = getFirestore()
    return firestore
  } catch (error) {
    console.error("Failed to initialize Firestore:", error)
    return null
  }
}

// Modificar la función getPacientes para filtrar por kinesiólogo o tratante si es necesario
export async function getPacientes(profesionalId?: string): Promise<Paciente[]> {
  const firestore = getDb()
  if (!firestore) return []

  try {
    console.log("Obteniendo pacientes...")
    const pacientesRef = collection(firestore, "pacientes")

    // Si se proporciona un ID de profesional, filtrar por tratante_id o kinesiologo_id
    let snapshot
    if (profesionalId) {
      const q = query(
        pacientesRef,
        // Buscar pacientes donde el profesional sea tratante o kinesiologo
        where("$or", "in", [
          ["tratante_id", profesionalId],
          ["kinesiologo_id", profesionalId]
        ])
      )
      snapshot = await getDocs(q)
    } else {
      snapshot = await getDocs(pacientesRef)
    }

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
        kinesiologo_id: data.kinesiologo_id || null,
        kinesiologo_nombre: data.kinesiologo_nombre || null,
        tratante_id: data.tratante_id || null,
        tratante_nombre: data.tratante_nombre || null,
        tratante_funcion: data.tratante_funcion || null,
      } as Paciente
    })
  } catch (error) {
    console.error("Error al obtener pacientes:", error)
    return []
  }
}

// Re-exportar desde la nueva ubicación para mantener compatibilidad
export {
  getPacientesActivos,
  getPaciente,
  getSesiones,
  getSesionesPaciente,
  actualizarPaciente,
  crearPaciente,
  darDeAltaPaciente,
  eliminarPaciente,
  getSesion,
  crearSesion,
  actualizarSesion,
  eliminarSesion,
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  eliminarCita,
  cambiarEstadoCita,  asignarKinesiologoAPaciente,
  getUsuarios,
  debugSesiones,
  debugCitas,
  getProfesionales,
} from "@/lib/firestore-service"
