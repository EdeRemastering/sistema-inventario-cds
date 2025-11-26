import { listHojasVida } from "../../../modules/hojas_vida/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateHojaVida,
  actionUpdateHojaVida,
  actionDeleteHojaVida,
} from "../../../modules/hojas_vida/actions";
import { HojasVidaList } from "../../../components/hojas-vida/hojas-vida-list";
import { Suspense } from "react";

// Componente que maneja la lógica de datos
async function HojasVidaContent() {
  const [hojasVida, elementos] = await Promise.all([
    listHojasVida(),
    listElementos(),
  ]);

  return (
    <HojasVidaList
      hojasVida={hojasVida}
      elementos={elementos}
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

