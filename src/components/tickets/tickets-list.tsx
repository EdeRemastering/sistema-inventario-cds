"use client";

import { Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TicketUpsertDialog } from "./ticket-upsert-dialog";
import { SignatureDisplay } from "../ui/signature-display";
import { TicketActions } from "./ticket-actions";
import type { TicketGuardado } from "../../modules/tickets_guardados/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";

type TicketsListProps = {
  tickets: TicketGuardado[];
  ubicaciones: Ubicacion[];
  onCreateTicket: (formData: FormData) => Promise<void>;
  onUpdateTicket: (formData: FormData) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
  onMarkAsCompleted?: (id: number) => Promise<void>;
};

export function TicketsList({
  tickets,
  ubicaciones,
  onCreateTicket,
  onUpdateTicket,
  onDeleteTicket,
  onMarkAsCompleted,
}: TicketsListProps) {
  const [tab, setTab] = useState<"activos" | "historial">("activos");
  const [searchQuery, setSearchQuery] = useState("");

  const isTicketClosed = (ticket: TicketGuardado) => {
    const motivo = (ticket.motivo ?? "").toLowerCase();
    return (
      motivo.includes("devuelto") ||
      motivo.includes("completado") ||
      motivo.includes("entregado")
    );
  };

  const { activos, historial } = useMemo(() => {
    const activos: TicketGuardado[] = [];
    const historial: TicketGuardado[] = [];

    for (const t of tickets) {
      if (isTicketClosed(t)) historial.push(t);
      else activos.push(t);
    }

    return { activos, historial };
  }, [tickets]);

  const matchesSearch = (ticket: TicketGuardado) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const haystack = [
      ticket.numero_ticket,
      ticket.dependencia_recibe,
      ticket.persona_entrega_nombre ?? "",
      ticket.persona_entrega_apellido ?? "",
      ticket.persona_recibe_nombre ?? "",
      ticket.persona_recibe_apellido ?? "",
      ticket.motivo ?? "",
      ticket.orden_numero ?? "",
      ticket.ubicacion?.nombre ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  };

  const activosFiltrados = useMemo(
    () => activos.filter(matchesSearch),
    [activos, searchQuery]
  );
  const historialFiltrado = useMemo(
    () => historial.filter(matchesSearch),
    [historial, searchQuery]
  );

  const TicketCard = ({ ticket }: { ticket: TicketGuardado }) => (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Header con información principal */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold text-base">{ticket.numero_ticket}</span>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              Ticket #{ticket.numero_ticket}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Resuelve:</span>{" "}
                <span>
                  {ticket.persona_entrega_nombre || ticket.persona_entrega_apellido
                    ? `${ticket.persona_entrega_nombre ?? ""} ${ticket.persona_entrega_apellido ?? ""}`.trim()
                    : "Coordinación de Logística"}
                </span>
              </div>
              <div>
                <span className="font-medium">Solicitante:</span>{" "}
                <span>
                  {ticket.persona_recibe_nombre || ticket.persona_recibe_apellido
                    ? `${ticket.persona_recibe_nombre ?? ""} ${ticket.persona_recibe_apellido ?? ""}`.trim()
                    : "No especificado"}
                  {ticket.dependencia_recibe ? ` (${ticket.dependencia_recibe})` : ""}
                </span>
              </div>
            </div>
            <div className="mt-1">
              Fecha de inicio: {new Date(ticket.fecha_salida).toLocaleDateString()}
            </div>
            {ticket.ubicacion?.nombre && (
              <div className="mt-1">Ubicación: {ticket.ubicacion.nombre}</div>
            )}
            {ticket.orden_numero && <div className="mt-1">Orden: {ticket.orden_numero}</div>}
          </div>
        </div>

        {/* Botones de acción en móvil */}
        <div className="flex sm:hidden gap-2">
          <TicketActions
            ticket={ticket}
            ubicaciones={ubicaciones}
            onUpdateTicket={onUpdateTicket}
            onDeleteTicket={onDeleteTicket}
            onMarkAsCompleted={onMarkAsCompleted}
          />
        </div>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SignatureDisplay
          signatureUrl={ticket.firma_funcionario_entrega}
          label="Firma (Resuelve)"
          className="text-xs"
        />
        <SignatureDisplay
          signatureUrl={ticket.firma_funcionario_recibe}
          label="Firma (Solicitante)"
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
            ubicaciones={ubicaciones}
            onUpdateTicket={onUpdateTicket}
            onDeleteTicket={onDeleteTicket}
            onMarkAsCompleted={onMarkAsCompleted}
          />
        </div>
      </div>

      {/* Información adicional en móvil */}
      <div className="sm:hidden text-xs text-muted-foreground space-y-1 pt-2 border-t">
        {ticket.motivo && <div>Motivo: {ticket.motivo}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold" data-tour="page-title">
          Tickets (Préstamos)
        </h1>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SearchInput
              placeholder="Buscar tickets..."
              onSearch={setSearchQuery}
              className="w-full sm:max-w-sm"
            />
            <div className="flex justify-end" data-tour="tickets-create">
              <TicketUpsertDialog create serverAction={onCreateTicket} ubicaciones={ubicaciones} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "activos" | "historial")}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="activos" className="flex-1 sm:flex-none">
                Activos ({activos.length})
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex-1 sm:flex-none">
                Historial ({historial.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activos">
              {activos.length === 0 ? (
                <EmptyState
                  icon={<Ticket className="h-8 w-8 text-muted-foreground" />}
                  title="No hay tickets activos"
                  description="Crea un ticket para registrar un préstamo de una ubicación (ambiente)."
                />
              ) : activosFiltrados.length === 0 ? (
                <EmptyState
                  icon={<Ticket className="h-8 w-8 text-muted-foreground" />}
                  title={`No se encontraron tickets activos que coincidan con "${searchQuery}"`}
                  description="Intenta con un término de búsqueda diferente o más general."
                />
              ) : (
                <div className="space-y-4">
                  {activosFiltrados.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="historial">
              {historial.length === 0 ? (
                <EmptyState
                  icon={<Ticket className="h-8 w-8 text-muted-foreground" />}
                  title="No hay historial de tickets"
                  description="Cuando cierres tickets (devolución / completado) aparecerán aquí."
                />
              ) : historialFiltrado.length === 0 ? (
                <EmptyState
                  icon={<Ticket className="h-8 w-8 text-muted-foreground" />}
                  title={`No se encontraron tickets en el historial que coincidan con "${searchQuery}"`}
                  description="Intenta con un término de búsqueda diferente o más general."
                />
              ) : (
                <div className="space-y-4">
                  {historialFiltrado.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
