// Tipos existentes
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
  diagnosticoMedico?: string
  antecedentesPersonales: string
  antecedentesClinicosRelevantes?: string
  evaluacionInicial?: string
  evaluacionFinal?: string
  examenesAuxiliares?: string
  fechaInicio?: string
  fechaAlta?: string | null
  notasAlta?: string | null
  edad?: string
  genero?: string
  prevision?: string
  oda?: string
  patologias?: string[]
  sesiones?: any[]
  activo: boolean
  createdAt: number
  updatedAt?: number | null
  // Nuevos campos para asignación de kinesiólogo
  kinesiologo_id?: string | null
  kinesiologo_nombre?: string | null
}

export interface Sesion {
  id: string
  pacienteId: string
  paciente?: Paciente
  fecha: number
  tipo: string
  descripcion: string
  observaciones?: string
  createdAt?: number
  updatedAt?: number | null
}

export interface Cita {
  id: string
  pacienteId: string
  paciente?: Paciente
  fecha: number
  hora: string
  duracion: number
  motivo: string
  estado: "programada" | "completada" | "cancelada"
  notas?: string
  createdAt?: number
  updatedAt?: number | null
}

// Nuevos tipos para el sistema de roles
export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: "admin" | "kinesiologo" | "recepcionista"
  permisos: string[]
  createdAt?: number
  updatedAt?: number | null
}

// Constantes para permisos
export const PERMISOS = {
  ADMIN: {
    ACCESO: "admin:acceso",
    USUARIOS: "admin:usuarios",
    ROLES: "admin:roles",
  },
  PACIENTES: {
    VER_TODOS: "pacientes:ver_todos",
    VER_ASIGNADOS: "pacientes:ver_asignados",
    CREAR: "pacientes:crear",
    EDITAR: "pacientes:editar",
    ELIMINAR: "pacientes:eliminar",
    ASIGNAR_KINESIOLOGO: "pacientes:asignar_kinesiologo",
    DAR_ALTA: "pacientes:dar_alta",
  },
  SESIONES: {
    VER: "sesiones:ver",
    CREAR: "sesiones:crear",
    EDITAR: "sesiones:editar",
    ELIMINAR: "sesiones:eliminar",
  },
  CITAS: {
    VER_TODAS: "citas:ver_todas",
    VER_ASIGNADAS: "citas:ver_asignadas",
    CREAR: "citas:crear",
    EDITAR: "citas:editar",
    ELIMINAR: "citas:eliminar",
    CAMBIAR_ESTADO: "citas:cambiar_estado",
  },
}

// Permisos predefinidos por rol
export const PERMISOS_POR_ROL = {
  admin: [
    PERMISOS.ADMIN.ACCESO,
    PERMISOS.ADMIN.USUARIOS,
    PERMISOS.ADMIN.ROLES,
    PERMISOS.PACIENTES.VER_TODOS,
    PERMISOS.PACIENTES.VER_ASIGNADOS,
    PERMISOS.PACIENTES.CREAR,
    PERMISOS.PACIENTES.EDITAR,
    PERMISOS.PACIENTES.ELIMINAR,
    PERMISOS.PACIENTES.ASIGNAR_KINESIOLOGO,
    PERMISOS.PACIENTES.DAR_ALTA,
    PERMISOS.SESIONES.VER,
    PERMISOS.SESIONES.CREAR,
    PERMISOS.SESIONES.EDITAR,
    PERMISOS.SESIONES.ELIMINAR,
    PERMISOS.CITAS.VER_TODAS,
    PERMISOS.CITAS.VER_ASIGNADAS,
    PERMISOS.CITAS.CREAR,
    PERMISOS.CITAS.EDITAR,
    PERMISOS.CITAS.ELIMINAR,
    PERMISOS.CITAS.CAMBIAR_ESTADO,
  ],
  kinesiologo: [
    PERMISOS.PACIENTES.VER_ASIGNADOS,
    PERMISOS.PACIENTES.EDITAR,
    PERMISOS.PACIENTES.DAR_ALTA,
    PERMISOS.SESIONES.VER,
    PERMISOS.SESIONES.CREAR,
    PERMISOS.SESIONES.EDITAR,
    PERMISOS.CITAS.VER_ASIGNADAS,
    PERMISOS.CITAS.CREAR,
    PERMISOS.CITAS.EDITAR,
    PERMISOS.CITAS.CAMBIAR_ESTADO,
  ],
  recepcionista: [
    PERMISOS.PACIENTES.VER_TODOS,
    PERMISOS.PACIENTES.CREAR,
    PERMISOS.CITAS.VER_TODAS,
    PERMISOS.CITAS.CREAR,
    PERMISOS.CITAS.EDITAR,
    PERMISOS.CITAS.CAMBIAR_ESTADO,
  ],
}

// Lista de todos los permisos para referencia
export const LISTA_PERMISOS = Object.values(PERMISOS).flatMap((categoria) => Object.values(categoria))
