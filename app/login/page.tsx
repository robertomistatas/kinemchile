"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { ContactForm } from "@/components/contact-form"
import { useAuth } from "@/components/auth-provider"
import { initFirebase } from "@/lib/firebase"

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  // Inicializar Firebase al cargar la página
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const { app, auth, db } = initFirebase()
        if (app && auth) {
          console.log("Firebase inicializado correctamente en la página de login")
        } else {
          console.error("Firebase no se inicializó correctamente en la página de login")
        }
      } catch (error) {
        console.error("Error al inicializar Firebase:", error)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Verificar que Firebase Auth esté inicializado
      const { auth } = initFirebase()
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      await login(email, password)
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)

      // Mostrar un mensaje de error más específico
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-email":
            setError("El correo electrónico no es válido.")
            break
          case "auth/user-disabled":
            setError("Esta cuenta de usuario ha sido deshabilitada.")
            break
          case "auth/user-not-found":
            setError("No existe un usuario con este correo electrónico.")
            break
          case "auth/wrong-password":
            setError("La contraseña es incorrecta.")
            break
          case "auth/too-many-requests":
            setError("Demasiados intentos fallidos. Intenta más tarde.")
            break
          default:
            setError(`Error al iniciar sesión: ${error.message || "Verifica tus credenciales."}`)
        }
      } else {
        setError(`Error al iniciar sesión: ${error.message || "Verifica tus credenciales."}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src="https://static.wixstatic.com/media/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png/v1/crop/x_0,y_0,w_920,h_343/fill/w_171,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png"
            alt="Kinem Chile Logo"
            className="h-16"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {showContactForm ? "Solicitar acceso" : "Iniciar sesión"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showContactForm
              ? "Completa el formulario para solicitar una cuenta"
              : "Accede a tu cuenta para gestionar pacientes"}
          </p>
        </div>

        {showContactForm ? (
          <>
            <ContactForm />
            <div className="text-center">
              <Button variant="link" onClick={() => setShowContactForm(false)}>
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Button variant="link" className="p-0" onClick={() => setShowContactForm(true)}>
                    Contacta al administrador
                  </Button>
                </p>
              </CardFooter>
            </Card>
            <div className="text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Volver al inicio
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
