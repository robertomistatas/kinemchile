"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Edit, Trash2, Users, Shield } from "lucide-react"
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from "@/lib/firestore-service"
import { PERMISOS_POR_ROL, type Usuario } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ConfiguracionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("usuarios")
  const [showNuevoUsuario, setShowNuevoUsuario] = useState(false)
  const [showEditarUsuario, setShowEditarUsuario] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    funcion: "kinesiologa", // kinesiologa, medico, administrativo
    rol: "kinesiologo", // admin, kinesiologo, recepcionista
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Solo permitir acceso a roberto@mistatas.com inicialmente
  const isAuthorized = user?.email === "roberto@mistatas.com"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (!loading && !isAuthorized) {
      router.push("/dashboard")
    }
  }, [user, loading, router, isAuthorized])

  useEffect(() => {
    async function fetchUsuarios() {
      if (!isAuthorized) return

      try {
        setDataLoading(true)
        const data = await getUsuarios()
        setUsuarios(data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        setError("Error al cargar la lista de usuarios")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && isAuthorized) {
      fetchUsuarios()
    }
  }, [user, isAuthorized])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleNuevoUsuario = () => {
    setFormData({
      nombre: "",
      rut: "",
      email: "",
      telefono: "",
      funcion: "kinesiologa",
      rol: "kinesiologo",
    })
    setShowNuevoUsuario(true)
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario)
    setFormData({
      nombre: usuario.nombre || "",
      rut: usuario.rut || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      funcion: usuario.funcion || "kinesiologa",
      rol: usuario.rol || "kinesiologo",
    })
    setShowEditarUsuario(true)
  }

  const handleConfirmDelete = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario)
    setShowConfirmDelete(true)
  }

  const handleSubmitNuevoUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      await crearUsuario({
        nombre: formData.nombre,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        funcion: formData.funcion,
        rol: formData.rol,
        permisos: PERMISOS_POR_ROL[formData.rol] || [],
        activo: true,
      })

      // Recargar la lista de usuarios
      const data = await getUsuarios()
      setUsuarios(data)
      setShowNuevoUsuario(false)
      setSuccessMessage("Usuario creado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error al crear usuario:", error)
      setError(`Error al crear usuario: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEditarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioSeleccionado) return

    setSubmitting(true)
    setError("")

    try {
      await actualizarUsuario(usuarioSeleccionado.id, {
        nombre: formData.nombre,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        funcion: formData.funcion,
        rol: formData.rol,
        permisos: PERMISOS_POR_ROL[formData.rol] || [],
      })

      // Recargar la lista de usuarios
      const data = await getUsuarios()
      setUsuarios(data)
      setShowEditarUsuario(false)
      setSuccessMessage("Usuario actualizado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      setError(`Error al actualizar usuario: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminarUsuario = async () => {
    if (!usuarioSeleccionado) return

    setSubmitting(true)
    setError("")

    try {
      await eliminarUsuario(usuarioSeleccionado.id)

      // Actualizar la lista local
      setUsuarios(usuarios.filter((u) => u.id !== usuarioSeleccionado.id))
      setShowConfirmDelete(false)
      setSuccessMessage("Usuario eliminado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      setError(`Error al eliminar usuario: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!isAuthorized) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Configuración</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          <p>Esta sección está reservada para el administrador principal.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">Administración de usuarios y permisos</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="bg-green-50 text-green-800 border border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles y Permisos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleNuevoUsuario}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>Gestiona los usuarios y sus roles</CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay usuarios registrados en el sistema.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Función</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>{usuario.nombre}</TableCell>
                          <TableCell>{usuario.rut || "N/A"}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>{usuario.telefono || "N/A"}</TableCell>
                          <TableCell>
                            <span className="capitalize">{usuario.funcion || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{usuario.rol}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditarUsuario(usuario)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleConfirmDelete(usuario)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles y Permisos</CardTitle>
                <CardDescription>Configuración de permisos por rol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Administrador</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Los administradores tienen acceso completo a todas las funcionalidades del sistema.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Kinesiólogo</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Los kinesiólogos pueden ver y gestionar sus pacientes asignados.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Médico</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Los médicos pueden ver y gestionar sus pacientes asignados.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Administrativo</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      El personal administrativo puede gestionar citas y ver información básica de pacientes.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Nota: Todos los usuarios pueden modificar datos de pacientes, crear observaciones y evaluaciones. Solo
                  el administrador puede crear nuevos usuarios.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo para nuevo usuario */}
        <Dialog open={showNuevoUsuario} onOpenChange={setShowNuevoUsuario}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa el formulario para crear un nuevo usuario en el sistema.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitNuevoUsuario}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="12.345.678-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcion">Función</Label>
                    <Select value={formData.funcion} onValueChange={(value) => handleSelectChange("funcion", value)}>
                      <SelectTrigger id="funcion">
                        <SelectValue placeholder="Selecciona una función" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinesiologa">Kinesióloga</SelectItem>
                        <SelectItem value="medico">Médico</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol en el sistema</Label>
                    <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                      <SelectTrigger id="rol">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="kinesiologo">Kinesiólogo</SelectItem>
                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNuevoUsuario(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Usuario"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar usuario */}
        <Dialog open={showEditarUsuario} onOpenChange={setShowEditarUsuario}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Modifica la información del usuario.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitEditarUsuario}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre-edit">Nombre</Label>
                    <Input
                      id="nombre-edit"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut-edit">RUT</Label>
                    <Input
                      id="rut-edit"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="12.345.678-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-edit">Email</Label>
                    <Input
                      id="email-edit"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono-edit">Teléfono</Label>
                    <Input
                      id="telefono-edit"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcion-edit">Función</Label>
                    <Select value={formData.funcion} onValueChange={(value) => handleSelectChange("funcion", value)}>
                      <SelectTrigger id="funcion-edit">
                        <SelectValue placeholder="Selecciona una función" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinesiologa">Kinesióloga</SelectItem>
                        <SelectItem value="medico">Médico</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol-edit">Rol en el sistema</Label>
                    <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                      <SelectTrigger id="rol-edit">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="kinesiologo">Kinesiólogo</SelectItem>
                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditarUsuario(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para eliminar usuario */}
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar al usuario <strong>{usuarioSeleccionado?.nombre}</strong>? Esta
                acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleEliminarUsuario} disabled={submitting}>
                {submitting ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
