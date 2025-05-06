import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import type { Paciente, FichaClinica } from "./data"

// Convertidores para Firestore
const pacienteConverter = {
  toFirestore: (paciente: Paciente): DocumentData => {
    return {
      ...paciente,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Paciente => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      nombre: data.nombre,
      apellido: data.apellido,
      rut: data.rut,
      fechaNacimiento: data.fechaNacimiento,
      genero: data.genero,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email,
      ocupacion: data.ocupacion,
      prevision: data.prevision,
      contactoEmergencia: data.contactoEmergencia,
      telefonoEmergencia: data.telefonoEmergencia,
      antecedentes: data.antecedentes,
      oda: data.oda,
      edad: data.edad,
      diagnosticoMedico: data.diagnosticoMedico,
      antecedentesClinicosRelevantes: data.antecedentesClinicosRelevantes,
      examenesAuxiliares: data.examenesAuxiliares,
      evaluacionInicial: data.evaluacionInicial,
      evaluacionFinal: data.evaluacionFinal,
      sesiones: data.sesiones,
    }
  },
}

// Funciones para pacientes
export const getPacientes = async (): Promise<Paciente[]> => {
  const pacientesRef = collection(db, "pacientes").withConverter(pacienteConverter)
  const snapshot = await getDocs(pacientesRef)
  return snapshot.docs.map((doc) => doc.data())
}

export const getPacienteById = async (id: string): Promise<Paciente | null> => {
  const pacienteRef = doc(db, "pacientes", id).withConverter(pacienteConverter)
  const docSnap = await getDoc(pacienteRef)

  if (docSnap.exists()) {
    return docSnap.data()
  } else {
    return null
  }
}

export const getPacienteByRut = async (rut: string): Promise<Paciente | null> => {
  const pacientesRef = collection(db, "pacientes").withConverter(pacienteConverter)
  const q = query(pacientesRef, where("rut", "==", rut))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    return snapshot.docs[0].data()
  } else {
    return null
  }
}

export const createPaciente = async (paciente: Omit<Paciente, "id">): Promise<string> => {
  try {
    const pacientesRef = collection(db, "pacientes")
    const docRef = await addDoc(pacientesRef, {
      ...paciente,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error al crear paciente:', error)
    throw new Error('No se pudo crear el paciente')
  }
}

export const updatePaciente = async (id: string, paciente: Partial<Paciente>): Promise<void> => {
  const pacienteRef = doc(db, "pacientes", id)
  await updateDoc(pacienteRef, {
    ...paciente,
    updatedAt: serverTimestamp(),
  })
}

export const deletePaciente = async (id: string): Promise<void> => {
  const pacienteRef = doc(db, "pacientes", id)
  await deleteDoc(pacienteRef)
}

// Funciones para fichas clínicas
export const getFichasByPacienteId = async (pacienteId: string): Promise<FichaClinica[]> => {
  const fichasRef = collection(db, "fichas")
  const q = query(fichasRef, where("pacienteId", "==", pacienteId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as FichaClinica,
  )
}

export const createFicha = async (ficha: Omit<FichaClinica, "id">): Promise<string> => {
  const fichasRef = collection(db, "fichas")
  const docRef = await addDoc(fichasRef, {
    ...ficha,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export const updateFicha = async (id: string, ficha: Partial<FichaClinica>): Promise<void> => {
  const fichaRef = doc(db, "fichas", id)
  await updateDoc(fichaRef, {
    ...ficha,
    updatedAt: serverTimestamp(),
  })
}

export const deleteFicha = async (id: string): Promise<void> => {
  const fichaRef = doc(db, "fichas", id)
  await deleteDoc(fichaRef)
}

// Interfaces para las citas
export interface Cita {
  id?: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  hora: string
  duracion: string
  tipo: string
  estado: string
}

// Funciones CRUD para citas
export async function getCitas() {
  const citasRef = collection(db, 'citas')
  const snapshot = await getDocs(citasRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function createCita(data: Omit<Cita, 'id'>) {
  const citasRef = collection(db, 'citas')
  return addDoc(citasRef, data)
}

export async function updateCita(id: string, data: Partial<Cita>) {
  const citaRef = doc(db, 'citas', id)
  return updateDoc(citaRef, data)
}

export async function deleteCita(id: string) {
  const citaRef = doc(db, 'citas', id)
  return deleteDoc(citaRef)
}
