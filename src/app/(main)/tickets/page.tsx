import { getTicketsWithElementos } from "../../../modules/tickets/services";
import { TicketsList } from "../../../components/tickets/tickets-list";
import { TicketsSkeleton } from "../../../components/skeletons/tickets";
import { TicketUpsertDialog } from "../../../components/tickets/ticket-upsert-dialog";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";

async function TicketsContent() {
  const tickets = await getTicketsWithElementos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Gestiona los tickets de préstamo y devolución de elementos
          </p>
        </div>
        <TicketUpsertDialog
          create={true}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Ticket
            </Button>
          }
        />
      </div>

      <TicketsList tickets={tickets} />
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<TicketsSkeleton />}>
      <TicketsContent />
    </Suspense>
  );
}
