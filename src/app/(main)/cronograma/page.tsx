import { redirect } from "next/navigation";

// Redirige a la página de mantenimientos con la pestaña de cronograma seleccionada
export default function CronogramaPage() {
  redirect("/mantenimientos?tab=cronograma");
}
