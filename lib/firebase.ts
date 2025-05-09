"\"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import {
  getFirestore,
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
  deleteField,
} from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDd2DbPqo7HsOvDsrTszgLCuU8zJUZdQ6Y",
  authDomain: "kinem-b904e.firebaseapp.com",
  projectId: "kinem-b904e",
  storageBucket: "kinem-b904e.firebasestorage.app",
  messagingSenderId: "30584936443",
  appId: "1:30584936443:web:db51131bbe7a97f5999d5e",
}

// Variables para almacenar las instancias
let firebaseApp
let firebaseAuth
let firestore

// Función para inicializar Firebase
export function initFirebase() {
  // Solo inicializar en el cliente
  if (typeof window === "undefined") {
    console.log("No se puede inicializar Firebase en el servidor")
    return { app: null, auth: null, db: null }
  }

  try {
    // Si ya está inicializado, devolver las instancias existentes
    if (firebaseApp && firebaseAuth && firestore) {
      return { app: firebaseApp, auth: firebaseAuth, db: firestore }
    }

    console.log("Inicializando Firebase...")

    // Verificar si ya hay una app inicializada
    if (getApps().length > 0) {
      firebaseApp = getApp()
      console.log("Usando app de Firebase existente")
    } else {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Nueva app de Firebase inicializada")
    }

    firebaseAuth = getAuth(firebaseApp)
    firestore = getFirestore(firebaseApp)

    console.log("Firebase inicializado correctamente")
    console.log("Auth inicializado:", !!firebaseAuth)
    console.log("Firestore inicializado:", !!firestore)

    return { app: firebaseApp, auth: firebaseAuth, db: firestore }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
    return { app: null, auth: null, db: null }
  }
}

// Inicializar Firebase al cargar el módulo en el cliente
if (typeof window !== "undefined") {
  console.log("Inicializando Firebase al cargar el módulo")
  initFirebase()
}

// Exportar funciones de Firebase
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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
  deleteField,
}

// Funciones para obtener instancias de Firebase
export const getFirebaseApp = () => firebaseApp
export const getFirebaseAuth = () => firebaseAuth
export const getFirestoreDB = () => firestore

// Funcion para obtener la instancia de Firestore
export function getDb() {
  const { db: firestore } = initFirebase()
  if (!firestore) {
    console.error("Firestore no está inicializado")
  }
  return firestore
}
