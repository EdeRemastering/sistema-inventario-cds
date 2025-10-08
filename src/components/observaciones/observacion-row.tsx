import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";
import { DeleteButton } from "../delete-button";

type ObservacionItem = {
  id: number;
  elemento_id: number;
  fecha_observacion: Date;
  descripcion: string;
};

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
};

type ObservacionRowProps = {
  observacion: ObservacionItem;
  elementos: ElementoOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ObservacionRow({
  observacion,
  elementos,
  onUpdate,
  onDelete,
}: ObservacionRowProps) {
  return (
    <form
      action={onUpdate}
      className="flex items-start gap-3 rounded border p-4"
    >
      <input type="hidden" name="id" value={observacion.id} />

      <SelectField
        name="elemento_id"
        defaultValue={String(observacion.elemento_id)}
        options={elementos.map((e) => ({
          value: String(e.id),
          label: `${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim(),
        }))}
      />

      <Input
        name="fecha_observacion"
        type="date"
        defaultValue={new Date(observacion.fecha_observacion)
          .toISOString()
          .slice(0, 10)}
      />

      <div className="flex-1">
        <textarea
          name="descripcion"
          defaultValue={observacion.descripcion}
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Guardar</Button>
        <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
      </div>
    </form>
  );
}
