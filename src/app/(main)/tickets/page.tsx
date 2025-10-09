import { listTickets } from "../../../modules/tickets_guardados/services";
import {
  actionCreateTicket,
  actionDeleteTicket,
  actionUpdateTicket,
} from "../../../modules/tickets_guardados/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { TicketUpsertDialog } from "../../../components/tickets/ticket-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers como variables (server actions)
const handleCreateTicket = async (formData: FormData) => {
  "use server";
  await actionCreateTicket(formData);
  revalidatePath("/tickets");
};

const handleUpdateTicket = async (formData: FormData) => {
  "use server";
  await actionUpdateTicket(formData);
  revalidatePath("/tickets");
};

const handleDeleteTicket = async (formData: FormData) => {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await actionDeleteTicket(id);
  revalidatePath("/tickets");
};

export default async function TicketsPage() {
  const tickets = await listTickets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tickets Guardados</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <TicketUpsertDialog create serverAction={handleCreateTicket} />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{t.numero_ticket}</div>
                    <div className="text-muted-foreground">
                      {new Date(t.fecha_salida).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <TicketUpsertDialog
                      create={false}
                      serverAction={handleUpdateTicket}
                      defaultValues={{
                        numero_ticket: t.numero_ticket,
                        fecha_salida: new Date(t.fecha_salida)
                          .toISOString()
                          .slice(0, 16),
                        fecha_estimada_devolucion: t.fecha_estimada_devolucion
                          ? new Date(t.fecha_estimada_devolucion)
                              .toISOString()
                              .slice(0, 16)
                          : "",
                        elemento: t.elemento ?? "",
                        serie: t.serie ?? "",
                        marca_modelo: t.marca_modelo ?? "",
                        cantidad: String(t.cantidad),
                        dependencia_entrega: t.dependencia_entrega ?? "",
                        funcionario_entrega: t.funcionario_entrega ?? "",
                        dependencia_recibe: t.dependencia_recibe ?? "",
                        funcionario_recibe: t.funcionario_recibe ?? "",
                        motivo: t.motivo ?? "",
                        orden_numero: t.orden_numero ?? "",
                      }}
                      hiddenFields={{ id: t.id }}
                    />
                    <DeleteButton
                      action={handleDeleteTicket}
                      fields={{ id: t.id }}
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
