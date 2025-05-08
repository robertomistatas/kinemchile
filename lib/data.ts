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
  diagnosticoMedico?: string
  antecedentesPersonales?: string
  antecedentesClinicosRelevantes?: string
  evaluacionInicial?: string
  evaluacionFinal?: string
  examenesAuxiliares?: string
  fechaInicio?: string
  fechaAlta?: string
  notasAlta?: string
  edad?: string
  genero?: string
  prevision?: string
  oda?: string
  patologias?: string[]
  sesiones?: Array<{
    fecha: string
    observaciones: string
  }>
  activo: boolean
  createdAt: number
  updatedAt?: number
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
