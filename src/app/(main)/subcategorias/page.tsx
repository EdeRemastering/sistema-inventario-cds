import { listSubcategorias } from "../../../modules/subcategorias/services";
import { listCategorias } from "../../../modules/categorias/services";
import {
  actionCreateSubcategoria,
  actionUpdateSubcategoria,
  actionDeleteSubcategoria,
} from "../../../modules/subcategorias/actions";
import { SubcategoriasList } from "../../../components/subcategorias/subcategorias-list";
import { SubcategoriasSkeleton } from "../../../components/skeletons/subcategorias";
import { Suspense } from "react";

async function SubcategoriasContent() {
  const [subcategorias, categorias] = await Promise.all([
    listSubcategorias(),
    listCategorias(),
  ]);

  return (
    <SubcategoriasList
      subcategorias={subcategorias}
      categorias={categorias}
      onCreateSubcategoria={actionCreateSubcategoria}
      onUpdateSubcategoria={actionUpdateSubcategoria}
      onDeleteSubcategoria={actionDeleteSubcategoria}
    />
  );
}

export default function SubcategoriasPage() {
  return (
    <Suspense fallback={<SubcategoriasSkeleton />}>
      <SubcategoriasContent />
    </Suspense>
  );
}
