import { actionCreateReporte } from "@/modules/reportes_generados/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ReporteForm() {
  return (
    <form action={actionCreateReporte} className="grid gap-4 sm:grid-cols-2">
      <Input name="tipo_reporte" placeholder="Tipo de Reporte" required />
      <Input name="nombre_archivo" placeholder="Nombre del Archivo" required />
      <div className="sm:col-span-2">
        <textarea
          name="contenido_pdf"
          placeholder="Contenido del PDF (base64 o texto)"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={6}
          required
        />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit">Generar reporte</Button>
      </div>
    </form>
  );
}
