"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth"
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

// Valor por defecto para el contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  userInfo: null,
  userPermisos: [],
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
  user: User | null
  loading: boolean
  error: string | null
}

export function AuthProvider({ children, user, loading: initialLoading, error: initialError }: AuthProviderProps) {
  const [userInfo, setUserInfo] = useState<Usuario | null>(null)
  const [userPermisos, setUserPermisos] = useState<string[]>([])
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(initialError)
  const router = useRouter()

  useEffect(() => {
    async function loadUserInfo() {
      if (!user) {
        setUserInfo(null)
        setUserPermisos([])
        setLoading(false)
        return
      }

      try {
        // Cargar información del usuario desde Firestore
        const userInfoFromDb = await getUsuarioByEmail(user.email || "")
        setUserInfo(userInfoFromDb)

        // Establecer permisos
        if (userInfoFromDb?.permisos) {
          setUserPermisos(userInfoFromDb.permisos)
        } else if (userInfoFromDb?.rol) {
          // Si no hay permisos específicos, usar los predefinidos para el rol
          setUserPermisos(PERMISOS_POR_ROL[userInfoFromDb.rol] || [])
        } else {
          setUserPermisos([])
        }
      } catch (err) {
        console.error("Error al cargar información del usuario:", err)
        setError("Error al cargar información del usuario")
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    loadUserInfo()
  }, [user])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { auth } = initFirebase()
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.")
      throw error
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
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setError("Error al cerrar sesión. Por favor, intenta de nuevo.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    userInfo,
    userPermisos,
    loading: initialLoading || loading,
    error: initialError || error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
