import { redirect } from "next/navigation";

// Redirect to mantenimientos page with cronograma tab
export default function CronogramaPage() {
  redirect("/mantenimientos");
}
