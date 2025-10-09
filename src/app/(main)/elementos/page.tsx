import { listElementos } from "../../../modules/elementos/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import {
  actionCreateElemento,
  actionDeleteElemento,
  actionUpdateElemento,
} from "../../../modules/elementos/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ElementoUpsertDialog } from "../../../components/elementos/elemento-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { ElementosSkeleton } from "../../../components/skeletons/elementos";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function ElementosContent() {
  const [elementos, categorias, subcategorias] = await Promise.all([
    listElementos(),
    listCategorias(),
    listSubcategorias(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Elementos</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <ElementoUpsertDialog
              create
              serverAction={actionCreateElemento}
              categorias={categorias}
              subcategorias={subcategorias}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elementos.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{e.serie}</div>
                  <div className="text-muted-foreground">
                    Cantidad: {e.cantidad}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ElementoUpsertDialog
                    create={false}
                    serverAction={actionUpdateElemento}
                    categorias={categorias}
                    subcategorias={subcategorias}
                    defaultValues={{
                      categoria_id: String(e.categoria_id),
                      subcategoria_id: e.subcategoria_id
                        ? String(e.subcategoria_id)
                        : "",
                      serie: e.serie,
                      marca: e.marca ?? "",
                      modelo: e.modelo ?? "",
                      cantidad: String(e.cantidad),
                    }}
                    hiddenFields={{ id: e.id }}
                  />
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await actionDeleteElemento(e.id);
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

export default function ElementosPage() {
  return (
    <Suspense fallback={<ElementosSkeleton />}>
      <ElementosContent />
    </Suspense>
  );
}
