# Flujo Kinem - Documentación Completa del Sistema

**Fecha de documentación**: Diciembre 2025  
**Versión**: Beta 1.0  
**Sistema**: Aplicación Web de Gestión de Pacientes para Kinem Chile

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Base de Datos (Firebase Firestore)](#base-de-datos-firebase-firestore)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Módulos Principales](#módulos-principales)
8. [Flujo de Usuario](#flujo-de-usuario)
9. [Componentes Clave](#componentes-clave)
10. [Servicios y Utilidades](#servicios-y-utilidades)
11. [Estilos y Temas](#estilos-y-temas)
12. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
13. [Optimizaciones y Buenas Prácticas](#optimizaciones-y-buenas-prácticas)
14. [Problemas Conocidos y Soluciones](#problemas-conocidos-y-soluciones)
15. [Próximas Mejoras](#próximas-mejoras)

---

## 📖 Descripción General

**Kinem Chile** es una aplicación web moderna para la gestión integral de pacientes de kinesiología. El sistema permite:

- **Gestión de pacientes**: Crear, editar, visualizar y dar de alta pacientes
- **Control de sesiones**: Registrar sesiones de tratamiento con notas detalladas
- **Agenda de citas**: Sistema de calendario para programar y gestionar citas
- **Cola de espera**: Sistema en tiempo real para gestionar la lista de espera de pacientes del día
- **Sistema de roles**: Diferenciación entre administradores, kinesiólogos y recepcionistas
- **Gestión de usuarios**: Panel administrativo para crear y gestionar usuarios del sistema
- **Asignación de profesionales**: Vincular pacientes con kinesiólogos o médicos tratantes
- **Informes y fichas**: Generación de fichas clínicas en PDF

### Características Destacadas

- ✅ **Multi-usuario en tiempo real**: Sincronización automática entre múltiples computadores
- ✅ **Sistema de permisos granular**: Control detallado de accesos por rol
- ✅ **Persistencia de datos diaria**: La cola de espera se mantiene durante todo el día
- ✅ **Interfaz responsiva**: Diseño adaptable para desktop, tablet y móvil
- ✅ **Modo oscuro/claro**: Tema personalizable según preferencia del usuario
- ✅ **Drag & Drop**: Reordenamiento intuitivo de la cola de espera
- ✅ **Búsqueda inteligente**: Búsqueda por nombre, RUT o cualquier campo del paciente
- ✅ **Exportación a PDF**: Generación de fichas clínicas completas

---

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: Next.js 15.2.4 (App Router)
- **React**: 19.x
- **TypeScript**: 5.x
- **Styling**: 
  - Tailwind CSS 3.4.17
  - Radix UI (componentes accesibles)
  - shadcn/ui (sistema de componentes)
- **Gestión de estado**: React Context API
- **Drag & Drop**: @dnd-kit
- **Formularios**: react-hook-form + zod (validación)
- **Fechas**: date-fns
- **PDF**: jspdf + jspdf-autotable
- **Temas**: next-themes
- **Iconos**: lucide-react

### Backend / Base de Datos

- **Backend as a Service**: Firebase (Google)
  - **Authentication**: Firebase Auth (email/password)
  - **Database**: Cloud Firestore (NoSQL)
  - **Hosting**: Firebase Hosting (potencial)

### Herramientas de Desarrollo

- **Package Manager**: npm
- **Linter**: ESLint
- **Type Checking**: TypeScript
- **Dev Server**: Next.js Dev Server (hot reload)

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Next.js App (SSR + CSR)                     │   │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────────────┐  │   │
│  │  │   Pages    │  │ Context  │  │   Components    │  │   │
│  │  │  (Routes)  │  │   API    │  │   (UI/Logic)    │  │   │
│  │  └────────────┘  └──────────┘  └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE (Backend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Firebase Auth          │  Cloud Firestore           │   │
│  │  - Autenticación        │  - Base de datos NoSQL     │   │
│  │  - Gestión de usuarios  │  - Colecciones:            │   │
│  │                         │    * pacientes             │   │
│  │                         │    * sesiones              │   │
│  │                         │    * citas                 │   │
│  │                         │    * usuarios              │   │
│  │                         │    * cola-espera           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Patrón de Arquitectura

**Client-Side Rendering (CSR) con Server-Side Rendering (SSR)**

- **SSR**: Next.js renderiza el layout y estructura inicial en el servidor
- **CSR**: La lógica de negocio y datos se cargan/manejan en el cliente
- **"use client"**: Directiva utilizada para componentes que requieren interactividad

### Flujo de Datos

```
Usuario → Interfaz (React Components)
         ↓
    Context API (useAuth, useContext)
         ↓
    Servicios (firestore-service.ts)
         ↓
    Firebase SDK
         ↓
    Cloud Firestore
         ↓
    Sincronización en Tiempo Real
         ↓
    Actualización UI
```

---

## 📁 Estructura de Carpetas

```
kinemchile/
├── app/                          # App Router de Next.js (rutas)
│   ├── actions.ts               # Server actions (no usado actualmente)
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz de la app
│   ├── loading.tsx              # Componente de carga global
│   ├── page.tsx                 # Página de inicio (landing)
│   ├── firebase-client-initializer.tsx  # Inicializador de Firebase
│   │
│   ├── admin/                   # Panel de administración
│   │   └── page.tsx            # Gestión de usuarios
│   │
│   ├── agenda/                  # Sistema de citas y cola de espera
│   │   ├── page.tsx            # Página principal de agenda/cola
│   │   └── [versiones antiguas]
│   │
│   ├── configuracion/           # Configuración del sistema
│   │   └── page.tsx
│   │
│   ├── dashboard/               # Dashboard principal
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── login/                   # Autenticación
│   │   └── page.tsx
│   │
│   ├── pacientes/               # Gestión de pacientes
│   │   ├── page.tsx            # Lista de pacientes
│   │   ├── [id]/               # Ficha del paciente
│   │   │   └── page.tsx
│   │   └── nuevo/              # Crear paciente
│   │       └── page.tsx
│   │
│   ├── pacientes-alta/          # Pacientes dados de alta
│   │   └── page.tsx
│   │
│   └── prestaciones/            # Gestión de prestaciones
│       └── page.tsx
│
├── components/                  # Componentes React reutilizables
│   ├── auth-provider.tsx       # Provider de autenticación
│   ├── buscar-paciente-dialog.tsx  # Diálogo búsqueda pacientes
│   ├── configuracion-cola.tsx  # Config. de cola de espera
│   ├── layout.tsx              # Layout principal con navegación
│   ├── notification-sound.tsx  # Sistema de notificaciones sonoras
│   ├── permission-gate.tsx     # Control de permisos
│   ├── real-time-clock.tsx     # Reloj en tiempo real
│   ├── theme-provider.tsx      # Provider de temas
│   │
│   ├── admin-panel/            # Componentes del panel admin
│   │   ├── crear-usuario-form.tsx
│   │   └── usuarios-table.tsx
│   │
│   └── ui/                     # Componentes UI de shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── [50+ componentes]
│
├── context/                     # Contextos de React
│   └── auth-context.tsx        # Contexto de autenticación
│
├── hooks/                       # Custom React Hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                         # Librerías y utilidades
│   ├── data.ts                 # Tipos TypeScript e interfaces
│   ├── firebase.ts             # Configuración de Firebase
│   ├── firestore-service.ts    # Servicios de Firestore (CRUD)
│   └── utils.ts                # Funciones utilitarias
│
├── public/                      # Archivos estáticos
│
├── styles/                      # Estilos adicionales
│   └── globals.css
│
├── types/                       # Definiciones de tipos
│   └── jspdf.d.ts
│
├── components.json              # Configuración de shadcn/ui
├── next.config.mjs             # Configuración de Next.js
├── package.json                # Dependencias del proyecto
├── tailwind.config.ts          # Configuración de Tailwind
└── tsconfig.json               # Configuración de TypeScript
```

### Convenciones de Nomenclatura

- **Componentes**: PascalCase (ej: `BuscarPacienteDialog.tsx`)
- **Páginas**: kebab-case en carpetas, PascalCase en componentes
- **Servicios**: camelCase (ej: `getPacientes`, `crearSesion`)
- **Tipos**: PascalCase (ej: `Paciente`, `Usuario`, `Cita`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `ROLES`, `PERMISOS`)

---

## 🗄️ Base de Datos (Firebase Firestore)

### Configuración de Firebase

```typescript
// lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDd2DbPqo7HsOvDsrTszgLCuU8zJUZdQ6Y",
  authDomain: "kinem-b904e.firebaseapp.com",
  projectId: "kinem-b904e",
  storageBucket: "kinem-b904e.firebasestorage.app",
  messagingSenderId: "30584936443",
  appId: "1:30584936443:web:db51131bbe7a97f5999d5e",
}
```

### Colecciones y Esquemas

#### 1. **Colección: `pacientes`**

Almacena información completa de los pacientes.

```typescript
interface Paciente {
  id?: string                        // ID del documento (auto-generado)
  nombre: string                     // Nombre del paciente
  apellido: string                   // Apellido
  rut: string                        // RUT único
  fechaNacimiento: string            // Formato: YYYY-MM-DD
  telefono: string                   // Número de contacto
  email: string                      // Email de contacto
  direccion: string                  // Dirección física
  prevision?: string                 // Previsión de salud (Fonasa, Isapre, etc.)
  diagnostico?: string               // Diagnóstico kinesiológico
  diagnosticoMedico?: string         // Diagnóstico médico
  antecedentesPersonales?: string    // Antecedentes del paciente
  antecedentesClinicosRelevantes?: string
  observaciones?: string
  activo?: boolean                   // Estado activo/inactivo
  
  // Profesional tratante
  tratante_id?: string               // ID del profesional
  tratante_nombre?: string           // Nombre del profesional
  tratante_funcion?: string          // kinesiologa | medico
  
  // Legacy (compatibilidad)
  kinesiologo_id?: string | null
  kinesiologo_nombre?: string | null
  
  // Alta del paciente
  profesional_alta_id?: string | null      // Quién dio de alta
  profesional_alta_nombre?: string | null
  fechaAlta?: string | null          // Fecha del alta
  notasAlta?: string | null          // Notas del alta
  
  // Campos adicionales
  fechaIngreso?: string              // Formato: DD-MM-AAAA
  edad?: string
  genero?: string
  evaluacionInicial?: string
  evaluacionFinal?: string
  examenesAuxiliares?: string
  fechaInicio?: string
  
  // Metadatos
  createdAt?: string | number        // Timestamp de creación
  updatedAt?: string | number        // Timestamp de actualización
}
```

**Índices necesarios**:
- `activo` (para filtrar pacientes activos)
- `rut` (único, para búsquedas)
- `tratante_id` (para filtrar por profesional)

#### 2. **Colección: `sesiones`**

Registros de sesiones de tratamiento.

```typescript
interface Sesion {
  id?: string                    // ID del documento
  pacienteId: string            // Referencia al paciente
  fecha: string | number        // Timestamp de la sesión
  hora: string                  // Hora en formato HH:MM
  duracion: number              // Duración en minutos
  estado: string                // Estado de la sesión
  tipo?: string                 // Evaluación | Tratamiento | Control
  notas: string                 // Notas del kinesiólogo
  createdAt?: string            // Timestamp de creación
  updatedAt?: string            // Timestamp de actualización
  
  // Información del paciente (desnormalizada)
  paciente?: {
    id: string
    nombre: string
    apellido: string
    rut: string
  }
}
```

**Índices necesarios**:
- `pacienteId` (para consultar sesiones de un paciente)
- `fecha` (para ordenar por fecha)
- Índice compuesto: `pacienteId` + `fecha`

#### 3. **Colección: `citas`**

Gestión de citas programadas.

```typescript
interface Cita {
  id?: string                     // ID del documento
  pacienteId: string             // Referencia al paciente
  fecha: string | number         // Timestamp de la cita
  hora: string                   // Hora en formato HH:MM
  duracion: number               // Duración en minutos (default: 60)
  estado: string                 // programada | completada | cancelada
  motivo?: string                // Motivo de la consulta
  prevision?: string             // Previsión del paciente
  notas?: string                 // Notas adicionales
  
  // Profesional asignado
  profesional_id?: string
  profesional_nombre?: string
  profesional_funcion?: string
  
  // Información del paciente (desnormalizada)
  paciente?: {
    id: string
    nombre: string
    apellido: string
    rut: string
  }
  pacienteNombre?: string
  pacienteApellido?: string
  pacienteRut?: string
  
  // Metadatos
  createdAt?: string | number
  updatedAt?: string | number
}
```

**Índices necesarios**:
- `fecha` (para consultar citas por día)
- `pacienteId` (para consultar citas de un paciente)
- `profesional_id` (para filtrar por profesional)

#### 4. **Colección: `usuarios`**

Usuarios del sistema con sus roles y permisos.

```typescript
interface Usuario {
  id?: string                // ID del documento
  email: string             // Email único (usado para login)
  nombre: string            // Nombre completo
  rut?: string              // RUT del profesional
  telefono?: string         // Teléfono de contacto
  funcion?: string          // kinesiologa | medico | administrativo
  rol: string               // admin | kinesiologo | recepcionista
  permisos?: string[]       // Array de permisos específicos
  activo?: boolean          // Usuario activo/inactivo
  createdAt?: string        // Timestamp de creación
  updatedAt?: string        // Timestamp de actualización
}
```

**Índices necesarios**:
- `email` (único, para autenticación)
- `rol` (para filtrar por rol)
- `funcion` (para filtrar por función)

#### 5. **Colección: `cola-espera`**

Lista de espera de pacientes del día (se limpia diariamente).

```typescript
interface PacienteEspera {
  id: string                      // ID del documento
  nombre: string                  // Nombre del paciente
  turno: string                   // Turno asignado (HH:MM)
  color: string                   // Color hexadecimal para UI
  estado: 'esperando' | 'en-consulta' | 'atendido'
  horaIngreso: Date              // Timestamp de ingreso
  
  // Referencia al paciente (opcional)
  pacienteId?: string            // ID si tiene ficha
  rut?: string                   // RUT del paciente
  tieneFicha: boolean           // Si tiene ficha en el sistema
  
  // Control de día
  fechaCola: string             // Formato: YYYY-MM-DD
  orden?: number                // Orden en la cola
}
```

**Índices necesarios**:
- `fechaCola` (para filtrar por día)
- Índice compuesto: `fechaCola` + `orden` (para ordenar la cola)

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función para verificar si el usuario es admin
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Colección de pacientes
    match /pacientes/{pacienteId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if isAdmin();
    }
    
    // Colección de sesiones
    match /sesiones/{sesionId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }
    
    // Colección de citas
    match /citas/{citaId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }
    
    // Colección de usuarios
    match /usuarios/{userId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin();
    }
    
    // Colección de cola de espera
    match /cola-espera/{entradaId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }
  }
}
```

---

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

**Firebase Authentication** maneja la autenticación de usuarios:

1. **Método**: Email y contraseña
2. **Provider**: Firebase Auth
3. **Flujo**:
   ```
   Usuario ingresa credenciales
   → Firebase Auth valida
   → Se obtiene el token JWT
   → Se carga información del usuario desde Firestore
   → Se establecen permisos según rol
   ```

### Context de Autenticación

Ubicación: `context/auth-context.tsx` y `components/auth-provider.tsx`

```typescript
// Estructura del contexto
interface AuthContextType {
  user: User | null              // Usuario de Firebase Auth
  userInfo: Usuario | null       // Información adicional de Firestore
  userPermisos: string[]         // Permisos del usuario
  loading: boolean               // Estado de carga
  error: string | null           // Errores de autenticación
  login: (email, password) => Promise<void>
  logout: () => Promise<void>
}
```

### Sistema de Roles

Definidos en `lib/data.ts`:

```typescript
const ROLES = {
  ADMIN: "admin",              // Acceso total
  KINESIOLOGO: "kinesiologo",  // Gestión de pacientes y sesiones
  RECEPCIONISTA: "recepcionista", // Gestión de citas y recepción
  USUARIO: "usuario"           // Solo lectura
}
```

### Sistema de Permisos

Permisos granulares definidos por módulo:

```typescript
const PERMISOS = {
  // Pacientes
  VER_PACIENTES: "ver_pacientes",
  VER_TODOS_PACIENTES: "ver_todos_pacientes",
  CREAR_PACIENTE: "crear_paciente",
  EDITAR_PACIENTE: "editar_paciente",
  ELIMINAR_PACIENTE: "eliminar_paciente",
  DAR_ALTA_PACIENTE: "dar_alta_paciente",
  
  // Sesiones
  VER_SESIONES: "ver_sesiones",
  CREAR_SESION: "crear_sesion",
  EDITAR_SESION: "editar_sesion",
  ELIMINAR_SESION: "eliminar_sesion",
  
  // Citas
  VER_CITAS: "ver_citas",
  CREAR_CITA: "crear_cita",
  EDITAR_CITA: "editar_cita",
  ELIMINAR_CITA: "eliminar_cita",
  
  // Usuarios (solo admin)
  VER_USUARIOS: "ver_usuarios",
  CREAR_USUARIO: "crear_usuario",
  EDITAR_USUARIO: "editar_usuario",
  ELIMINAR_USUARIO: "eliminar_usuario",
  
  // Otros
  PACIENTES_ASIGNAR_KINESIOLOGO: "pacientes_asignar_kinesiologo",
  ACCESO_CONFIGURACION: "acceso_configuracion"
}
```

### Matriz de Permisos por Rol

```typescript
const PERMISOS_POR_ROL = {
  admin: [/* TODOS LOS PERMISOS */],
  
  kinesiologo: [
    "ver_pacientes",
    "crear_paciente",
    "editar_paciente",
    "dar_alta_paciente",
    "ver_sesiones",
    "crear_sesion",
    "editar_sesion",
    "ver_citas",
    "crear_cita",
    "editar_cita",
    "eliminar_cita"
  ],
  
  recepcionista: [
    "ver_pacientes",
    "crear_paciente",
    "editar_paciente",
    "ver_citas",
    "crear_cita",
    "editar_cita",
    "eliminar_cita"
  ],
  
  usuario: [
    "ver_pacientes",
    "ver_citas"
  ]
}
```

### Protección de Rutas

```typescript
// Componente: components/permission-gate.tsx
export function PermissionGate({ 
  children, 
  permiso, 
  fallback 
}) {
  const { userPermisos } = useAuth()
  
  if (!userPermisos.includes(permiso)) {
    return fallback || <div>No tienes permisos</div>
  }
  
  return children
}
```

---

## 📦 Módulos Principales

### 1. Dashboard

**Ruta**: `/dashboard`  
**Archivo**: `app/dashboard/page.tsx`

**Funcionalidad**:
- Resumen de estadísticas (pacientes totales, activos, sesiones)
- Lista de próximas citas del día
- Saludo personalizado según hora del día
- Filtrado automático por profesional para kinesiólogos

**Características**:
- SSR + CSR híbrido
- Actualización automática de datos
- Estadísticas en tiempo real

### 2. Gestión de Pacientes

**Ruta**: `/pacientes`  
**Archivo**: `app/pacientes/page.tsx`

**Funcionalidad**:
- Lista completa de pacientes activos
- Búsqueda en tiempo real (nombre, RUT, teléfono, fecha)
- Ordenamiento por nombre o fecha de ingreso
- Filtros por profesional tratante
- Acciones rápidas: Ver ficha, Editar, Eliminar

**Sub-rutas**:
- `/pacientes/nuevo` - Crear paciente
- `/pacientes/[id]` - Ficha del paciente
- `/pacientes/[id]/editar` - Editar paciente

**Ficha del Paciente** (`/pacientes/[id]`):
- Información completa del paciente
- Historial de sesiones
- Evaluaciones (inicial/final)
- Diagnósticos médicos y kinesiológicos
- Antecedentes clínicos
- Exámenes auxiliares
- Botón para dar de alta
- Generación de PDF de la ficha

### 3. Pacientes de Alta

**Ruta**: `/pacientes-alta`  
**Archivo**: `app/pacientes-alta/page.tsx`

**Funcionalidad**:
- Lista de pacientes dados de alta
- Filtro por profesional que dio de alta
- Visualización de notas de alta
- Acceso a fichas históricas
- Exportación de informes

### 4. Agenda y Cola de Espera

**Ruta**: `/agenda`  
**Archivo**: `app/agenda/page.tsx`

**Funcionalidad Principal**:
- **Sistema de cola de espera en tiempo real**
- Sincronización automática entre computadores
- Drag & Drop para reordenar pacientes
- Estados: Esperando → En Consulta → Atendido
- Búsqueda de pacientes con/sin ficha
- Indicadores de tiempo de espera
- Estadísticas en tiempo real
- Persistencia durante todo el día

**Características Técnicas**:
- Librería: `@dnd-kit` para drag & drop
- Sincronización cada 30 segundos
- Actualización al recuperar foco de ventana
- Limpieza automática de colas anteriores

**Flujo de Trabajo**:
```
1. Recepcionista busca paciente
2. Paciente se agrega a cola con color único
3. Se muestra en orden de llegada
4. Kinesiólogo cambia estado a "En Consulta"
5. Al finalizar, se marca como "Atendido"
6. Pacientes atendidos permanecen hasta fin del día
7. Nueva cola se crea automáticamente al día siguiente
```

### 5. Panel de Administración

**Ruta**: `/admin` o `/configuracion`  
**Archivo**: `app/admin/page.tsx`

**Funcionalidad**:
- Crear nuevos usuarios del sistema
- Asignar roles y permisos
- Gestionar funciones (kinesiólogo, médico, admin)
- Ver lista de usuarios
- Activar/desactivar usuarios

**Solo accesible para**: Rol `admin` o `superadmin`

### 6. Login

**Ruta**: `/login`  
**Archivo**: `app/login/page.tsx`

**Funcionalidad**:
- Formulario de inicio de sesión
- Validación de credenciales con Firebase Auth
- Manejo de errores detallado
- Formulario de contacto para solicitar acceso
- Redirección automática al dashboard tras login exitoso

---

## 🔄 Flujo de Usuario

### Flujo Completo de un Usuario Tipo

#### 1. **Recepcionista**

```
Login → Dashboard
  ↓
Ver pacientes del día en la cola
  ↓
Agregar nuevo paciente a cola
  - Buscar si tiene ficha → Sí: Seleccionar / No: Crear manual
  ↓
Paciente espera en cola (estado: "esperando")
  ↓
Kinesiólogo marca como "en consulta"
  ↓
Después de atención: marca como "atendido"
  ↓
Paciente permanece en lista hasta fin del día
```

#### 2. **Kinesiólogo**

```
Login → Dashboard
  ↓
Ver estadísticas de sus pacientes
  ↓
Opción A: Atender cola de espera
  - Cambiar estado de pacientes
  - Ver ficha si tiene (click en nombre)
  
Opción B: Gestionar pacientes
  - Ver lista de sus pacientes
  - Crear nueva ficha
  - Agregar sesión de tratamiento
  - Ver historial completo
  - Dar de alta paciente
  
Opción C: Ver agenda
  - Citas programadas
  - Crear nueva cita
```

#### 3. **Administrador**

```
Login → Dashboard
  ↓
Acceso completo a todos los módulos
  ↓
Panel de administración
  - Crear usuarios
  - Asignar roles y permisos
  - Ver todos los pacientes
  - Gestionar configuración del sistema
```

### Flujo de Datos en Operaciones Comunes

#### Crear un Paciente

```
Usuario completa formulario
  ↓
Validación con react-hook-form + zod
  ↓
Llamada a crearPaciente(datos)
  ↓
firestore-service.ts → addDoc()
  ↓
Firebase crea documento en colección "pacientes"
  ↓
Retorna ID del documento
  ↓
Redirección a /pacientes/[nuevo-id]
```

#### Agregar Paciente a Cola

```
Usuario busca paciente o ingresa manual
  ↓
BuscarPacienteDialog o formulario manual
  ↓
Llamada a agregarPacienteACola(datos)
  ↓
firestore-service.ts → addDoc() con fechaCola
  ↓
Firebase guarda en colección "cola-espera"
  ↓
Listener en tiempo real actualiza UI
  ↓
Paciente aparece en la cola de todos los computadores
```

#### Cambiar Estado en Cola

```
Usuario hace click en botón de cambio de estado
  ↓
Llamada a actualizarEstadoPacienteCola(id, nuevoEstado)
  ↓
firestore-service.ts → updateDoc()
  ↓
Firebase actualiza documento
  ↓
Sincronización en tiempo real actualiza todas las pantallas
```

---

## 🧩 Componentes Clave

### 1. Layout Principal

**Archivo**: `components/layout.tsx`

**Responsabilidades**:
- Header con navegación
- Logo
- Menú responsive (mobile/desktop)
- Avatar de usuario y dropdown
- Toggle de tema (oscuro/claro)
- Reloj en tiempo real
- Footer

**Características**:
- Navegación tipo "tabs" centrada (desktop)
- Sheet lateral para móviles
- Active state en rutas actuales

### 2. AuthProvider

**Archivo**: `components/auth-provider.tsx` + `context/auth-context.tsx`

**Responsabilidades**:
- Gestionar estado de autenticación
- Proveer información del usuario
- Cargar permisos desde Firestore
- Funciones de login/logout
- Proteger rutas privadas

**Uso**:
```typescript
const { user, userInfo, userPermisos, login, logout } = useAuth()
```

### 3. BuscarPacienteDialog

**Archivo**: `components/buscar-paciente-dialog.tsx`

**Responsabilidades**:
- Buscar pacientes por nombre o RUT
- Permitir agregar sin ficha
- Seleccionar paciente existente
- Integración con cola de espera

**Características**:
- Búsqueda en tiempo real
- Resultados paginados
- Resaltado de coincidencias

### 4. ConfiguracionCola

**Archivo**: `components/configuracion-cola.tsx`

**Responsabilidades**:
- Configurar preferencias de la cola
- Activar/desactivar sonidos
- Ajustar volumen de notificaciones
- Mostrar/ocultar tiempos de espera
- Auto-avanzar estados

### 5. Componentes UI (shadcn/ui)

Librería de componentes reutilizables en `components/ui/`:

- **Button**: Botones con variantes
- **Card**: Tarjetas con header/content/footer
- **Dialog**: Modales y diálogos
- **Input**: Campos de texto
- **Table**: Tablas de datos
- **Select**: Selectores dropdown
- **Badge**: Etiquetas de estado
- **Alert**: Alertas y notificaciones
- **Sheet**: Panel lateral deslizante
- **Avatar**: Avatares de usuario
- **Calendar**: Selector de fechas
- **Tabs**: Pestañas de navegación

Todos los componentes están estilizados con Tailwind CSS y son totalmente accesibles (Radix UI).

---

## 🔧 Servicios y Utilidades

### Firestore Service

**Archivo**: `lib/firestore-service.ts`

**Principales Funciones**:

#### Pacientes
```typescript
getPacientes(): Promise<Paciente[]>
getPacientesActivos(): Promise<Paciente[]>
getPaciente(id: string): Promise<Paciente | null>
crearPaciente(paciente: Omit<Paciente, 'id'>): Promise<string>
actualizarPaciente(id: string, datos: Partial<Paciente>): Promise<void>
eliminarPaciente(id: string): Promise<void>
darDeAltaPaciente(id: string, notas: string, profesionalId?, profesionalNombre?): Promise<void>
getPacientesInactivos(): Promise<Paciente[]>
getPacientesPorKinesiologo(kinesiologoId: string): Promise<Paciente[]>
buscarPacientes(termino: string): Promise<Paciente[]>
asignarTratanteAPaciente(pacienteId, tratanteId, tratanteNombre, tratanteFuncion): Promise<void>
```

#### Sesiones
```typescript
getSesiones(): Promise<Sesion[]>
getSesion(id: string): Promise<Sesion | null>
getSesionesPaciente(pacienteId: string): Promise<Sesion[]>
crearSesion(sesion: Omit<Sesion, 'id'>): Promise<string>
actualizarSesion(id: string, datos: Partial<Sesion>): Promise<void>
eliminarSesion(id: string): Promise<void>
```

#### Citas
```typescript
getCitas(): Promise<Cita[]>
getCitasPorFecha(fecha: Date): Promise<Cita[]>
getCitasPaciente(pacienteId: string): Promise<Cita[]>
getCita(id: string): Promise<Cita | null>
crearCita(cita: Omit<Cita, 'id'>): Promise<string>
actualizarCita(id: string, datos: Partial<Cita>): Promise<void>
cambiarEstadoCita(id: string, estado: string): Promise<void>
eliminarCita(id: string): Promise<void>
```

#### Usuarios
```typescript
getUsuarios(): Promise<Usuario[]>
getUsuario(id: string): Promise<Usuario | null>
getUsuarioByEmail(email: string): Promise<Usuario | null>
crearUsuario(usuario: Omit<Usuario, 'id'>): Promise<string>
actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<void>
eliminarUsuario(id: string): Promise<void>
getProfesionales(): Promise<Usuario[]>
getProfesionalesPorFuncion(funcion: string): Promise<Usuario[]>
```

#### Cola de Espera
```typescript
getColaEsperaDia(fecha?: string): Promise<PacienteEspera[]>
agregarPacienteACola(paciente: Omit<PacienteEspera, 'id' | 'fechaCola'>): Promise<string | null>
actualizarEstadoPacienteCola(id: string, nuevoEstado: string): Promise<boolean>
eliminarPacienteDeCola(id: string): Promise<boolean>
reordenarCola(pacientesOrdenados: PacienteEspera[]): Promise<boolean>
limpiarColaDia(fecha?: string): Promise<boolean>
getEstadisticasColaDia(fecha?: string): Promise<Estadisticas>
limpiarColasAnteriores(): Promise<boolean>
```

### Utilidades

**Archivo**: `lib/utils.ts`

```typescript
// Función para combinar clases de Tailwind
cn(...inputs: ClassValue[]): string

// Ejemplo:
cn("text-red-500", condition && "font-bold")
```

---

## 🎨 Estilos y Temas

### Tailwind CSS

**Configuración**: `tailwind.config.ts`

**Paleta de Colores Personalizada**:
```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))"
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))"
  },
  // ... más colores
}
```

### Sistema de Temas

**Provider**: `components/theme-provider.tsx`  
**Librería**: `next-themes`

**Uso**:
```typescript
const { theme, setTheme } = useTheme()

// Cambiar tema
setTheme('dark')  // 'light' | 'dark' | 'system'
```

**Variables CSS** (`globals.css`):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Componentes Responsivos

Breakpoints de Tailwind:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

Ejemplo:
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>
```

---

## ⚙️ Configuración y Variables de Entorno

### Next.js Config

**Archivo**: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['static.wixstatic.com'], // Para imágenes externas
  },
  // Configuraciones adicionales
}

export default nextConfig
```

### TypeScript Config

**Archivo**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]  // Alias para imports
    }
  }
}
```

### Variables de Entorno

**Archivo**: `.env.local` (NO incluido en repo)

```bash
# Firebase Configuration (ya está hardcodeado en firebase.ts)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDd2DbPqo7HsOvDsrTszgLCuU8zJUZdQ6Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kinem-b904e.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kinem-b904e
# ... otros valores de Firebase
```

**⚠️ IMPORTANTE**: Actualmente las credenciales de Firebase están hardcodeadas en `lib/firebase.ts`. Para producción, se recomienda moverlas a variables de entorno.

---

## 🚀 Optimizaciones y Buenas Prácticas

### 1. Optimización de Rendimiento

- **Code Splitting**: Next.js divide automáticamente el código por rutas
- **Lazy Loading**: Componentes cargados bajo demanda
- **Memoización**: Uso de `useMemo` y `useCallback` en componentes complejos
- **Debouncing**: En búsquedas para reducir llamadas a Firebase

### 2. Gestión de Estado

- **Context API**: Para estado global (autenticación)
- **Estado Local**: Para UI y datos temporales
- **No Redux**: Se evita complejidad innecesaria

### 3. Seguridad

- **Firebase Auth**: Autenticación segura con tokens JWT
- **Firestore Rules**: Control de acceso a nivel de base de datos
- **Validación de Formularios**: zod para validación de esquemas
- **Sanitización**: Prevención de XSS en inputs

### 4. Accesibilidad

- **Radix UI**: Componentes accesibles por defecto
- **ARIA Labels**: Etiquetas descriptivas
- **Navegación con teclado**: Todos los componentes navegables
- **Contraste**: Cumple con WCAG 2.1 AA

### 5. SEO y Metadatos

```typescript
// app/layout.tsx
export const metadata = {
  title: "Kinem Chile",
  description: "Sistema de gestión para Kinem Chile",
  generator: 'v0.dev'
}
```

### 6. Manejo de Errores

```typescript
try {
  await operacionFirebase()
} catch (error) {
  console.error("Error detallado:", error)
  // Mostrar toast al usuario
  toast.error("Ocurrió un error. Intenta nuevamente.")
}
```

---

## ⚠️ Problemas Conocidos y Soluciones

### 1. Hydration Mismatch

**Problema**: Error de Next.js cuando el HTML del servidor no coincide con el cliente.

**Solución**:
```tsx
// Usar suppressHydrationWarning
<html suppressHydrationWarning>
<body suppressHydrationWarning>

// O renderizar solo en cliente
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
if (!isMounted) return null
```

### 2. Firebase Initialization en SSR

**Problema**: Firebase no puede inicializarse en el servidor.

**Solución**:
```typescript
if (typeof window === "undefined") {
  return { app: null, auth: null, db: null }
}
```

### 3. Fechas en Formatos Inconsistentes

**Problema**: Fechas guardadas como string, número o Timestamp de Firebase.

**Solución**:
```typescript
// Normalizar siempre a timestamp numérico
const fecha = typeof data.fecha === 'object' && data.fecha.toDate
  ? data.fecha.toDate().getTime()
  : typeof data.fecha === 'string'
    ? new Date(data.fecha).getTime()
    : data.fecha
```

### 4. Índices Compuestos en Firestore

**Problema**: Consultas con múltiples where() o orderBy() requieren índices.

**Solución**:
- Firebase muestra un link para crear el índice automáticamente
- O filtrar en memoria después de obtener datos

### 5. Sincronización de Cola entre Computadores

**Problema**: Cambios en un computador no se reflejan inmediatamente en otros.

**Solución**:
- Polling cada 30 segundos
- Actualización al recuperar foco de ventana
- Listeners de visibilidad de página

---

## 📈 Próximas Mejoras

### Corto Plazo (1-3 meses)

1. **Notificaciones Push**
   - Alertas de nuevas citas
   - Recordatorios de pacientes en espera
   - Sistema de notificaciones en tiempo real con Firebase Cloud Messaging

2. **Reportes y Estadísticas Avanzadas**
   - Dashboard con gráficos (usando recharts)
   - Reportes mensuales automáticos
   - Exportación a Excel

3. **Sistema de Mensajería**
   - Chat interno entre profesionales
   - Envío de recordatorios por SMS/WhatsApp

4. **Mejoras en Búsqueda**
   - Búsqueda avanzada con filtros múltiples
   - Búsqueda por diagnóstico
   - Historial de búsquedas

### Medio Plazo (3-6 meses)

1. **Integración con Facturación**
   - Generación de boletas
   - Control de pagos
   - Integración con sistemas de previsión

2. **App Móvil**
   - React Native para iOS/Android
   - Versión PWA

3. **Almacenamiento de Archivos**
   - Firebase Storage para exámenes, imágenes
   - Visor de archivos médicos

4. **Sistema de Backup Automático**
   - Backup diario de datos
   - Exportación completa

### Largo Plazo (6+ meses)

1. **Inteligencia Artificial**
   - Sugerencias de diagnósticos
   - Análisis predictivo de tratamientos
   - Chatbot de asistencia

2. **Telemedicina**
   - Video consultas integradas
   - Recetas digitales

3. **Sistema Multi-sucursal**
   - Gestión de múltiples clínicas
   - Dashboard consolidado

---

## 📚 Recursos y Referencias

### Documentación Oficial

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase](https://firebase.google.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

### Librerías Clave

- [@dnd-kit](https://docs.dndkit.com/) - Drag and Drop
- [react-hook-form](https://react-hook-form.com/) - Formularios
- [zod](https://zod.dev/) - Validación de esquemas
- [jspdf](https://github.com/parallax/jsPDF) - Generación de PDF
- [date-fns](https://date-fns.org/) - Manejo de fechas
- [lucide-react](https://lucide.dev/) - Iconos

---

## 🎯 Conclusión

Este sistema está diseñado para ser:

- ✅ **Escalable**: Arquitectura modular que permite agregar funcionalidades
- ✅ **Mantenible**: Código limpio y bien documentado
- ✅ **Seguro**: Autenticación robusta y control de permisos
- ✅ **Performante**: Optimizaciones de carga y sincronización eficiente
- ✅ **Accesible**: Interfaz intuitiva y accesible
- ✅ **Moderno**: Stack tecnológico actualizado

Para cualquier duda o mejora, referirse a esta documentación y al código fuente directamente.

---

**Última actualización**: Diciembre 2025  
**Mantenedor**: Equipo de Desarrollo Kinem Chile  
**Contacto**: [Correo/Slack del equipo]
