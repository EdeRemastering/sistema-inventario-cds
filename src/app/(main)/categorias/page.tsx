import { listCategorias } from "../../../modules/categorias/services";
import {
  actionCreateCategoria,
  actionDeleteCategoria,
  actionUpdateCategoria,
} from "../../../modules/categorias/actions";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { DeleteButton } from "../../../components/delete-button";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

export default async function CategoriasPage() {
  const categorias = await listCategorias();
  async function create(formData: FormData) {
    "use server";
    await actionCreateCategoria(formData);
    revalidatePath("/categorias");
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <Card>
        <CardHeader>
          <form action={create} className="grid gap-3 sm:grid-cols-3">
            <Input name="nombre" placeholder="Nombre" required />
            <Input name="descripcion" placeholder="Descripción" />
            <div className="flex items-center gap-4">
              <input name="estado" defaultValue="activo" className="hidden" />
              <div className="flex items-center gap-2">
                <Switch
                  defaultChecked
                  aria-label="Activo"
                  onCheckedChange={(checked) => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name=\\"estado\\"]'
                    );
                    if (input) input.value = checked ? "activo" : "inactivo";
                  }}
                />
                <span className="text-sm text-muted-foreground">Activo</span>
              </div>
              <Button type="submit">Crear</Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {categorias.map((c) => (
                <CategoriaRow
                  key={c.id}
                  id={c.id}
                  nombre={c.nombre}
                  descripcion={c.descripcion ?? ""}
                  estado={c.estado}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriaRow({
  id,
  nombre,
  descripcion,
  estado,
}: {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}) {
  async function update(formData: FormData) {
    "use server";
    await actionUpdateCategoria(formData);
  }
  return (
    <form
      action={update}
      className="flex items-center gap-2 rounded border p-3"
    >
      <input type="hidden" name="id" value={id} />
      <Input name="nombre" defaultValue={nombre} className="w-48" />
      <Input name="descripcion" defaultValue={descripcion} className="flex-1" />
      <input name="estado" defaultValue={estado} className="hidden" />
      <div className="flex items-center gap-2">
        <Switch
          defaultChecked={estado === "activo"}
          aria-label="Activo"
          onCheckedChange={(checked) => {
            const input = document.querySelector<HTMLInputElement>(
              'form input[name=\\"estado\\"]'
            );
            if (input) input.value = checked ? "activo" : "inactivo";
          }}
        />
        <span className="text-sm text-muted-foreground">Activo</span>
      </div>
      <div className="ml-auto flex gap-2">
        <Button type="submit" variant="default">
          Guardar
        </Button>
        <DeleteButton
          onConfirm={async () => {
            "use server";
            await actionDeleteCategoria(id);
          }}
        >
          Eliminar
        </DeleteButton>
      </div>
    </form>
  );
}
