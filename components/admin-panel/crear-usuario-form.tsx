"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { crearUsuario } from "@/lib/firestore-service"
import { ROLES } from "@/lib/data"

export function CrearUsuarioForm({ onUsuarioCreado }: { onUsuarioCreado: () => void }) {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [rol, setRol] = useState("kinesiologa")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await crearUsuario({ nombre, email, rol })
      setNombre("")
      setEmail("")
      setRol("kinesiologa")
      onUsuarioCreado()
    } catch (err: any) {
      setError(err.message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border p-4 rounded mb-4 bg-muted/30">
      <h2 className="font-semibold">Agregar nuevo usuario</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <select
        value={rol}
        onChange={e => setRol(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="superadmin">Super Admin</option>
        <option value="admin">Admin</option>
        <option value="kinesiologa">Kinesióloga</option>
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  )
}
