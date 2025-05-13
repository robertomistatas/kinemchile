"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getUsuarios } from "@/lib/firestore-service"
import { PERMISOS_POR_ROL } from "@/lib/data"
import type { Usuario } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Users, Shield, AlertCircle } from "lucide-react"

export default function ConfiguracionPage() {
  const { user, userPermisos, loading } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)

  useEffect(() => {
    // Redirigir si no es roberto@mistatas.com
    if (!loading && user?.email !== "roberto@mistatas.com") {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const data = await getUsuarios()
        setUsuarios(data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
      } finally {
        setLoadingUsuarios(false)
      }
    }

    if (user?.email === "roberto@mistatas.com") {
      cargarUsuarios()
    }
  }, [user])

  if (loading || user?.email !== "roberto@mistatas.com") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Cargando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, roles y permisos del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Roles y Permisos</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>Gestiona los usuarios que tienen acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsuarios ? (
                <div className="py-6 text-center text-muted-foreground">Cargando usuarios...</div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button>Nuevo Usuario</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay usuarios registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        usuarios.map((usuario) => (
                          <TableRow key={usuario.id}>
                            <TableCell>{usuario.nombre}</TableCell>
                            <TableCell>{usuario.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  usuario.rol === "admin"
                                    ? "destructive"
                                    : usuario.rol === "kinesiologo"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {usuario.rol}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
              <CardDescription>Visualiza los roles predefinidos y sus permisos asociados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(PERMISOS_POR_ROL).map(([rol, permisos]) => (
                  <div key={rol} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize">{rol}</h3>
                    <div className="flex flex-wrap gap-2">
                      {permisos.map((permiso) => (
                        <Badge key={permiso} variant="outline">
                          {permiso}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Ajustes generales del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta sección está en desarrollo. Próximamente podrás configurar aspectos generales del sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
