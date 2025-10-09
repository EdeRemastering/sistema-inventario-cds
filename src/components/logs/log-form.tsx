import { actionCreateLog } from "@/modules/logs/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";

type UsuarioOption = {
  id: number;
  nombre: string;
  username: string;
};

type LogFormProps = {
  usuarios: UsuarioOption[];
  submitText?: string;
};

export function LogForm({
  usuarios,
  submitText = "Crear Log",
}: LogFormProps) {
  return (
    <form action={actionCreateLog} className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="usuario_id"
        required
        placeholder="Usuario"
        options={usuarios.map((u) => ({
          value: String(u.id),
          label: `${u.nombre} (${u.username})`,
        }))}
      />
      <Input name="accion" placeholder="Acción" required />
      <Input name="ip" placeholder="IP" />
      <div className="sm:col-span-2">
        <textarea
          name="detalles"
          placeholder="Detalles de la acción"
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={4}
        />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
