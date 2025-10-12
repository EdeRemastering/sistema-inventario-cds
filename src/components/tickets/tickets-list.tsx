"use client";

import { Ticket } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { TicketUpsertDialog } from "./ticket-upsert-dialog";
import { SignatureDisplay } from "../ui/signature-display";
import { TicketActions } from "./ticket-actions";
import type { TicketGuardado } from "../../modules/tickets_guardados/types";

type TicketsListProps = {
  tickets: TicketGuardado[];
  onCreateTicket: (formData: FormData) => Promise<void>;
  onUpdateTicket: (formData: FormData) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
  onMarkAsReturned?: (id: number) => Promise<void>;
  onMarkAsCompleted?: (id: number) => Promise<void>;
};

export function TicketsList({
  tickets,
  onCreateTicket,
  onUpdateTicket,
  onDeleteTicket,
  onMarkAsReturned,
  onMarkAsCompleted,
}: TicketsListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: tickets,
      searchFields: [
        "numero_ticket",
        "dependencia_entrega",
        "dependencia_recibe",
        "motivo",
        "orden_numero",
      ],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Tickets Guardados</h1>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SearchInput
              placeholder="Buscar tickets..."
              onSearch={handleSearch}
              className="w-full sm:max-w-sm"
            />
            <div className="flex justify-end">
              <TicketUpsertDialog create serverAction={onCreateTicket} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<Ticket className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay tickets guardados"
                  : `No se encontraron tickets que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primer ticket para gestionar los préstamos de elementos."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredData.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border bg-card p-4 space-y-4"
                >
                  {/* Header con información principal */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-semibold text-base">
                          {ticket.numero_ticket}
                        </span>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          Ticket #{ticket.numero_ticket}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="font-medium">
                            {ticket.dependencia_entrega}
                          </span>
                          <span className="hidden sm:inline">→</span>
                          <span className="sm:hidden">↓</span>
                          <span className="font-medium">
                            {ticket.dependencia_recibe}
                          </span>
                        </div>
                        <div className="mt-1">
                          Fecha:{" "}
                          {new Date(ticket.fecha_salida).toLocaleDateString()}
                        </div>
                        {ticket.orden_numero && (
                          <div className="mt-1">
                            Orden: {ticket.orden_numero}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción en móvil */}
                    <div className="flex sm:hidden gap-2">
                      <TicketActions
                        ticket={ticket}
                        onUpdateTicket={onUpdateTicket}
                        onDeleteTicket={onDeleteTicket}
                        onMarkAsReturned={onMarkAsReturned}
                        onMarkAsCompleted={onMarkAsCompleted}
                      />
                    </div>
                  </div>

                  {/* Firmas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SignatureDisplay
                      signatureUrl={ticket.firma_funcionario_entrega}
                      label="Firma Entrega"
                      className="text-xs"
                    />
                    <SignatureDisplay
                      signatureUrl={ticket.firma_funcionario_recibe}
                      label="Firma Recibe"
                      className="text-xs"
                    />
                  </div>

                  {/* Información adicional y botones en desktop */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground space-y-1">
                      {ticket.motivo && <div>Motivo: {ticket.motivo}</div>}
                    </div>
                    <div className="flex gap-2">
                      <TicketActions
                        ticket={ticket}
                        onUpdateTicket={onUpdateTicket}
                        onDeleteTicket={onDeleteTicket}
                        onMarkAsReturned={onMarkAsReturned}
                        onMarkAsCompleted={onMarkAsCompleted}
                      />
                    </div>
                  </div>

                  {/* Información adicional en móvil */}
                  <div className="sm:hidden text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    {ticket.motivo && <div>Motivo: {ticket.motivo}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
