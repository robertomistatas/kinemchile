"use client"

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDd2DbPqo7HsOvDsrTszgLCuU8zJUZdQ6Y",
  authDomain: "kinem-b904e.firebaseapp.com",
  projectId: "kinem-b904e",
  storageBucket: "kinem-b904e.firebasestorage.app",
  messagingSenderId: "30584936443",
  appId: "1:30584936443:web:db51131bbe7a97f5999d5e",
}

// Inicializar Firebase
let firebaseApp
let firebaseAuth
let firebaseDb

// Función para inicializar Firebase de manera segura
function initializeFirebase() {
  if (typeof window === "undefined") {
    return { app: null, auth: null, db: null }
  }

  if (!firebaseApp) {
    console.log("Inicializando Firebase...")
    try {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Firebase inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar Firebase:", error)
      return { app: null, auth: null, db: null }
    }
  }

  if (!firebaseAuth) {
    try {
      console.log("Inicializando Auth...")
      firebaseAuth = getAuth(firebaseApp)
      console.log("Auth inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar Auth:", error)
    }
  }

  if (!firebaseDb) {
    try {
      console.log("Inicializando Firestore...")
      firebaseDb = getFirestore(firebaseApp)
      console.log("Firestore inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar Firestore:", error)
    }
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb }
}

// Exportar la función de inicialización
export const { app, auth, db } = initializeFirebase()

// Exportar funciones de autenticación directamente
export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"

// Exportar funciones de Firestore directamente
export {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
