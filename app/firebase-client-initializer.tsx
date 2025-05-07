"use client"

import dynamic from "next/dynamic"

// Importar Firebase de manera dinámica solo en el cliente
const FirebaseInitializer = dynamic(() => import("@/components/firebase-initializer"), {
  ssr: false,
})

export default function FirebaseClientInitializer() {
  return <FirebaseInitializer />
}
