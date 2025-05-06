// Re-exportar desde la nueva ubicación para mantener compatibilidad
export {
  getPacientesActivos,
  getPacientes,
  getSesiones,
  getPaciente,
  getSesionesPaciente,
  actualizarPaciente,
  crearPaciente,
  darDeAltaPaciente,
  eliminarPaciente,
  getSesion,
  crearSesion,
  actualizarSesion,
  eliminarSesion,
} from "@/lib/firestore-service"
