import { listMovimientos } from "../../../modules/movimientos/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateMovimiento,
  actionDeleteMovimiento,
  actionUpdateMovimiento,
} from "../../../modules/movimientos/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { MovimientoUpsertDialog } from "../../../components/movimientos/movimiento-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
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
          <div className="flex items-center justify-end">
            <MovimientoUpsertDialog
              create
              serverAction={handleCreateMovimiento}
              elementos={elementos}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{m.numero_ticket}</div>
                    <div className="text-muted-foreground">
                      Cantidad: {m.cantidad}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <MovimientoUpsertDialog
                      create={false}
                      serverAction={handleUpdateMovimiento}
                      elementos={elementos}
                      defaultValues={{
                        elemento_id: String(m.elemento_id),
                        cantidad: String(m.cantidad),
                        orden_numero: m.orden_numero,
                        fecha_movimiento: new Date(m.fecha_movimiento)
                          .toISOString()
                          .slice(0, 16),
                        dependencia_entrega: m.dependencia_entrega,
                        funcionario_entrega: m.funcionario_entrega,
                        cargo_funcionario_entrega:
                          m.cargo_funcionario_entrega ?? "",
                        dependencia_recibe: m.dependencia_recibe,
                        funcionario_recibe: m.funcionario_recibe,
                        cargo_funcionario_recibe:
                          m.cargo_funcionario_recibe ?? "",
                        motivo: m.motivo,
                        fecha_estimada_devolucion: new Date(
                          m.fecha_estimada_devolucion
                        )
                          .toISOString()
                          .slice(0, 10),
                        numero_ticket: m.numero_ticket,
                        observaciones_entrega: m.observaciones_entrega ?? "",
                      }}
                      hiddenFields={{ id: m.id }}
                    />
                    <DeleteButton
                      action={handleDeleteMovimiento}
                      fields={{ id: m.id }}
                    >
                      Eliminar
                    </DeleteButton>
                  </div>
                </div>
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
