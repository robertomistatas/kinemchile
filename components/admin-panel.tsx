import * as React from "react";
import { Usuario } from "@/lib/data";
import { UsuariosTable } from "./admin-panel/usuarios-table";
import { CrearUsuarioForm } from "./admin-panel/crear-usuario-form";

interface AdminPanelProps {
  usuario: Usuario;
}

export function AdminPanel({ usuario }: AdminPanelProps) {
  const [reload, setReload] = React.useState(0);
  return (
    <section className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>
      <CrearUsuarioForm onUsuarioCreado={() => setReload(r => r + 1)} />
      <UsuariosTable key={reload} currentUser={usuario} />
    </section>
  );
}
