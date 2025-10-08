import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
};

type MovimientoFormProps = {
  action: (formData: FormData) => Promise<void>;
  elementos: ElementoOption[];
  submitText?: string;
};

export function MovimientoForm({
  action,
  elementos,
  submitText = "Crear Movimiento",
}: MovimientoFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SelectField
        name="elemento_id"
        required
        placeholder="Elemento"
        options={elementos.map((e) => ({
          value: String(e.id),
          label: `${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim(),
        }))}
      />
      <Input name="cantidad" type="number" placeholder="Cantidad" required />
      <Input name="orden_numero" placeholder="Número de Orden" required />
      <Input
        name="fecha_movimiento"
        type="datetime-local"
        placeholder="Fecha de Movimiento"
        required
      />
      <Input
        name="dependencia_entrega"
        placeholder="Dependencia Entrega"
        required
      />
      <Input
        name="funcionario_entrega"
        placeholder="Funcionario Entrega"
        required
      />
      <Input
        name="cargo_funcionario_entrega"
        placeholder="Cargo Funcionario Entrega"
      />
      <Input
        name="dependencia_recibe"
        placeholder="Dependencia Recibe"
        required
      />
      <Input
        name="funcionario_recibe"
        placeholder="Funcionario Recibe"
        required
      />
      <Input
        name="cargo_funcionario_recibe"
        placeholder="Cargo Funcionario Recibe"
      />
      <div className="sm:col-span-2 lg:col-span-3">
        <textarea
          name="motivo"
          placeholder="Motivo del movimiento"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={3}
          required
        />
      </div>
      <Input
        name="fecha_estimada_devolucion"
        type="date"
        placeholder="Fecha Estimada Devolución"
        required
      />
      <Input name="numero_ticket" placeholder="Número de Ticket" required />
      <div className="sm:col-span-2 lg:col-span-3">
        <textarea
          name="observaciones_entrega"
          placeholder="Observaciones de entrega"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={2}
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <Button type="submit">{submitText}</Button>
      </div>
      <input type="hidden" name="tipo" value="SALIDA" />
    </form>
  );
}
