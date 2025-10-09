import { listObservaciones } from "../../../modules/observaciones/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateObservacion,
  actionDeleteObservacion,
  actionUpdateObservacion,
} from "../../../modules/observaciones/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ObservacionUpsertDialog } from "../../../components/observaciones/observacion-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { ObservacionesSkeleton } from "../../../components/skeletons/observaciones";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers como variables (server actions)
const handleCreateObservacion = async (formData: FormData) => {
  "use server";
  await actionCreateObservacion(formData);
  revalidatePath("/observaciones");
};

const handleUpdateObservacion = async (formData: FormData) => {
  "use server";
  await actionUpdateObservacion(formData);
  revalidatePath("/observaciones");
};

const handleDeleteObservacion = async (formData: FormData) => {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await actionDeleteObservacion(id);
  revalidatePath("/observaciones");
};

async function ObservacionesContent() {
  const [observaciones, elementos] = await Promise.all([
    listObservaciones(),
    listElementos(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Observaciones</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <ObservacionUpsertDialog
              create
              serverAction={handleCreateObservacion}
              elementos={elementos}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {observaciones.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{o.descripcion}</div>
                  <div className="text-muted-foreground">
                    {new Date(o.fecha_observacion).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ObservacionUpsertDialog
                    create={false}
                    serverAction={handleUpdateObservacion}
                    elementos={elementos}
                    defaultValues={{
                      elemento_id: String(o.elemento_id),
                      fecha_observacion: new Date(o.fecha_observacion)
                        .toISOString()
                        .slice(0, 10),
                      descripcion: o.descripcion,
                    }}
                    hiddenFields={{ id: o.id }}
                  />
                  <DeleteButton
                    action={handleDeleteObservacion}
                    fields={{ id: o.id }}
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

export default function ObservacionesPage() {
  return (
    <Suspense fallback={<ObservacionesSkeleton />}>
      <ObservacionesContent />
    </Suspense>
  );
}
