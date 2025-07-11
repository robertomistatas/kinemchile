"use client"
import { useEffect, useState } from "react";
import { Usuario } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { getUsuarios, actualizarUsuario, eliminarUsuario } from "@/lib/firestore-service";

interface UsuariosTableProps {
  currentUser: Usuario;
}

export function UsuariosTable({ currentUser }: UsuariosTableProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsuarios().then((us) => {
      setUsuarios(us);
      setLoading(false);
    });
  }, []);

  const handleRolChange = async (id: string, nuevoRol: string) => {
    await actualizarUsuario(id, { rol: nuevoRol });
    setUsuarios((prev) => prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      await eliminarUsuario(id);
      setUsuarios((prev) => prev.filter(u => u.id !== id));
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <table className="w-full border mt-4">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id} className="border-t">
            <td>{u.nombre}</td>
            <td>{u.email}</td>
            <td>
              <select
                value={u.rol}
                onChange={e => u.id && handleRolChange(u.id, e.target.value)}
                disabled={u.email === currentUser.email}
                className="border rounded px-2 py-1"
              >
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="kinesiologa">Kinesióloga</option>
              </select>
            </td>
            <td>
              {u.email !== currentUser.email && (
                <Button variant="destructive" size="sm" onClick={() => u.id && handleEliminar(u.id)}>
                  Eliminar
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
