import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DeleteButton } from "../delete-button";

type TicketItem = {
  id: number;
  numero_ticket: string;
  fecha_salida: Date;
  fecha_estimada_devolucion: Date | null;
  elemento: string | null;
  serie: string | null;
  marca_modelo: string | null;
  cantidad: number;
  dependencia_entrega: string | null;
  funcionario_entrega: string | null;
  dependencia_recibe: string | null;
  funcionario_recibe: string | null;
  motivo: string | null;
  orden_numero: string | null;
};

type TicketRowProps = {
  ticket: TicketItem;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export function TicketRow({ ticket, onUpdate, onDelete }: TicketRowProps) {
  return (
    <div className="grid gap-3 rounded border p-4">
      <form
        action={onUpdate}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input type="hidden" name="id" value={ticket.id} />

        <Input name="numero_ticket" defaultValue={ticket.numero_ticket} />
        <Input
          name="fecha_salida"
          type="datetime-local"
          defaultValue={new Date(ticket.fecha_salida)
            .toISOString()
            .slice(0, 16)}
        />
        <Input
          name="fecha_estimada_devolucion"
          type="datetime-local"
          defaultValue={
            ticket.fecha_estimada_devolucion
              ? new Date(ticket.fecha_estimada_devolucion)
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
        />

        <Input name="elemento" defaultValue={ticket.elemento ?? ""} />
        <Input name="serie" defaultValue={ticket.serie ?? ""} />
        <Input name="marca_modelo" defaultValue={ticket.marca_modelo ?? ""} />

        <Input
          name="cantidad"
          type="number"
          defaultValue={String(ticket.cantidad)}
        />
        <Input
          name="dependencia_entrega"
          defaultValue={ticket.dependencia_entrega ?? ""}
        />
        <Input
          name="funcionario_entrega"
          defaultValue={ticket.funcionario_entrega ?? ""}
        />

        <Input
          name="dependencia_recibe"
          defaultValue={ticket.dependencia_recibe ?? ""}
        />
        <Input
          name="funcionario_recibe"
          defaultValue={ticket.funcionario_recibe ?? ""}
        />
        <Input name="orden_numero" defaultValue={ticket.orden_numero ?? ""} />

        <div className="sm:col-span-2 lg:col-span-3">
          <textarea
            name="motivo"
            defaultValue={ticket.motivo ?? ""}
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
      <form action={onDelete} className="flex justify-end">
        <input type="hidden" name="id" value={ticket.id} />
        <Button type="submit" variant="destructive">
          Eliminar
        </Button>
      </form>
    </div>
  );
}
