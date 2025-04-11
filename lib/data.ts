// Tipos de datos
export interface Paciente {
  id: string
  nombre: string
  apellido: string
  rut: string
  fechaNacimiento: string
  genero: string
  direccion?: string
  telefono: string
  email?: string
  ocupacion?: string
  prevision: string
  contactoEmergencia?: string
  telefonoEmergencia?: string
  antecedentes?: string
  // Nuevos campos para la ficha kinésica
  oda?: string
  edad?: string
  diagnosticoMedico?: string
  antecedentesClinicosRelevantes?: string
  examenesAuxiliares?: string
  evaluacionInicial?: string
  evaluacionFinal?: string
  sesiones?: Array<{
    fecha: string
    observaciones: string
  }>
}

export interface FichaClinica {
  id: string
  pacienteId: string
  fecha: string
  motivo: string
  evaluacion: string
  diagnostico: string
  tratamiento: string
  observaciones?: string
}

// Datos de ejemplo para pacientes
export const pacientesMock: Paciente[] = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    rut: "12.345.678-9",
    fechaNacimiento: "1985-05-15",
    genero: "masculino",
    direccion: "Av. Providencia 1234, Santiago",
    telefono: "+56 9 1234 5678",
    email: "juan.perez@ejemplo.com",
    ocupacion: "Ingeniero",
    prevision: "Isapre",
    contactoEmergencia: "María Pérez",
    telefonoEmergencia: "+56 9 8765 4321",
    antecedentes: "Hipertensión arterial controlada. Fractura de tobillo derecho en 2018.",
    oda: "12345",
    edad: "38",
    diagnosticoMedico: "Esguince de tobillo grado II",
    antecedentesClinicosRelevantes: "Fractura de tobillo derecho en 2018",
    examenesAuxiliares: "Radiografía de tobillo (15/03/2024): Sin evidencia de fractura",
    evaluacionInicial:
      "Paciente presenta dolor en región lateral de tobillo derecho. EVA 7/10. Edema moderado. Limitación en rango de movimiento de flexión plantar y dorsal. Prueba de cajón anterior positiva.",
    evaluacionFinal: "",
    sesiones: [
      {
        fecha: "2024-03-20",
        observaciones: "Terapia manual: movilización articular de tobillo. Crioterapia. Ejercicios de propiocepción.",
      },
      {
        fecha: "2024-03-22",
        observaciones: "Ultrasonido terapéutico. Ejercicios de fortalecimiento. Vendaje funcional.",
      },
    ],
  },
  {
    id: "2",
    nombre: "Ana",
    apellido: "González",
    rut: "14.567.890-1",
    fechaNacimiento: "1990-08-22",
    genero: "femenino",
    direccion: "Los Leones 567, Providencia",
    telefono: "+56 9 2345 6789",
    email: "ana.gonzalez@ejemplo.com",
    ocupacion: "Profesora",
    prevision: "Fonasa",
    contactoEmergencia: "Carlos González",
    telefonoEmergencia: "+56 9 7654 3210",
    oda: "23456",
    edad: "33",
    diagnosticoMedico: "Cervicalgia mecánica",
    antecedentesClinicosRelevantes: "Migraña crónica",
    examenesAuxiliares: "Radiografía cervical (10/02/2024): Rectificación de lordosis cervical",
    evaluacionInicial:
      "Paciente presenta dolor cervical bilateral con predominio derecho. EVA 6/10. Contractura de trapecio superior y elevador de la escápula bilateral. Limitación en rotación cervical derecha. Cefalea tensional asociada.",
    evaluacionFinal: "",
    sesiones: [
      {
        fecha: "2024-02-15",
        observaciones:
          "Terapia manual: liberación miofascial de trapecio superior y elevador de la escápula. Masoterapia cervical.",
      },
    ],
  },
  {
    id: "3",
    nombre: "Pedro",
    apellido: "Soto",
    rut: "16.789.012-3",
    fechaNacimiento: "1978-12-10",
    genero: "masculino",
    telefono: "+56 9 3456 7890",
    prevision: "Isapre",
  },
  {
    id: "4",
    nombre: "Carla",
    apellido: "Muñoz",
    rut: "18.901.234-5",
    fechaNacimiento: "1995-03-28",
    genero: "femenino",
    direccion: "Manuel Montt 789, Ñuñoa",
    telefono: "+56 9 4567 8901",
    email: "carla.munoz@ejemplo.com",
    ocupacion: "Diseñadora",
    prevision: "Isapre",
  },
  {
    id: "5",
    nombre: "Roberto",
    apellido: "Vega",
    rut: "10.123.456-7",
    fechaNacimiento: "1965-07-05",
    genero: "masculino",
    direccion: "Irarrázaval 1234, Ñuñoa",
    telefono: "+56 9 5678 9012",
    prevision: "Fonasa",
    antecedentes: "Diabetes tipo 2. Artrosis de rodilla bilateral.",
  },
]

// Datos de ejemplo para fichas clínicas
export const fichasMock: FichaClinica[] = [
  {
    id: "1",
    pacienteId: "1",
    fecha: "2023-10-15",
    motivo: "Dolor lumbar de 2 semanas de evolución",
    evaluacion:
      "Paciente presenta dolor lumbar irradiado a miembro inferior derecho. EVA 7/10. Limitación en flexión de tronco. Test de Lasegue positivo a 45° en pierna derecha. Fuerza muscular conservada. Sensibilidad conservada.",
    diagnostico: "Lumbociática derecha",
    tratamiento:
      "Terapia manual: liberación miofascial región lumbar. Ejercicios de estabilización lumbar. Educación postural. Indicaciones para el hogar: aplicación de calor local, ejercicios específicos 2 veces al día.",
    observaciones: "Paciente refiere mejoría parcial al finalizar la sesión. EVA 5/10.",
  },
  {
    id: "2",
    pacienteId: "1",
    fecha: "2023-10-22",
    motivo: "Control por dolor lumbar",
    evaluacion:
      "Paciente refiere disminución del dolor. EVA 4/10. Mejora en rango de movimiento de flexión de tronco. Test de Lasegue positivo a 60°.",
    diagnostico: "Lumbociática derecha en evolución favorable",
    tratamiento:
      "Terapia manual: movilización articular lumbar. TENS analgésico 20 minutos. Progresión de ejercicios de estabilización lumbar. Educación en mecánica corporal.",
    observaciones: "Se indica continuar con ejercicios en domicilio.",
  },
  {
    id: "3",
    pacienteId: "2",
    fecha: "2023-11-05",
    motivo: "Dolor cervical y cefalea",
    evaluacion:
      "Paciente presenta dolor cervical bilateral con predominio derecho. EVA 6/10. Contractura de trapecio superior y elevador de la escápula bilateral. Limitación en rotación cervical derecha. Cefalea tensional asociada.",
    diagnostico: "Cervicalgia mecánica con cefalea tensional",
    tratamiento:
      "Terapia manual: liberación miofascial de trapecio superior y elevador de la escápula. Masoterapia cervical. Ejercicios de movilidad cervical. Educación postural.",
    observaciones: "Se recomienda evaluación de puesto de trabajo.",
  },
]
