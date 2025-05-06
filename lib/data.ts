// Tipos de datos para la aplicación
export interface Paciente {
  id: string
  nombre: string
  apellido: string
  rut: string
  email: string
  telefono: string
  fechaNacimiento: string
  direccion?: string
  diagnostico?: string
  antecedentesPersonales?: string
  activo: boolean
  fechaAlta?: string
  notasAlta?: string
  createdAt: number
}

export interface Sesion {
  id: string
  fecha: number | string
  pacienteId: string
  paciente: {
    id: string
    nombre: string
    apellido: string
    rut: string
  }
  tipo: string
  notas: string
  createdAt: number
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: "admin" | "kinesiologo" | "recepcionista"
  createdAt: number
}
