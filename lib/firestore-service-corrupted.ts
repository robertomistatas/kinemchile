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
      if ((updateData as any)[key] === null) {
        (updateData as any)[key] = deleteField()
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

export async function getPacientesInactivosPorProfesional(nombreProfesional: string): Promise<Paciente[]> {
  try {
    console.log(`🔍 [DEBUG] Obteniendo pacientes dados de alta del profesional ${nombreProfesional}...`);
    
    const pacientesRef = collection(db, 'pacientes');
    const pacientesEncontrados = new Map<string, Paciente>();

    // ESTRATEGIA PRINCIPAL: Buscar por tratante_nombre (campo correcto identificado)
    console.log(`🎯 [DEBUG] Buscando por tratante_nombre = ${nombreProfesional}`);
    
    const queryTratante1 = await getDocs(query(
      pacientesRef,
      where("activo", "==", false),
      where("tratante_nombre", "==", nombreProfesional)
    ));
    
    const queryTratante2 = await getDocs(query(
      pacientesRef,
      where("estado", "==", "inactivo"),
      where("tratante_nombre", "==", nombreProfesional)
    ));
    
    console.log(`📊 [DEBUG] Encontrados ${queryTratante1.docs.length} pacientes por tratante_nombre (activo=false)`);
    console.log(`📊 [DEBUG] Encontrados ${queryTratante2.docs.length} pacientes por tratante_nombre (estado=inactivo)`);
    
    const todosLosDocs = queryTratante1.docs.concat(queryTratante2.docs);
    todosLosDocs.forEach(doc => {
      const data = doc.data();
      console.log(`✅ [DEBUG] Paciente encontrado:`, {
        id: doc.id,
        nombre: `${data.nombre} ${data.apellido}`,
        tratante_nombre: data.tratante_nombre,
        fechaAlta: data.fechaAlta
      });
      
      pacientesEncontrados.set(doc.id, {
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
        activo: false,
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
      } as Paciente);
    });

    const resultadoFinal = Array.from(pacientesEncontrados.values());
    
    console.log(`🎯 [DEBUG] RESULTADO FINAL: ${resultadoFinal.length} pacientes dados de alta para el profesional ${nombreProfesional}`);
    
    if (resultadoFinal.length === 0) {
      console.log(`❌ [DEBUG] No se encontraron pacientes dados de alta para este profesional`);
    }
    
    return resultadoFinal;
    
  } catch (error) {
    console.error(`❌ [ERROR] Error al obtener pacientes dados de alta:`, error);
    throw error;
  }
}
// Función para obtener pacientes dados de alta por profesional  
export async function getPacientesInactivosPorProfesional(profesionalIdONombre: string): Promise<Paciente[]> {
  console.log(`🔍 [getPacientesInactivosPorProfesional] Buscando pacientes dados de alta para: ${profesionalIdONombre}`)
  
  const firestore = getDb()
  if (!firestore) return []

  try {
    const pacientesRef = collection(firestore, "pacientes")
    
    // Buscar pacientes inactivos por tratante_nombre (el campo que realmente contiene el nombre del profesional)
    const queryInactivos = query(
      pacientesRef,
      where("activo", "==", false),
      where("tratante_nombre", "==", profesionalIdONombre)
    )
    
    const querySnapshot = await getDocs(queryInactivos)
    
    const pacientes: Paciente[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`✅ [getPacientesInactivosPorProfesional] Paciente encontrado: ${data.nombre} ${data.apellido}`)
      
      pacientes.push({
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
        activo: false,
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
      } as Paciente)
    })
    
    console.log(`🎯 [getPacientesInactivosPorProfesional] Encontrados ${pacientes.length} pacientes para ${profesionalIdONombre}`)
    return pacientes
    
  } catch (error) {
    console.error("❌ [getPacientesInactivosPorProfesional] Error:", error)
    return []
  }

// Funciones para sesiones
    let nombreProfesional = ""
    let profesionalId = ""
    
    if (esUID) {
      // Si es un UID, obtener el nombre del usuario
      profesionalId = profesionalIdONombre
      try {
        const usuarioRef = doc(firestore, "usuarios", profesionalId)
        const usuarioDoc = await getDoc(usuarioRef)
        if (usuarioDoc.exists()) {
          const usuarioData = usuarioDoc.data()
          nombreProfesional = usuarioData.nombre || usuarioData.displayName || ""
          console.log(`✅ [DEBUG] Profesional encontrado por UID: ${nombreProfesional}`)
        } else {
          console.log(`❌ [DEBUG] No se encontró usuario con UID: ${profesionalId}`)
        }
      } catch (error) {
        console.log(`⚠️ [DEBUG] Error al buscar usuario por UID:`, error)
      }
    } else {
      // Si es un nombre, usarlo directamente
      nombreProfesional = profesionalIdONombre
      console.log(`✅ [DEBUG] Buscando directamente por nombre: ${nombreProfesional}`)
    }

    const pacientesRef = collection(firestore, "pacientes")
    let pacientesEncontrados = new Map()
    
    // Primera estrategia: buscar por profesional_alta_nombre (más común y directo)
    if (nombreProfesional) {
      console.log(`🔍 [DEBUG] Buscando por profesional_alta_nombre = ${nombreProfesional}`)
      
      // Buscar con activo=false
      const queryPorNombreAlta1 = await getDocs(query(
        pacientesRef,
        where("activo", "==", false),
        where("profesional_alta_nombre", "==", nombreProfesional)
      ))
      
      // Buscar con estado="inactivo"
      const queryPorNombreAlta2 = await getDocs(query(
        pacientesRef,
        where("estado", "==", "inactivo"),
        where("profesional_alta_nombre", "==", nombreProfesional)
      ))
      
      console.log(`📊 [DEBUG] Encontrados ${queryPorNombreAlta1.docs.length} pacientes por profesional_alta_nombre (activo=false)`)
      console.log(`📊 [DEBUG] Encontrados ${queryPorNombreAlta2.docs.length} pacientes por profesional_alta_nombre (estado=inactivo)`)
      
      // Procesar ambos resultados
      const todosLosDocumentos = queryPorNombreAlta1.docs.concat(queryPorNombreAlta2.docs)
      todosLosDocumentos.forEach(doc => {
        const data = doc.data()
        console.log(`✅ [DEBUG] Paciente encontrado por profesional_alta_nombre:`, {
          id: doc.id,
          nombre: `${data.nombre} ${data.apellido}`,
          profesional_alta_nombre: data.profesional_alta_nombre,
          fechaAlta: data.fechaAlta
        })
        
        pacientesEncontrados.set(doc.id, {
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
          activo: false,
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
        } as Paciente)
      })
    }
    
    // Segunda estrategia: buscar por profesional_alta_id si tenemos el UID y no encontramos nada
    if (pacientesEncontrados.size === 0 && profesionalId) {
      console.log(`🔍 [DEBUG] Buscando por profesional_alta_id = ${profesionalId}`)
      
      const queryPorProfesionalAlta1 = await getDocs(query(
        pacientesRef, 
        where("activo", "==", false), 
        where("profesional_alta_id", "==", profesionalId)
      ))
      
      const queryPorProfesionalAlta2 = await getDocs(query(
        pacientesRef, 
        where("estado", "==", "inactivo"), 
        where("profesional_alta_id", "==", profesionalId)
      ))
      
      console.log(`📊 [DEBUG] Encontrados ${queryPorProfesionalAlta1.docs.length} pacientes por profesional_alta_id (activo=false)`)
      console.log(`📊 [DEBUG] Encontrados ${queryPorProfesionalAlta2.docs.length} pacientes por profesional_alta_id (estado=inactivo)`)
      
      const todosLosProfesionalAltaDocs = queryPorProfesionalAlta1.docs.concat(queryPorProfesionalAlta2.docs)
      todosLosProfesionalAltaDocs.forEach(doc => {
        const data = doc.data()
        console.log(`✅ [DEBUG] Paciente encontrado por profesional_alta_id:`, {
          id: doc.id,
          nombre: `${data.nombre} ${data.apellido}`,
          profesional_alta_id: data.profesional_alta_id,
          profesional_alta_nombre: data.profesional_alta_nombre,
          fechaAlta: data.fechaAlta
        })
        
        pacientesEncontrados.set(doc.id, {
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
          activo: false,
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
        } as Paciente)
      })
    }
    
    // Tercera estrategia: buscar por campo 'tratante_nombre' (campo correcto identificado)
    if (pacientesEncontrados.size === 0 && nombreProfesional) {
      console.log(`🎯 [DEBUG] Buscando por campo 'tratante_nombre' = ${nombreProfesional}`)
      
      // Buscar por tratante_nombre (campo correcto)
      const queryTratante1 = await getDocs(query(
        pacientesRef,
        where("activo", "==", false),
        where("tratante_nombre", "==", nombreProfesional)
      ))
      
      const queryTratante2 = await getDocs(query(
        pacientesRef,
        where("estado", "==", "inactivo"),
        where("tratante_nombre", "==", nombreProfesional)
      ))
      
      console.log(`📊 [DEBUG] Encontrados ${queryTratante1.docs.length} pacientes por tratante_nombre (activo=false)`)
      console.log(`📊 [DEBUG] Encontrados ${queryTratante2.docs.length} pacientes por tratante_nombre (estado=inactivo)`)
      
      const todosLosTratanteDocs = queryTratante1.docs.concat(queryTratante2.docs)
      todosLosTratanteDocs.forEach(doc => {
        const data = doc.data()
        console.log(`✅ [DEBUG] Paciente encontrado por tratante_nombre:`, {
          id: doc.id,
          nombre: `${data.nombre} ${data.apellido}`,
          tratante_nombre: data.tratante_nombre,
          fechaAlta: data.fechaAlta
        })
        
        pacientesEncontrados.set(doc.id, {
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
          activo: false,
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
        } as Paciente)
      })
    }

    // Cuarta estrategia: si aún no encontramos nada, buscar también en tratante_nombre y kinesiologo_nombre
    if (pacientesEncontrados.size === 0 && nombreProfesional) {
      console.log(`🔍 [DEBUG] Buscando en campos tratante_nombre y kinesiologo_nombre por nombre...`)
      
      // Buscar por tratante_nombre
      const queryTratanteNombre1 = await getDocs(query(
        pacientesRef,
        where("activo", "==", false),
        where("tratante_nombre", "==", nombreProfesional)
      ))
      
      const queryTratanteNombre2 = await getDocs(query(
        pacientesRef,
        where("estado", "==", "inactivo"),
        where("tratante_nombre", "==", nombreProfesional)
      ))
      
      // Buscar por kinesiologo_nombre
      const queryKinesiologoNombre1 = await getDocs(query(
        pacientesRef,
        where("activo", "==", false),
        where("kinesiologo_nombre", "==", nombreProfesional)
      ))
      
      const queryKinesiologoNombre2 = await getDocs(query(
        pacientesRef,
        where("estado", "==", "inactivo"),
        where("kinesiologo_nombre", "==", nombreProfesional)
      ))
      
      console.log(`📊 [DEBUG] Encontrados ${queryTratanteNombre1.docs.length + queryTratanteNombre2.docs.length} pacientes por tratante_nombre`)
      console.log(`📊 [DEBUG] Encontrados ${queryKinesiologoNombre1.docs.length + queryKinesiologoNombre2.docs.length} pacientes por kinesiologo_nombre`)
      
      // Procesar resultados - tratante_nombre
      const todosTratanteDocs = queryTratanteNombre1.docs.concat(queryTratanteNombre2.docs)
      todosTratanteDocs.forEach(doc => {
        const data = doc.data()
        if (!pacientesEncontrados.has(doc.id)) {
          pacientesEncontrados.set(doc.id, {
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
            activo: false,
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
          } as Paciente)
        }
      })
      
      // Procesar resultados - kinesiologo_nombre
      const todosKinesiologoDocs = queryKinesiologoNombre1.docs.concat(queryKinesiologoNombre2.docs)
      todosKinesiologoDocs.forEach(doc => {
        const data = doc.data()
        if (!pacientesEncontrados.has(doc.id)) {
          pacientesEncontrados.set(doc.id, {
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
            activo: false,
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
          } as Paciente)
        }
      })
    }

    const pacientes = Array.from(pacientesEncontrados.values()) as Paciente[]
    console.log(`🎯 [DEBUG] RESULTADO FINAL: ${pacientes.length} pacientes dados de alta para el profesional ${profesionalIdONombre}`)
    
    if (pacientes.length > 0) {
      console.log(`📋 [DEBUG] Lista de pacientes encontrados:`)
      pacientes.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.nombre} ${p.apellido} - Alta: ${p.fechaAlta}`)
      })
    } else {
      console.log(`❌ [DEBUG] No se encontraron pacientes dados de alta para este profesional`)
    }
    
    return pacientes
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
    });
  } catch (error) {
    console.error("Error al obtener citas por fecha:", error)
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
    } else if (cita.fecha && typeof cita.fecha === "object" && (cita.fecha as any) instanceof Date) {
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
