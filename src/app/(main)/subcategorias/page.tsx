import { listSubcategorias } from "../../../modules/subcategorias/services";
import { listCategorias } from "../../../modules/categorias/services";
import {
  actionCreateSubcategoria,
  actionDeleteSubcategoria,
  actionUpdateSubcategoria,
} from "../../../modules/subcategorias/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { SubcategoriaUpsertDialog } from "../../../components/subcategorias/subcategoria-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { revalidatePath } from "next/cache";

// Handlers como variables (server actions)
const handleCreateSubcategoria = async (formData: FormData) => {
  "use server";
  await actionCreateSubcategoria(formData);
  revalidatePath("/subcategorias");
};

const handleUpdateSubcategoria = async (formData: FormData) => {
  "use server";
  await actionUpdateSubcategoria(formData);
  revalidatePath("/subcategorias");
};

const handleDeleteSubcategoria = async (formData: FormData) => {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await actionDeleteSubcategoria(id);
  revalidatePath("/subcategorias");
};

export default async function SubcategoriasPage() {
  const [subcategorias, categorias] = await Promise.all([
    listSubcategorias(),
    listCategorias(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Subcategorías</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <SubcategoriaUpsertDialog
              create
              serverAction={handleCreateSubcategoria}
              categorias={categorias}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subcategorias.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{s.nombre}</div>
                  <div className="text-muted-foreground">
                    {s.descripcion ?? ""}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <SubcategoriaUpsertDialog
                    create={false}
                    serverAction={handleUpdateSubcategoria}
                    categorias={categorias}
                    defaultValues={{
                      nombre: s.nombre,
                      descripcion: s.descripcion ?? "",
                      categoria_id: String(s.categoria_id),
                    }}
                    hiddenFields={{ id: s.id }}
                  />
                  <DeleteButton
                    action={handleDeleteSubcategoria}
                    fields={{ id: s.id }}
                  >
                    Eliminar
                  </DeleteButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
