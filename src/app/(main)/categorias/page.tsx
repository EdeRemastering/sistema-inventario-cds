import {
  actionListCategorias,
  actionCreateCategoria,
  actionUpdateCategoria,
  actionDeleteCategoria,
} from "../../../modules/categorias/actions";
import { CategoriasList } from "../../../components/categorias/categorias-list";
import { CategoriasSkeleton } from "../../../components/skeletons/categorias";
import { Suspense } from "react";

async function CategoriasContent() {
  const categorias = await actionListCategorias();

  return (
    <CategoriasList
      categorias={categorias}
      onCreateCategoria={actionCreateCategoria}
      onUpdateCategoria={actionUpdateCategoria}
      onDeleteCategoria={actionDeleteCategoria}
    />
  );
}

export default function CategoriasPage() {
  return (
    <Suspense fallback={<CategoriasSkeleton />}>
      <CategoriasContent />
    </Suspense>
  );
}
