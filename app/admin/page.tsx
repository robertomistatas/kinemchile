import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { getUsuarioByEmail } from "@/lib/firestore-service";

export default async function AdminPage() {
  // Proteger la ruta: solo admins y super admin
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");
  const usuario = await getUsuarioByEmail(session.user.email);
  if (!usuario || (usuario.rol !== "admin" && usuario.rol !== "superadmin")) {
    redirect("/");
  }
  return <AdminPanel usuario={usuario} />;
}
