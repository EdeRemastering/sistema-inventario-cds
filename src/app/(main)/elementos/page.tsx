import { listElementos } from "../../../modules/elementos/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
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
  const [elementos, categorias, subcategorias] = await Promise.all([
    listElementos(),
    listCategorias(),
    listSubcategorias(),
  ]);

  return (
    <ElementosList
      elementos={elementos}
      categorias={categorias}
      subcategorias={subcategorias}
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
