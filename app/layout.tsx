import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import dynamic from "next/dynamic"

// Importar el AuthProvider de forma dinámica para que solo se cargue en el cliente
const ClientAuthProvider = dynamic(() => import("@/components/auth-provider"), {
  ssr: false,
})

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Kinem Chile",
  description: "Sistema de gestión para Kinem Chile",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ClientAuthProvider>{children}</ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
