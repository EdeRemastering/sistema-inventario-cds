import { listObservaciones } from "../../../modules/observaciones/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateObservacion,
  actionDeleteObservacion,
  actionUpdateObservacion,
} from "../../../modules/observaciones/actions";
import { ObservacionesList } from "../../../components/observaciones/observaciones-list";
import { ObservacionesSkeleton } from "../../../components/skeletons/observaciones";
import { Suspense } from "react";

async function ObservacionesContent() {
  const [observaciones, elementos] = await Promise.all([
    listObservaciones(),
    listElementos(),
  ]);

  return (
    <ObservacionesList
      observaciones={observaciones}
      elementos={elementos}
      onCreateObservacion={actionCreateObservacion}
      onUpdateObservacion={actionUpdateObservacion}
      onDeleteObservacion={actionDeleteObservacion}
    />
  );
}

export default function ObservacionesPage() {
  return (
    <Suspense fallback={<ObservacionesSkeleton />}>
      <ObservacionesContent />
    </Suspense>
  );
}
