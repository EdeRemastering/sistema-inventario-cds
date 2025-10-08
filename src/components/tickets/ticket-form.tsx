import { Button } from "../ui/button";
import { Input } from "../ui/input";

type TicketFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitText?: string;
};

export function TicketForm({
  action,
  submitText = "Guardar Ticket",
}: TicketFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Input name="numero_ticket" placeholder="Número de Ticket" required />
      <Input
        name="fecha_salida"
        type="datetime-local"
        placeholder="Fecha de Salida"
        required
      />
      <Input
        name="fecha_estimada_devolucion"
        type="datetime-local"
        placeholder="Fecha Estimada Devolución"
      />
      <Input name="elemento" placeholder="Elemento" />
      <Input name="serie" placeholder="Serie" />
      <Input name="marca_modelo" placeholder="Marca/Modelo" />
      <Input
        name="cantidad"
        type="number"
        placeholder="Cantidad"
        defaultValue="1"
      />
      <Input name="dependencia_entrega" placeholder="Dependencia Entrega" />
      <Input name="funcionario_entrega" placeholder="Funcionario Entrega" />
      <Input name="dependencia_recibe" placeholder="Dependencia Recibe" />
      <Input name="funcionario_recibe" placeholder="Funcionario Recibe" />
      <Input name="orden_numero" placeholder="Número de Orden" />
      <div className="sm:col-span-2 lg:col-span-3">
        <textarea
          name="motivo"
          placeholder="Motivo"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={3}
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
