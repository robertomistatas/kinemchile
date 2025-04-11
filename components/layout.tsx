"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Users, Calendar, Home, LogOut } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "./auth-provider"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "./protected-route"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useMobile()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menú</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="flex flex-col gap-4 py-4">
                      <div className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="Kinem Chile Logo" className="h-10" />
                      </div>
                      <nav className="flex flex-col gap-2">
                        <Link href="/" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                          <Home className="h-5 w-5" />
                          Inicio
                        </Link>
                        <Link
                          href="/pacientes"
                          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
                        >
                          <Users className="h-5 w-5" />
                          Pacientes
                        </Link>
                        <Link href="/agenda" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                          <Calendar className="h-5 w-5" />
                          Agenda
                        </Link>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <img src="/images/logo.png" alt="Kinem Chile Logo" className="h-8" />
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="font-medium">
                Inicio
              </Link>
              <Link href="/pacientes" className="font-medium">
                Pacientes
              </Link>
              <Link href="/agenda" className="font-medium">
                Agenda
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <span className="hidden md:inline text-sm">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Cerrar sesión</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 py-6">
          <div className="container">{children}</div>
        </main>
        <footer className="border-t bg-background">
          <div className="container py-4 text-center text-sm text-gray-500">
            © 2024 Kinem Chile. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
