"use client"

import { useEffect } from "react"
import { initFirebase } from "@/lib/firebase"

export default function FirebaseInitializer() {
  useEffect(() => {
    // Inicializar Firebase
    const { app, auth, db } = initFirebase()
    if (app) {
      console.log("Firebase inicializado en el componente")
    }
  }, [])

  return null
}
