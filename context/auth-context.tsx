"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth"
import { initFirebase } from "@/lib/firebase"
import { getUsuarioByEmail } from "@/lib/firestore-service"
import type { Usuario } from "@/lib/data"
import { PERMISOS_POR_ROL } from "@/lib/data"

interface AuthContextType {
  user: User | null
  userInfo: Usuario | null
  userPermisos: string[]
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userInfo, setUserInfo] = useState<Usuario | null>(null)
  const [userPermisos, setUserPermisos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { auth } = initFirebase()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Obtener información del usuario desde Firestore
          const userDoc = await getUsuarioByEmail(user.email || "")
          setUserInfo(userDoc)

          // Establecer permisos
          if (userDoc?.permisos) {
            setUserPermisos(userDoc.permisos)
          } else if (userDoc?.rol) {
            // Si no hay permisos específicos, usar los predefinidos para el rol
            setUserPermisos(PERMISOS_POR_ROL[userDoc.rol] || [])
          } else {
            setUserPermisos([])
          }
        } catch (error) {
          console.error("Error al obtener información del usuario:", error)
          setUserInfo(null)
          setUserPermisos([])
        }
      } else {
        setUserInfo(null)
        setUserPermisos([])
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { auth } = initFirebase()
      await signInWithEmailAndPassword(auth, email, password)

      // Obtener información del usuario desde Firestore
      const userDoc = await getUsuarioByEmail(email)
      setUserInfo(userDoc)

      // Establecer permisos
      if (userDoc?.permisos) {
        setUserPermisos(userDoc.permisos)
      } else if (userDoc?.rol) {
        // Si no hay permisos específicos, usar los predefinidos para el rol
        setUserPermisos(PERMISOS_POR_ROL[userDoc.rol] || [])
      } else {
        setUserPermisos([])
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)

    try {
      const { auth } = initFirebase()
      await signOut(auth)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setError("Error al cerrar sesión. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userInfo, userPermisos, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
