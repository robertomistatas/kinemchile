import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para validar RUT chileno
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false
  
  // Eliminar puntos y guión
  const rutLimpio = rut.replace(/[.-]/g, "").toUpperCase()

  // Verificar que el RUT tenga al menos 2 caracteres y no más de 10
  if (rutLimpio.length < 2 || rutLimpio.length > 10) return false

  // Obtener el dígito verificador
  const dv = rutLimpio.charAt(rutLimpio.length - 1)
  // Obtener el cuerpo del RUT
  const rutSinDv = rutLimpio.substring(0, rutLimpio.length - 1)

  // Verificar que el cuerpo del RUT sea un número
  if (!/^\d+$/.test(rutSinDv)) return false

  // Calcular el dígito verificador
  let suma = 0
  let multiplo = 2

  // Para cada dígito del cuerpo del RUT
  for (let i = rutSinDv.length - 1; i >= 0; i--) {
    suma += Number.parseInt(rutSinDv.charAt(i)) * multiplo
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }

  const dvEsperado = 11 - (suma % 11)
  let dvCalculado = ""

  if (dvEsperado === 11) {
    dvCalculado = "0"
  } else if (dvEsperado === 10) {
    dvCalculado = "K"
  } else {
    dvCalculado = dvEsperado.toString()
  }

  // Comparar el dígito verificador calculado con el proporcionado
  return dv.toUpperCase() === dvCalculado
}

// Función para formatear RUT chileno
export function formatearRut(rut: string): string {
  // Eliminar puntos y guión
  const rutLimpio = rut.replace(/\./g, "").replace("-", "")

  if (rutLimpio.length < 2) return rutLimpio

  // Obtener el dígito verificador
  const dv = rutLimpio.charAt(rutLimpio.length - 1)
  // Obtener el cuerpo del RUT
  const rutSinDv = rutLimpio.substring(0, rutLimpio.length - 1)

  // Formatear el cuerpo del RUT con puntos
  let rutFormateado = ""
  let i = rutSinDv.length

  while (i > 0) {
    const inicio = Math.max(i - 3, 0)
    rutFormateado = rutSinDv.substring(inicio, i) + (rutFormateado ? "." + rutFormateado : "")
    i = inicio
  }

  // Retornar el RUT formateado
  return rutFormateado + "-" + dv
}
