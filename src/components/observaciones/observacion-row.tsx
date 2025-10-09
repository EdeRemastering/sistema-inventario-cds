import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Nota: usamos <select> nativo para mantener este componente como Server Component
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
  onDelete: (formData: FormData) => Promise<void>;
};

export function ObservacionRow({
  observacion,
  elementos,
  onUpdate,
  onDelete,
}: ObservacionRowProps) {
  return (
    <div className="rounded border p-4 space-y-4">
      <form action={onUpdate} className="flex items-start gap-3">
        <input type="hidden" name="id" value={observacion.id} />

        <select
          name="elemento_id"
          defaultValue={String(observacion.elemento_id)}
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
        >
          {elementos.map((e) => (
            <option key={e.id} value={e.id}>
              {`${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim()}
            </option>
          ))}
        </select>

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
        </div>
      </form>
      <form action={onDelete} className="flex justify-end">
        <input type="hidden" name="id" value={observacion.id} />
        <Button type="submit" variant="destructive">
          Eliminar
        </Button>
      </form>
    </div>
  );
}
