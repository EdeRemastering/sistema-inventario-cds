import { listMovimientos } from "../../../modules/movimientos/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateMovimiento,
  actionDeleteMovimiento,
  actionUpdateMovimiento,
} from "../../../modules/movimientos/actions";
import { MovimientosList } from "../../../components/movimientos/movimientos-list";
import { MovimientosSkeleton } from "../../../components/skeletons/movimientos";
import { Suspense } from "react";

async function MovimientosContent() {
  const [movimientos, elementos] = await Promise.all([
    listMovimientos(),
    listElementos(),
  ]);

  return (
    <MovimientosList
      movimientos={movimientos}
      elementos={elementos}
      onCreateMovimiento={actionCreateMovimiento}
      onUpdateMovimiento={actionUpdateMovimiento}
      onDeleteMovimiento={actionDeleteMovimiento}
    />
  );
}

export default function MovimientosPage() {
  return (
    <Suspense fallback={<MovimientosSkeleton />}>
      <MovimientosContent />
    </Suspense>
  );
}
