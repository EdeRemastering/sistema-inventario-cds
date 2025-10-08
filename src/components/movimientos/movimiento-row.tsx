import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";
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
  onDelete: () => Promise<void>;
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

        <SelectField
          name="elemento_id"
          defaultValue={String(movimiento.elemento_id)}
          options={elementos.map((e) => ({
            value: String(e.id),
            label: `${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim(),
          }))}
        />

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
          <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
        </div>
      </form>
    </div>
  );
}
