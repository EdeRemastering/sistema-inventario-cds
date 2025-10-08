import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
};

type ObservacionFormProps = {
  action: (formData: FormData) => Promise<void>;
  elementos: ElementoOption[];
  submitText?: string;
};

export function ObservacionForm({
  action,
  elementos,
  submitText = "Crear Observación",
}: ObservacionFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="elemento_id"
        required
        placeholder="Elemento"
        options={elementos.map((e) => ({
          value: String(e.id),
          label: `${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim(),
        }))}
      />
      <Input
        name="fecha_observacion"
        type="date"
        placeholder="Fecha de Observación"
        required
      />
      <div className="sm:col-span-2">
        <textarea
          name="descripcion"
          placeholder="Descripción de la observación"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={4}
          required
        />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
