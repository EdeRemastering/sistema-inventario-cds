import { listTickets } from "../../../modules/tickets_guardados/services";
import {
  actionCreateTicket,
  actionDeleteTicket,
  actionUpdateTicket,
  actionMarkTicketAsReturned,
  actionMarkTicketAsCompleted,
} from "../../../modules/tickets_guardados/actions";
import { TicketsList } from "../../../components/tickets/tickets-list";
import { TicketsSkeleton } from "../../../components/skeletons/tickets";
import { Suspense } from "react";

async function TicketsContent() {
  const tickets = await listTickets();

  return (
    <TicketsList
      tickets={tickets}
      onCreateTicket={actionCreateTicket}
      onUpdateTicket={actionUpdateTicket}
      onDeleteTicket={actionDeleteTicket}
      onMarkAsReturned={actionMarkTicketAsReturned}
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
