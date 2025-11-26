import { listUbicaciones } from "../../../modules/ubicaciones/services";
import { listSedesActivas } from "../../../modules/sedes/services";
import {
  actionCreateUbicacion,
  actionUpdateUbicacion,
  actionDeleteUbicacion,
} from "../../../modules/ubicaciones/actions";
import { UbicacionesList } from "../../../components/ubicaciones/ubicaciones-list";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function UbicacionesContent() {
  const [ubicaciones, sedes] = await Promise.all([
    listUbicaciones(),
    listSedesActivas(),
  ]);

  return (
    <UbicacionesList
      ubicaciones={ubicaciones}
      sedes={sedes}
      onCreateUbicacion={actionCreateUbicacion}
      onUpdateUbicacion={actionUpdateUbicacion}
      onDeleteUbicacion={actionDeleteUbicacion}
    />
  );
}

export default function UbicacionesPage() {
  return (
    <Suspense fallback={<div>Cargando ubicaciones...</div>}>
      <UbicacionesContent />
    </Suspense>
  );
}


