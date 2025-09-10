"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Home, Users, Calendar, LogOut, Heart, LayoutDashboard, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { RealTimeClock } from "@/components/real-time-clock"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const navigation = [
    { name: "Inicio", href: "/dashboard", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Pacientes de Alta", href: "/pacientes-alta", icon: Heart },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    // Mostrar "Configuración" solo para admin o superadmin
    ...(user && (user.rol === "admin" || user.rol === "superadmin")
      ? [
          { name: "Configuración", href: "/configuracion", icon: Settings },
          // Si quieres mantener el acceso a /admin, descomenta la siguiente línea:
          // { name: "Administración", href: "/admin", icon: Settings },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print w-full">
        <div className="container max-w-full px-2 sm:px-4 flex h-16 items-center justify-between py-2 gap-2 md:gap-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 max-w-[90vw] overflow-y-auto">
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://static.wixstatic.com/media/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png/v1/crop/x_0,y_0,w_920,h_343/fill/w_171,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png"
                      alt="Kinem Chile Logo"
                      className="h-8 max-w-full object-contain"
                    />
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                    <ThemeToggle />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
              <img
                src="https://static.wixstatic.com/media/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png/v1/crop/x_0,y_0,w_920,h_343/fill/w_171,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1831cb_311ba82ac7844cd5ba994725d9a25a1e~mv2.png"
                alt="Kinem Chile Logo"
                className="h-8 max-w-[120px] object-contain"
              />
            </Link>
          </div>
          
          {/* Navegación centrada con estilo de tabs */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-4">
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap ${
                    pathname === item.href
                      ? "text-primary-foreground bg-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <div className="absolute inset-0 bg-primary rounded-lg shadow-sm -z-10 animate-in fade-in-0 zoom-in-95 duration-200" />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Reloj y controles del usuario */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <RealTimeClock />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/avatar.png" alt={user?.email || "Usuario"} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[150px]">{user?.email || "Usuario"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">{user?.email || "usuario@ejemplo.com"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40 w-full">
        <div className="container max-w-full px-2 sm:px-4 py-4 md:py-6">{children}</div>
      </main>
      <footer className="border-t bg-background no-print w-full">
        <div className="container max-w-full flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between px-2 sm:px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Kinem Chile. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-1 text-sm md:justify-end">
            Hecho con{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> por Rrojas
          </div>
        </div>
      </footer>
    </div>
  )
}

// Exportar como default para compatibilidad
export default Layout
