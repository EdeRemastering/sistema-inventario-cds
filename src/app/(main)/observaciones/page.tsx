import { listObservaciones } from "../../../modules/observaciones/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateObservacion,
  actionDeleteObservacion,
  actionUpdateObservacion,
} from "../../../modules/observaciones/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ObservacionForm } from "../../../components/observaciones/observacion-form";
import { ObservacionRow } from "../../../components/observaciones/observacion-row";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers para las acciones de observaciones
async function handleCreateObservacion(formData: FormData) {
  await actionCreateObservacion(formData);
  revalidatePath("/observaciones");
}

async function handleUpdateObservacion(formData: FormData) {
  await actionUpdateObservacion(formData);
  revalidatePath("/observaciones");
}

async function handleDeleteObservacion(id: number) {
  await actionDeleteObservacion(id);
  revalidatePath("/observaciones");
}

export default async function ObservacionesPage() {
  const [observaciones, elementos] = await Promise.all([
    listObservaciones(),
    listElementos(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Observaciones</h1>
      <Card>
        <CardHeader>
          <ObservacionForm
            action={handleCreateObservacion}
            elementos={elementos}
          />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {observaciones.map((o) => (
                <ObservacionRow
                  key={o.id}
                  observacion={o}
                  elementos={elementos}
                  onUpdate={handleUpdateObservacion}
                  onDelete={() => handleDeleteObservacion(o.id)}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
