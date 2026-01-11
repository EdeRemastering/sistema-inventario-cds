import { listHojasVida } from "../../../modules/hojas_vida/services";
import { getFormSelectOptions } from "../../../lib/form-options";
import {
  actionCreateHojaVida,
  actionUpdateHojaVida,
  actionDeleteHojaVida,
} from "../../../modules/hojas_vida/actions";
import { HojasVidaList } from "../../../components/hojas-vida/hojas-vida-list";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function HojasVidaContent() {
  // Cargar hojas de vida y opciones filtradas en paralelo
  const [hojasVida, options] = await Promise.all([
    listHojasVida(),
    getFormSelectOptions(), // Solo trae opciones con datos relacionados
  ]);

  return (
    <HojasVidaList
      hojasVida={hojasVida}
      elementos={options.elementos}
      sedes={options.sedes}
      ubicaciones={options.ubicaciones}
      categorias={options.categorias}
      subcategorias={options.subcategorias}
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

