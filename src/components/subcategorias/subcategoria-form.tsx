import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";

type CategoriaOption = { id: number; nombre: string };

type SubcategoriaFormProps = {
  action: (formData: FormData) => Promise<void>;
  categorias: CategoriaOption[];
  submitText?: string;
};

export function SubcategoriaForm({
  action,
  categorias,
  submitText = "Crear",
}: SubcategoriaFormProps) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <Input name="nombre" placeholder="Nombre" required />
      <Input name="descripcion" placeholder="Descripción" />
      <SelectField
        name="categoria_id"
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
        placeholder="Categoría"
      />
      <div className="flex gap-2">
        <Input name="estado" defaultValue="activo" className="hidden" />
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
