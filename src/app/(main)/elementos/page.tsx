import { listElementosPaginated } from "../../../modules/elementos/services";
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

export const runtime = "nodejs";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string; ubicacion?: string }>;
};

// Componente que maneja la lógica de datos
async function ElementosContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const ubicacionId = params.ubicacion ? parseInt(params.ubicacion, 10) : undefined;

  // Cargar datos en paralelo
  const [elementosResult, sedes, categorias, subcategorias, ubicaciones] = await Promise.all([
    listElementosPaginated(page, 50, search || undefined, isNaN(ubicacionId ?? 0) ? undefined : ubicacionId),
    listSedesActivas(),
    listCategorias(),
    listSubcategorias(),
    listUbicacionesActivas(),
  ]);

  const ubicacionFiltrada = ubicacionId ? ubicaciones.find((u) => u.id === ubicacionId) : null;

  return (
    <ElementosList
      elementos={elementosResult.data}
      ubicacionFiltro={ubicacionFiltrada ?? undefined}
      pagination={{
        total: elementosResult.total,
        page: elementosResult.page,
        pageSize: elementosResult.pageSize,
        totalPages: elementosResult.totalPages,
      }}
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

export default function ElementosPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ElementosSkeleton />}>
      <ElementosContent searchParams={searchParams} />
    </Suspense>
  );
}
