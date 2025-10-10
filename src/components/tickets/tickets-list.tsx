"use client";

import { Ticket } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { TicketUpsertDialog } from "./ticket-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { TicketInvoice } from "./ticket-invoice";
import { SignatureDisplay } from "../ui/signature-display";
import type { TicketGuardado } from "../../modules/tickets_guardados/types";

type TicketsListProps = {
  tickets: TicketGuardado[];
  onCreateTicket: (formData: FormData) => Promise<void>;
  onUpdateTicket: (formData: FormData) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
};

export function TicketsList({
  tickets,
  onCreateTicket,
  onUpdateTicket,
  onDeleteTicket,
}: TicketsListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: tickets,
      searchFields: [
        "numero_ticket",
        "elemento",
        "serie",
        "marca_modelo",
        "dependencia_entrega",
        "dependencia_recibe",
        "motivo",
        "orden_numero",
      ],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tickets Guardados</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar tickets..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <TicketUpsertDialog create serverAction={onCreateTicket} />
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
            <div className="space-y-3">
              {filteredData.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm flex-1">
                    <div className="font-medium">{ticket.numero_ticket}</div>
                    <div className="text-muted-foreground">
                      {new Date(ticket.fecha_salida).toLocaleString()}
                    </div>
                    <div className="flex gap-4 mt-2">
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
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <TicketUpsertDialog
                      create={false}
                      serverAction={onUpdateTicket}
                      defaultValues={{
                        numero_ticket: ticket.numero_ticket,
                        fecha_salida: new Date(ticket.fecha_salida)
                          .toISOString()
                          .slice(0, 16),
                        fecha_estimada_devolucion:
                          ticket.fecha_estimada_devolucion
                            ? new Date(ticket.fecha_estimada_devolucion)
                                .toISOString()
                                .slice(0, 16)
                            : "",
                        elemento: ticket.elemento ?? "",
                        serie: ticket.serie ?? "",
                        marca_modelo: ticket.marca_modelo ?? "",
                        cantidad: String(ticket.cantidad),
                        dependencia_entrega: ticket.dependencia_entrega ?? "",
                        firma_funcionario_entrega:
                          ticket.firma_funcionario_entrega ?? "",
                        dependencia_recibe: ticket.dependencia_recibe ?? "",
                        firma_funcionario_recibe:
                          ticket.firma_funcionario_recibe ?? "",
                        motivo: ticket.motivo ?? "",
                        orden_numero: ticket.orden_numero ?? "",
                      }}
                      hiddenFields={{ id: ticket.id }}
                    />
                    <TicketInvoice ticket={ticket} />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteTicket(ticket.id);
                      }}
                    >
                      Eliminar
                    </DeleteButton>
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
