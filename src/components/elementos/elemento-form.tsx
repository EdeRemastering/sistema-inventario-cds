import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SelectField } from "../ui/select-field";

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string };

type ElementoFormProps = {
  action: (formData: FormData) => Promise<void>;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  submitText?: string;
};

export function ElementoForm({
  action,
  categorias,
  subcategorias,
  submitText = "Agregar",
}: ElementoFormProps) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-6">
      <SelectField
        name="categoria_id"
        required
        placeholder="Categoría"
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
      />
      <SelectField
        name="subcategoria_id"
        placeholder="Subcategoría"
        options={subcategorias.map((s) => ({
          value: String(s.id),
          label: s.nombre,
        }))}
      />
      <Input name="serie" placeholder="Serie" required />
      <Input name="marca" placeholder="Marca" />
      <Input name="modelo" placeholder="Modelo" />
      <div className="flex gap-2">
        <Input
          name="cantidad"
          type="number"
          defaultValue="1"
          className="w-24"
        />
        <Button type="submit">{submitText}</Button>
      </div>
      <input type="hidden" name="estado_funcional" value="B" />
      <input type="hidden" name="estado_fisico" value="B" />
      <input
        type="hidden"
        name="fecha_entrada"
        value={new Date().toISOString().slice(0, 10)}
      />
    </form>
  );
}
