import { listMovimientos } from "../../../modules/movimientos/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateMovimiento,
  actionDeleteMovimiento,
  actionUpdateMovimiento,
} from "../../../modules/movimientos/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { MovimientoForm } from "../../../components/movimientos/movimiento-form";
import { MovimientoRow } from "../../../components/movimientos/movimiento-row";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers para las acciones de movimientos
async function handleCreateMovimiento(formData: FormData) {
  await actionCreateMovimiento(formData);
  revalidatePath("/movimientos");
}

async function handleUpdateMovimiento(formData: FormData) {
  await actionUpdateMovimiento(formData);
  revalidatePath("/movimientos");
}

async function handleDeleteMovimiento(id: number) {
  await actionDeleteMovimiento(id);
  revalidatePath("/movimientos");
}

export default async function MovimientosPage() {
  const [movimientos, elementos] = await Promise.all([
    listMovimientos(),
    listElementos(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Movimientos</h1>
      <Card>
        <CardHeader>
          <MovimientoForm
            action={handleCreateMovimiento}
            elementos={elementos}
          />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {movimientos.map((m) => (
                <MovimientoRow
                  key={m.id}
                  movimiento={m}
                  elementos={elementos}
                  onUpdate={handleUpdateMovimiento}
                  onDelete={() => handleDeleteMovimiento(m.id)}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
