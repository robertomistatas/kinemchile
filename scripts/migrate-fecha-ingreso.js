// Script para migrar pacientes existentes y asegurar que tengan el campo fechaIngreso
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, updateDoc } = require("firebase/firestore");

// Configuración de Firebase (usar las mismas credenciales que la app)
const firebaseConfig = {
  // Aquí deberían ir las credenciales de Firebase
  // Por seguridad, no las incluyo directamente
};

async function migrateFechaIngreso() {
  try {
    console.log("Iniciando migración de fechaIngreso...");
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Obtener todos los pacientes
    const pacientesRef = collection(db, "pacientes");
    const snapshot = await getDocs(pacientesRef);
    
    console.log(`Encontrados ${snapshot.size} pacientes`);
    
    let actualizados = 0;
    let errores = 0;
    
    for (const pacienteDoc of snapshot.docs) {
      try {
        const data = pacienteDoc.data();
        
        // Solo actualizar si no tiene el campo fechaIngreso o es undefined
        if (!data.hasOwnProperty('fechaIngreso') || data.fechaIngreso === undefined || data.fechaIngreso === null) {
          const docRef = doc(db, "pacientes", pacienteDoc.id);
          await updateDoc(docRef, {
            fechaIngreso: ""
          });
          
          console.log(`Actualizado paciente ${pacienteDoc.id}: ${data.nombre} ${data.apellido}`);
          actualizados++;
        } else {
          console.log(`Paciente ${pacienteDoc.id} ya tiene fechaIngreso: "${data.fechaIngreso}"`);
        }
      } catch (error) {
        console.error(`Error al actualizar paciente ${pacienteDoc.id}:`, error);
        errores++;
      }
    }
    
    console.log(`\nMigración completada:`);
    console.log(`- Pacientes actualizados: ${actualizados}`);
    console.log(`- Errores: ${errores}`);
    
  } catch (error) {
    console.error("Error durante la migración:", error);
  }
}

// Ejecutar la migración
migrateFechaIngreso();
