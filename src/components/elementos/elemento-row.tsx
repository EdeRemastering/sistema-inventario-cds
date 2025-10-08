import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";
import { DeleteButton } from "../delete-button";

type ElementoItem = {
  id: number;
  categoria_id: number;
  subcategoria_id: number | null;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
};

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string };

type ElementoRowProps = {
  elemento: ElementoItem;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ElementoRow({
  elemento,
  categorias,
  subcategorias,
  onUpdate,
  onDelete,
}: ElementoRowProps) {
  return (
    <form
      action={onUpdate}
      className="grid items-center gap-2 rounded border p-3 sm:grid-cols-8"
    >
      <input type="hidden" name="id" value={elemento.id} />
      <SelectField
        name="categoria_id"
        defaultValue={String(elemento.categoria_id)}
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
      />
      <SelectField
        name="subcategoria_id"
        defaultValue={
          elemento.subcategoria_id
            ? String(elemento.subcategoria_id)
            : undefined
        }
        placeholder="—"
        options={subcategorias.map((s) => ({
          value: String(s.id),
          label: s.nombre,
        }))}
      />
      <Input name="serie" defaultValue={elemento.serie} />
      <Input name="marca" defaultValue={elemento.marca ?? ""} />
      <Input name="modelo" defaultValue={elemento.modelo ?? ""} />
      <Input
        name="cantidad"
        type="number"
        defaultValue={String(elemento.cantidad)}
      />
      <div className="ml-auto flex gap-2">
        <Button type="submit">Guardar</Button>
        <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
      </div>
    </form>
  );
}
