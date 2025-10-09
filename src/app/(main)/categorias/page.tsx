import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { CategoriaUpsertDialog } from "../../../components/categorias/categoria-upsert-dialog";
import {
  actionCreateCategoria,
  actionDeleteCategoria,
  actionListCategorias,
  actionUpdateCategoria,
} from "../../../modules/categorias/actions";
import { DeleteButton } from "../../../components/delete-button";
import { CategoriasSkeleton } from "../../../components/skeletons/categorias";
import { Suspense } from "react";

async function CategoriasContent() {
  const categorias = await actionListCategorias();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div />
            <CategoriaUpsertDialog
              create
              serverAction={actionCreateCategoria}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categorias.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{c.nombre}</div>
                  <div className="text-muted-foreground">
                    {c.descripcion ?? ""}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <CategoriaUpsertDialog
                    create={false}
                    serverAction={actionUpdateCategoria}
                    defaultValues={{
                      nombre: c.nombre,
                      descripcion: c.descripcion ?? "",
                      estado: c.estado as "activo" | "inactivo",
                    }}
                    hiddenFields={{ id: c.id }}
                  />
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await actionDeleteCategoria(c.id);
                    }}
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

export default function CategoriasPage() {
  return (
    <Suspense fallback={<CategoriasSkeleton />}>
      <CategoriasContent />
    </Suspense>
  );
}
