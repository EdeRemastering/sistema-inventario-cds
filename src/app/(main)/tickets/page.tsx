import { listTickets } from "../../../modules/tickets_guardados/services";
import { listUbicacionesConElementos } from "../../../modules/ubicaciones/services";
import {
  actionCreateTicket,
  actionDeleteTicket,
  actionUpdateTicket,
  actionMarkTicketAsCompleted,
} from "../../../modules/tickets_guardados/actions";
import { TicketsList } from "../../../components/tickets/tickets-list";
import { TicketsSkeleton } from "../../../components/skeletons/tickets";
import { Suspense } from "react";

async function TicketsContent() {
  const [tickets, ubicaciones] = await Promise.all([
    listTickets(),
    listUbicacionesConElementos(),
  ]);

  return (
    <TicketsList
      tickets={tickets}
      ubicaciones={ubicaciones}
      onCreateTicket={actionCreateTicket}
      onUpdateTicket={actionUpdateTicket}
      onDeleteTicket={actionDeleteTicket}
      onMarkAsCompleted={actionMarkTicketAsCompleted}
    />
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<TicketsSkeleton />}>
      <TicketsContent />
    </Suspense>
  );
}
