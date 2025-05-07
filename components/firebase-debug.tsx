"use client"

import { useEffect, useState } from "react"
import { initFirebase } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function FirebaseDebug() {
  const [status, setStatus] = useState<{
    initialized: boolean
    appInitialized: boolean
    authInitialized: boolean
    dbInitialized: boolean
    error: string | null
  }>({
    initialized: false,
    appInitialized: false,
    authInitialized: false,
    dbInitialized: false,
    error: null,
  })

  useEffect(() => {
    checkFirebaseStatus()
  }, [])

  const checkFirebaseStatus = () => {
    try {
      const { app, auth, db } = initFirebase()

      setStatus({
        initialized: true,
        appInitialized: !!app,
        authInitialized: !!auth,
        dbInitialized: !!db,
        error: null,
      })
    } catch (error: any) {
      setStatus({
        initialized: false,
        appInitialized: false,
        authInitialized: false,
        dbInitialized: false,
        error: error.message || "Error desconocido",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Estado de Firebase</CardTitle>
        <CardDescription>Información de depuración de Firebase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Firebase inicializado:</span>
            <span className={status.initialized ? "text-green-500" : "text-red-500"}>
              {status.initialized ? "Sí" : "No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>App inicializada:</span>
            <span className={status.appInitialized ? "text-green-500" : "text-red-500"}>
              {status.appInitialized ? "Sí" : "No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Auth inicializada:</span>
            <span className={status.authInitialized ? "text-green-500" : "text-red-500"}>
              {status.authInitialized ? "Sí" : "No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Firestore inicializada:</span>
            <span className={status.dbInitialized ? "text-green-500" : "text-red-500"}>
              {status.dbInitialized ? "Sí" : "No"}
            </span>
          </div>
          {status.error && (
            <div className="text-red-500 mt-4">
              <p className="font-semibold">Error:</p>
              <p>{status.error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkFirebaseStatus} className="w-full">
          Verificar estado
        </Button>
      </CardFooter>
    </Card>
  )
}
