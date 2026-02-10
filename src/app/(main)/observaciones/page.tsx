import { redirect } from "next/navigation";

/**
 * Las observaciones se gestionan dentro del módulo Hojas de Vida (por elemento).
 * Al abrir la hoja de vida de un elemento, en la pestaña "Observaciones" se pueden
 * crear, editar y eliminar observaciones.
 */
export default function ObservacionesPage() {
  redirect("/hojas-vida");
}
