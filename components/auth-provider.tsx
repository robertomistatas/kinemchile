"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "@/lib/firebase"

// Tipos para Firebase Auth
interface User {
  uid: string
  email: string | null
}

// Contexto de autenticación
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return

    const setupAuth = async () => {
      try {
        console.log("Configurando listener de autenticación")

        // Verificar que auth existe
        if (!auth) {
          console.error("Auth no está inicializado")
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("Estado de autenticación cambiado:", firebaseUser ? "Usuario autenticado" : "No hay usuario")

          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            })
          } else {
            setUser(null)
          }

          setLoading(false)
        })

        return () => {
          console.log("Limpiando listener de autenticación")
          unsubscribe()
        }
      } catch (error) {
        console.error("Error en setupAuth:", error)
        setLoading(false)
      }
    }

    setupAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      if (!auth) throw new Error("Auth no está inicializado")

      console.log("Intentando iniciar sesión con:", email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log("Inicio de sesión exitoso")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (!auth) throw new Error("Auth no está inicializado")

      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // No renderizar nada hasta que el componente esté montado
  if (!mounted) return null

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

// Exportación por defecto para dynamic import
export default AuthProvider
