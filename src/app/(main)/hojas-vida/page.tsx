import { listHojasVida } from "../../../modules/hojas_vida/services";
import { listElementosWithRelations } from "../../../modules/elementos/services";
import { listSedesActivas } from "../../../modules/sedes/services";
import { listUbicacionesActivas } from "../../../modules/ubicaciones/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import {
  actionCreateHojaVida,
  actionUpdateHojaVida,
  actionDeleteHojaVida,
} from "../../../modules/hojas_vida/actions";
import { HojasVidaList } from "../../../components/hojas-vida/hojas-vida-list";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function HojasVidaContent() {
  const [hojasVida, elementos, sedes, ubicaciones, categorias, subcategorias] = await Promise.all([
    listHojasVida(),
    listElementosWithRelations(),
    listSedesActivas(),
    listUbicacionesActivas(),
    listCategorias(),
    listSubcategorias(),
  ]);

  return (
    <HojasVidaList
      hojasVida={hojasVida}
      elementos={elementos}
      sedes={sedes}
      ubicaciones={ubicaciones}
      categorias={categorias}
      subcategorias={subcategorias}
      onCreateHojaVida={actionCreateHojaVida}
      onUpdateHojaVida={actionUpdateHojaVida}
      onDeleteHojaVida={actionDeleteHojaVida}
    />
  );
}

export default function HojasVidaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HojasVidaContent />
    </Suspense>
  );
}

