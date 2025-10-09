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

// Handlers como variables (server actions)
const handleCreateMovimiento = async (formData: FormData) => {
  "use server";
  await actionCreateMovimiento(formData);
  revalidatePath("/movimientos");
};

const handleUpdateMovimiento = async (formData: FormData) => {
  "use server";
  await actionUpdateMovimiento(formData);
  revalidatePath("/movimientos");
};

const handleDeleteMovimiento = async (formData: FormData) => {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await actionDeleteMovimiento(id);
  revalidatePath("/movimientos");
};

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
                  onDelete={handleDeleteMovimiento}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
