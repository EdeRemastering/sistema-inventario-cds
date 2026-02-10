import { listUbicaciones } from "../../../modules/ubicaciones/services";
import { listSedesActivas } from "../../../modules/sedes/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import {
  actionCreateUbicacion,
  actionUpdateUbicacion,
  actionDeleteUbicacion,
} from "../../../modules/ubicaciones/actions";
import { UbicacionesList } from "../../../components/ubicaciones/ubicaciones-list";
import { UbicacionesSkeleton } from "../../../components/skeletons";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function UbicacionesContent() {
  const [ubicaciones, sedes, categorias, subcategorias] = await Promise.all([
    listUbicaciones(),
    listSedesActivas(),
    listCategorias(),
    listSubcategorias(),
  ]);

  return (
    <UbicacionesList
      ubicaciones={ubicaciones}
      sedes={sedes}
      categorias={categorias}
      subcategorias={subcategorias}
      onCreateUbicacion={actionCreateUbicacion}
      onUpdateUbicacion={actionUpdateUbicacion}
      onDeleteUbicacion={actionDeleteUbicacion}
    />
  );
}

export default function UbicacionesPage() {
  return (
    <Suspense fallback={<UbicacionesSkeleton />}>
      <UbicacionesContent />
    </Suspense>
  );
}
