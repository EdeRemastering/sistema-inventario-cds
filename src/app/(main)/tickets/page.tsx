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
                  onDelete={handleDeleteTicket}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
