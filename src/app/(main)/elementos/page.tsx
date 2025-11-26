import { listElementos } from "../../../modules/elementos/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import { listUbicacionesActivas } from "../../../modules/ubicaciones/services";
import { listSedesActivas } from "../../../modules/sedes/services";
import {
  actionCreateElemento,
  actionUpdateElemento,
  actionDeleteElemento,
} from "../../../modules/elementos/actions";
import { ElementosList } from "../../../components/elementos/elementos-list";
import { ElementosSkeleton } from "../../../components/skeletons/elementos";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function ElementosContent() {
  const [elementos, sedes, categorias, subcategorias, ubicaciones] = await Promise.all([
    listElementos(),
    listSedesActivas(),
    listCategorias(),
    listSubcategorias(),
    listUbicacionesActivas(),
  ]);

  return (
    <ElementosList
      elementos={elementos}
      sedes={sedes}
      categorias={categorias}
      subcategorias={subcategorias}
      ubicaciones={ubicaciones}
      onCreateElemento={actionCreateElemento}
      onUpdateElemento={actionUpdateElemento}
      onDeleteElemento={actionDeleteElemento}
    />
  );
}

export default function ElementosPage() {
  return (
    <Suspense fallback={<ElementosSkeleton />}>
      <ElementosContent />
    </Suspense>
  );
}
