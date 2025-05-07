"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, initFirebase } from "@/lib/firebase"

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

    // Asegurarse de que Firebase esté inicializado
    const { auth: firebaseAuth } = initFirebase()

    if (!firebaseAuth) {
      console.error("No se pudo inicializar Firebase Auth")
      setLoading(false)
      return
    }

    console.log("Configurando listener de autenticación")
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
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
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Asegurarse de que Firebase esté inicializado
      const { auth: firebaseAuth } = initFirebase()
      if (!firebaseAuth) {
        throw new Error("Auth no está inicializado")
      }

      console.log("Intentando iniciar sesión con:", email)
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      console.log("Inicio de sesión exitoso:", userCredential.user.uid)
      router.push("/dashboard")
      return userCredential
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
      // Asegurarse de que Firebase esté inicializado
      const { auth: firebaseAuth } = initFirebase()
      if (!firebaseAuth) {
        throw new Error("Auth no está inicializado")
      }

      await signOut(firebaseAuth)
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
