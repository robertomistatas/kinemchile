# 📋 Cola de Espera Médica - Guía de Uso

## 🎯 **Descripción General**

El nuevo módulo de **Agenda** ha sido completamente rediseñado como una **Cola de Espera Simple** para médicos. Esta herramienta permite gestionar el orden de atención de pacientes de manera visual e intuitiva.

## ✨ **Características Principales**

### 🔄 **Drag & Drop**
- **Arrastra pacientes** para reordenar la cola
- **Cambio visual** durante el arrastre
- **Orden flexible** según necesidades médicas

### 🎨 **Colores Distintivos**
- **Color único** para cada paciente al agregarlo
- **10 colores predefinidos** para fácil identificación
- **Barra lateral colorida** en cada tarjeta

### 📊 **Estados de Paciente**
1. **🟡 Esperando** - Paciente en cola
2. **🔵 En Consulta** - Paciente siendo atendido
3. **🟢 Atendido** - Consulta finalizada

### 📈 **Panel de Estadísticas**
- **Total de pacientes** en cola
- **Cantidad esperando** (color amarillo)
- **En consulta actual** (color azul)
- **Ya atendidos** (color verde)

## 🚀 **Cómo Usar**

### ➕ **Agregar Paciente**
1. Clic en **"Agregar Paciente"**
2. Ingresar **nombre del paciente**
3. Ingresar **turno/hora** (ej: "09:30", "Turno 1", "Urgente")
4. Clic en **"Agregar"**

### 🔄 **Cambiar Orden**
- **Arrastra** la tarjeta del paciente
- **Suelta** en la nueva posición
- El orden se actualiza automáticamente

### 🏥 **Atender Pacientes**
1. **"Atender"** - Cambia de "Esperando" a "En Consulta"
2. **"Finalizar"** - Cambia de "En Consulta" a "Atendido"
3. **"Volver a cola"** - Regresa "Atendido" a "Esperando"

### 🧹 **Gestión de Cola**
- **"Limpiar Atendidos"** - Elimina pacientes atendidos
- **"Resetear Cola"** - Elimina todos los pacientes
- **"Configuración"** - Ajustes personalizados

## ⚙️ **Configuración Avanzada**

### 🔊 **Audio**
- **Habilitar/deshabilitar** sonidos de notificación
- **Ajustar volumen** (0-100%)

### 📱 **Visualización**
- **Mostrar tiempos de espera** - Tiempo transcurrido desde ingreso
- **Auto-avanzar estados** - Cambio automático de estados

### 💾 **Persistencia**
- **Guardado automático** en navegador
- **Exportar cola** a archivo JSON
- **Importar cola** desde archivo JSON

## 🕐 **Información Temporal**

Cada paciente muestra:
- **Hora de ingreso** - Cuándo se agregó a la cola
- **Tiempo de espera** - Minutos transcurridos desde ingreso
- **Turno asignado** - Identificador personalizable

## 💡 **Casos de Uso Típicos**

### 🌅 **Inicio del Día**
1. Importar cola del día anterior (si aplica)
2. Agregar pacientes conforme llegan
3. Ordenar por prioridad médica

### 🏥 **Durante Consultas**
1. Arrastrar siguiente paciente al inicio
2. Marcar como "En Consulta"
3. Finalizar cuando termine

### 🌙 **Fin del Día**
1. Exportar cola para respaldo
2. Limpiar atendidos
3. Resetear para nuevo día

## 🔧 **Características Técnicas**

- **✅ Sin conexión a base de datos** - Funciona independiente
- **✅ Guardado local** - Persiste entre sesiones
- **✅ Responsive** - Funciona en tablets y móviles
- **✅ Accesibilidad** - Teclado y lectores de pantalla
- **✅ Exportación** - Respaldos en JSON

## 🎨 **Colores Disponibles**

Los pacientes se asignan automáticamente con uno de estos colores:
- 🔵 Azul
- 🔴 Rojo  
- 🟢 Verde
- 🟡 Amarillo
- 🟣 Púrpura
- 🌸 Rosa
- 🔷 Teal
- 🟠 Naranja
- 🟦 Índigo
- 🟢 Lima

---

## 📞 **Soporte**

Para problemas técnicos o sugerencias, contacta al equipo de desarrollo.

**Versión:** 1.0.0  
**Última actualización:** Septiembre 2025
