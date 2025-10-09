import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Nota: usamos <select> nativo para mantener este componente como Server Component
import { DeleteButton } from "../delete-button";

type MovimientoItem = {
  id: number;
  elemento_id: number;
  cantidad: number;
  orden_numero: string;
  fecha_movimiento: Date;
  dependencia_entrega: string;
  funcionario_entrega: string;
  cargo_funcionario_entrega: string | null;
  dependencia_recibe: string;
  funcionario_recibe: string;
  cargo_funcionario_recibe: string | null;
  motivo: string;
  fecha_estimada_devolucion: Date;
  fecha_real_devolucion: Date | null;
  observaciones_entrega: string | null;
  observaciones_devolucion: string | null;
  tipo: "SALIDA" | "DEVOLUCION";
  numero_ticket: string;
};

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
};

type MovimientoRowProps = {
  movimiento: MovimientoItem;
  elementos: ElementoOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export function MovimientoRow({
  movimiento,
  elementos,
  onUpdate,
  onDelete,
}: MovimientoRowProps) {
  return (
    <div className="rounded border p-4 space-y-4">
      <form
        action={onUpdate}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input type="hidden" name="id" value={movimiento.id} />

        <select
          name="elemento_id"
          defaultValue={String(movimiento.elemento_id)}
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
        >
          {elementos.map((e) => (
            <option key={e.id} value={e.id}>
              {`${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim()}
            </option>
          ))}
        </select>

        <Input
          name="cantidad"
          type="number"
          defaultValue={String(movimiento.cantidad)}
        />
        <Input name="orden_numero" defaultValue={movimiento.orden_numero} />

        <Input
          name="fecha_movimiento"
          type="datetime-local"
          defaultValue={new Date(movimiento.fecha_movimiento)
            .toISOString()
            .slice(0, 16)}
        />

        <Input
          name="dependencia_entrega"
          defaultValue={movimiento.dependencia_entrega}
        />
        <Input
          name="funcionario_entrega"
          defaultValue={movimiento.funcionario_entrega}
        />
        <Input
          name="cargo_funcionario_entrega"
          defaultValue={movimiento.cargo_funcionario_entrega ?? ""}
        />

        <Input
          name="dependencia_recibe"
          defaultValue={movimiento.dependencia_recibe}
        />
        <Input
          name="funcionario_recibe"
          defaultValue={movimiento.funcionario_recibe}
        />
        <Input
          name="cargo_funcionario_recibe"
          defaultValue={movimiento.cargo_funcionario_recibe ?? ""}
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <textarea
            name="motivo"
            defaultValue={movimiento.motivo}
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
          />
        </div>

        <Input
          name="fecha_estimada_devolucion"
          type="date"
          defaultValue={new Date(movimiento.fecha_estimada_devolucion)
            .toISOString()
            .slice(0, 10)}
        />

        <Input name="numero_ticket" defaultValue={movimiento.numero_ticket} />

        <div className="sm:col-span-2 lg:col-span-3">
          <textarea
            name="observaciones_entrega"
            defaultValue={movimiento.observaciones_entrega ?? ""}
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
            placeholder="Observaciones de entrega"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
      <form action={onDelete} className="flex justify-end">
        <input type="hidden" name="id" value={movimiento.id} />
        <Button type="submit" variant="destructive">
          Eliminar
        </Button>
      </form>
    </div>
  );
}
