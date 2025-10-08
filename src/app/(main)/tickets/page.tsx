import { listTickets } from "../../../modules/tickets_guardados/services";
import {
  actionCreateTicket,
  actionDeleteTicket,
  actionUpdateTicket,
} from "../../../modules/tickets_guardados/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { TicketForm } from "../../../components/tickets/ticket-form";
import { TicketRow } from "../../../components/tickets/ticket-row";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers para las acciones de tickets
async function handleCreateTicket(formData: FormData) {
  await actionCreateTicket(formData);
  revalidatePath("/tickets");
}

async function handleUpdateTicket(formData: FormData) {
  await actionUpdateTicket(formData);
  revalidatePath("/tickets");
}

async function handleDeleteTicket(id: number) {
  await actionDeleteTicket(id);
  revalidatePath("/tickets");
}

export default async function TicketsPage() {
  const tickets = await listTickets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tickets Guardados</h1>
      <Card>
        <CardHeader>
          <TicketForm action={handleCreateTicket} />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onUpdate={handleUpdateTicket}
                  onDelete={() => handleDeleteTicket(t.id)}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
