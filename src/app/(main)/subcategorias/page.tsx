import { listSubcategorias } from "../../../modules/subcategorias/services";
import { listCategorias } from "../../../modules/categorias/services";
import {
  actionCreateSubcategoria,
  actionDeleteSubcategoria,
  actionUpdateSubcategoria,
} from "../../../modules/subcategorias/actions";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { SelectField } from "../../../components/ui/select-field";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { DeleteButton } from "../../../components/delete-button";

export default async function SubcategoriasPage() {
  const [subcategorias, categorias] = await Promise.all([
    listSubcategorias(),
    listCategorias(),
  ]);

  async function create(formData: FormData) {
    "use server";
    await actionCreateSubcategoria(formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Subcategorías</h1>
      <Card>
        <CardHeader>
          <form action={create} className="grid gap-3 sm:grid-cols-4">
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
              <Button type="submit">Crear</Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subcategorias.map((s) => (
              <SubcategoriaRow key={s.id} s={s} categorias={categorias} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
};

function SubcategoriaRow({
  s,
  categorias,
}: {
  s: SubcategoriaItem;
  categorias: CategoriaOption[];
}) {
  async function update(formData: FormData) {
    "use server";
    await actionUpdateSubcategoria(formData);
  }
  return (
    <form
      action={update}
      className="flex items-center gap-2 rounded border p-3"
    >
      <input type="hidden" name="id" value={s.id} />
      <Input name="nombre" defaultValue={s.nombre} className="w-48" />
      <Input
        name="descripcion"
        defaultValue={s.descripcion ?? ""}
        className="flex-1"
      />
      <SelectField
        name="categoria_id"
        defaultValue={String(s.categoria_id)}
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
      />
      <div className="ml-auto flex gap-2">
        <Button type="submit" variant="default">
          Guardar
        </Button>
        <DeleteButton
          onConfirm={async () => {
            "use server";
            await actionDeleteSubcategoria(s.id);
          }}
        >
          Eliminar
        </DeleteButton>
      </div>
    </form>
  );
}
