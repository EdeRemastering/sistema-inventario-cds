import { redirect } from "next/navigation";

export default function MovimientosPage() {
  // Movimientos quedó deprecado: el préstamo vive en Tickets.
  // Mantenemos la ruta para compatibilidad / bookmarks antiguos.
  redirect("/prestamos");
}
