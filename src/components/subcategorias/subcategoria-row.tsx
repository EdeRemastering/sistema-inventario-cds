import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";
import { DeleteButton } from "../delete-button";

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
};

type SubcategoriaRowProps = {
  subcategoria: SubcategoriaItem;
  categorias: CategoriaOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function SubcategoriaRow({
  subcategoria,
  categorias,
  onUpdate,
  onDelete,
}: SubcategoriaRowProps) {
  return (
    <form
      action={onUpdate}
      className="flex items-center gap-2 rounded border p-3"
    >
      <input type="hidden" name="id" value={subcategoria.id} />
      <Input
        name="nombre"
        defaultValue={subcategoria.nombre}
        className="w-48"
      />
      <Input
        name="descripcion"
        defaultValue={subcategoria.descripcion ?? ""}
        className="flex-1"
      />
      <SelectField
        name="categoria_id"
        defaultValue={String(subcategoria.categoria_id)}
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
      />
      <div className="ml-auto flex gap-2">
        <Button type="submit" variant="default">
          Guardar
        </Button>
        <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
      </div>
    </form>
  );
}
