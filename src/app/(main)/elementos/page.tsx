import { listElementos } from "../../../modules/elementos/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import {
  actionCreateElemento,
  actionDeleteElemento,
  actionUpdateElemento,
} from "../../../modules/elementos/actions";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { SelectField } from "../../../components/ui/select-field";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { DeleteButton } from "../../../components/delete-button";

export default async function ElementosPage() {
  const [elementos, categorias, subcategorias] = await Promise.all([
    listElementos(),
    listCategorias(),
    listSubcategorias(),
  ]);

  async function create(formData: FormData) {
    "use server";
    await actionCreateElemento(formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Elementos</h1>
      <Card>
        <CardHeader>
          <form action={create} className="grid gap-3 sm:grid-cols-6">
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
              <Button type="submit">Agregar</Button>
            </div>
            <input type="hidden" name="estado_funcional" value="B" />
            <input type="hidden" name="estado_fisico" value="B" />
            <input
              type="hidden"
              name="fecha_entrada"
              value={new Date().toISOString().slice(0, 10)}
            />
          </form>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elementos.map((e) => (
              <ElementoRow
                key={e.id}
                e={e}
                categorias={categorias}
                subcategorias={subcategorias}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

function ElementoRow({
  e,
  categorias,
  subcategorias,
}: {
  e: ElementoItem;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
}) {
  async function update(formData: FormData) {
    "use server";
    await actionUpdateElemento(formData);
  }
  return (
    <form
      action={update}
      className="grid items-center gap-2 rounded border p-3 sm:grid-cols-8"
    >
      <input type="hidden" name="id" value={e.id} />
      <SelectField
        name="categoria_id"
        defaultValue={String(e.categoria_id)}
        options={categorias.map((c) => ({
          value: String(c.id),
          label: c.nombre,
        }))}
      />
      <SelectField
        name="subcategoria_id"
        defaultValue={e.subcategoria_id ? String(e.subcategoria_id) : undefined}
        placeholder="—"
        options={subcategorias.map((s) => ({
          value: String(s.id),
          label: s.nombre,
        }))}
      />
      <Input name="serie" defaultValue={e.serie} />
      <Input name="marca" defaultValue={e.marca ?? ""} />
      <Input name="modelo" defaultValue={e.modelo ?? ""} />
      <Input name="cantidad" type="number" defaultValue={String(e.cantidad)} />
      <div className="ml-auto flex gap-2">
        <Button type="submit">Guardar</Button>
        <DeleteButton
          onConfirm={async () => {
            "use server";
            await actionDeleteElemento(e.id);
          }}
        >
          Eliminar
        </DeleteButton>
      </div>
    </form>
  );
}
