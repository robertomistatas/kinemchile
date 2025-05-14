// Tipos para la aplicación
export interface Paciente {
  id?: string
  nombre: string
  apellido: string
  rut: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
  prevision?: string
  diagnostico?: string
  observaciones?: string
  activo?: boolean
  tratante_id?: string // ID del profesional tratante
  tratante_nombre?: string // Nombre del profesional tratante
  tratante_funcion?: string // Función del profesional tratante (kinesiologa, medico)
  createdAt?: string
  updatedAt?: string
}

export interface Sesion {
  id?: string
  pacienteId: string
  fecha: string
  hora: string
  duracion: number
  estado: string
  notas: string
  createdAt?: string
  updatedAt?: string
}

export interface Cita {
  id?: string
  pacienteId: string
  pacienteNombre?: string
  fecha: string
  hora: string
  duracion: number
  estado: string
  notas?: string
  createdAt?: string
  updatedAt?: string
}

export interface Usuario {
  id?: string
  email: string
  nombre: string
  rut?: string
  telefono?: string
  funcion?: string // kinesiologa, medico, administrativo
  rol: string
  permisos?: string[]
  activo?: boolean
  createdAt?: string
  updatedAt?: string
}

// Roles del sistema
export const ROLES = {
  ADMIN: "admin",
  KINESIOLOGO: "kinesiologo",
  RECEPCIONISTA: "recepcionista",
  USUARIO: "usuario",
}

// Permisos del sistema
export const PERMISOS = {
  // Pacientes
  VER_PACIENTES: "ver_pacientes",
  VER_TODOS_PACIENTES: "ver_todos_pacientes",
  CREAR_PACIENTE: "crear_paciente",
  EDITAR_PACIENTE: "editar_paciente",
  ELIMINAR_PACIENTE: "eliminar_paciente",
  DAR_ALTA_PACIENTE: "dar_alta_paciente",

  // Sesiones
  VER_SESIONES: "ver_sesiones",
  VER_TODAS_SESIONES: "ver_todas_sesiones",
  CREAR_SESION: "crear_sesion",
  EDITAR_SESION: "editar_sesion",
  ELIMINAR_SESION: "eliminar_sesion",

  // Citas
  VER_CITAS: "ver_citas",
  VER_TODAS_CITAS: "ver_todas_citas",
  CREAR_CITA: "crear_cita",
  EDITAR_CITA: "editar_cita",
  ELIMINAR_CITA: "eliminar_cita",

  // Usuarios
  VER_USUARIOS: "ver_usuarios",
  CREAR_USUARIO: "crear_usuario",
  EDITAR_USUARIO: "editar_usuario",
  ELIMINAR_USUARIO: "eliminar_usuario",

  // Configuración
  ACCESO_CONFIGURACION: "acceso_configuracion",
}

// Permisos por rol
export const PERMISOS_POR_ROL: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(PERMISOS),
  [ROLES.KINESIOLOGO]: [
    PERMISOS.VER_PACIENTES,
    PERMISOS.CREAR_PACIENTE,
    PERMISOS.EDITAR_PACIENTE,
    PERMISOS.DAR_ALTA_PACIENTE,
    PERMISOS.VER_SESIONES,
    PERMISOS.CREAR_SESION,
    PERMISOS.EDITAR_SESION,
    PERMISOS.VER_CITAS,
    PERMISOS.CREAR_CITA,
    PERMISOS.EDITAR_CITA,
    PERMISOS.ELIMINAR_CITA,
  ],
  [ROLES.RECEPCIONISTA]: [
    PERMISOS.VER_PACIENTES,
    PERMISOS.CREAR_PACIENTE,
    PERMISOS.EDITAR_PACIENTE,
    PERMISOS.VER_CITAS,
    PERMISOS.CREAR_CITA,
    PERMISOS.EDITAR_CITA,
    PERMISOS.ELIMINAR_CITA,
  ],
  [ROLES.USUARIO]: [PERMISOS.VER_PACIENTES, PERMISOS.VER_CITAS],
}

// Estados de las citas
export const ESTADOS_CITA = {
  PENDIENTE: "pendiente",
  CONFIRMADA: "confirmada",
  COMPLETADA: "completada",
  CANCELADA: "cancelada",
  NO_ASISTIO: "no_asistio",
}

// Colores para los estados de las citas
export const COLORES_ESTADO_CITA: Record<string, string> = {
  [ESTADOS_CITA.PENDIENTE]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [ESTADOS_CITA.CONFIRMADA]: "bg-blue-100 text-blue-800 border-blue-300",
  [ESTADOS_CITA.COMPLETADA]: "bg-green-100 text-green-800 border-green-300",
  [ESTADOS_CITA.CANCELADA]: "bg-red-100 text-red-800 border-red-300",
  [ESTADOS_CITA.NO_ASISTIO]: "bg-gray-100 text-gray-800 border-gray-300",
}

// Funciones de los profesionales
export const FUNCIONES = {
  KINESIOLOGA: "kinesiologa",
  MEDICO: "medico",
  ADMINISTRATIVO: "administrativo",
}
