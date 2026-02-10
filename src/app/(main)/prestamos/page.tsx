import { listPrestamos } from "../../../modules/prestamos/services";
import { listUbicacionesConElementos } from "../../../modules/ubicaciones/services";
import {
  actionCreatePrestamo,
  actionDeletePrestamo,
  actionUpdatePrestamo,
  actionMarkPrestamoAsCompleted,
} from "../../../modules/prestamos/actions";
import { PrestamosList } from "../../../components/prestamos/prestamos-list";
import { PrestamosSkeleton } from "../../../components/skeletons/prestamos";
import { Suspense } from "react";

async function PrestamosContent() {
  const [prestamos, ubicaciones] = await Promise.all([
    listPrestamos(),
    listUbicacionesConElementos(),
  ]);

  return (
    <PrestamosList
      prestamos={prestamos}
      ubicaciones={ubicaciones}
      onCreatePrestamo={actionCreatePrestamo}
      onUpdatePrestamo={actionUpdatePrestamo}
      onDeletePrestamo={actionDeletePrestamo}
      onMarkAsCompleted={actionMarkPrestamoAsCompleted}
    />
  );
}

export default function PrestamosPage() {
  return (
    <Suspense fallback={<PrestamosSkeleton />}>
      <PrestamosContent />
    </Suspense>
  );
}
