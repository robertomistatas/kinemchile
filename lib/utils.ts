import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para validar RUT chileno
export function validarRut(rut: string): boolean {
  // Eliminar puntos y guión
  rut = rut.replace(/\./g, "").replace(/-/g, "")

  // Verificar que el RUT tenga al menos 2 caracteres
  if (rut.length < 2) return false

  // Separar cuerpo y dígito verificador
  const cuerpo = rut.slice(0, -1)
  const dv = rut.slice(-1).toUpperCase()

  // Calcular dígito verificador
  let suma = 0
  let multiplicador = 2

  // Recorrer el cuerpo de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number.parseInt(cuerpo.charAt(i)) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  // Calcular dígito verificador esperado
  const dvEsperado = 11 - (suma % 11)
  let dvCalculado = ""

  if (dvEsperado === 11) dvCalculado = "0"
  else if (dvEsperado === 10) dvCalculado = "K"
  else dvCalculado = dvEsperado.toString()

  // Comparar dígito verificador calculado con el proporcionado
  return dvCalculado === dv
}

// Función para formatear RUT chileno
export function formatearRut(rut: string): string {
  // Eliminar puntos y guión
  rut = rut.replace(/\./g, "").replace(/-/g, "")

  // Verificar que el RUT tenga al menos 2 caracteres
  if (rut.length < 2) return rut

  // Separar cuerpo y dígito verificador
  const cuerpo = rut.slice(0, -1)
  const dv = rut.slice(-1)

  // Formatear cuerpo con puntos
  let rutFormateado = ""
  let i = cuerpo.length

  while (i > 0) {
    const inicio = Math.max(i - 3, 0)
    rutFormateado = cuerpo.substring(inicio, i) + (rutFormateado ? "." + rutFormateado : "")
    i = inicio
  }

  // Retornar RUT formateado
  return rutFormateado + "-" + dv
}
