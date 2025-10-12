"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Package,
  Calendar,
  Building,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { TicketWithElementos } from "../../modules/tickets/types";
import { DeleteButton } from "../delete-button";

type Props = {
  tickets: TicketWithElementos[];
  isLoading?: boolean;
};

export function TicketsList({ tickets, isLoading }: Props) {
  const [selectedTicket, setSelectedTicket] =
    useState<TicketWithElementos | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "SALIDA" ? (
      <Badge variant="destructive">Salida</Badge>
    ) : (
      <Badge variant="default">Devolución</Badge>
    );
  };

  const handleViewDetails = (ticket: TicketWithElementos) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error("Error al eliminar ticket");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay tickets registrados
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Comience creando su primer ticket de préstamo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Ticket #{ticket.numero_ticket}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getTipoBadge(ticket.tipo)}
                      <Badge variant="outline">
                        {ticket.ticket_elementos?.length || 0} elemento(s)
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <DeleteButton
                        onConfirm={() => handleDelete(ticket.id)}
                        title="Eliminar Ticket"
                        description="¿Está seguro de que desea eliminar este ticket? Esta acción no se puede deshacer."
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DeleteButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Fecha de movimiento:</span>
                  </div>
                  <p className="font-medium">
                    {formatDate(ticket.fecha_movimiento)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Dependencia:</span>
                  </div>
                  <p className="font-medium">{ticket.dependencia_recibe}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Motivo:</span>
                  </div>
                  <p className="font-medium truncate">{ticket.motivo}</p>
                </div>
              </div>

              {/* Elementos del ticket */}
              {ticket.ticket_elementos &&
                ticket.ticket_elementos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Elementos incluidos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ticket.ticket_elementos.map((item, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {item.elemento?.serie || "N/A"} (x{item.cantidad})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detalles del Ticket #{selectedTicket?.numero_ticket}
            </DialogTitle>
            <DialogDescription>
              Información completa del ticket de préstamo
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Información general */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Número de Ticket
                      </label>
                      <p className="font-medium">
                        {selectedTicket.numero_ticket}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tipo
                      </label>
                      <div className="mt-1">
                        {getTipoBadge(selectedTicket.tipo)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Fecha de Movimiento
                      </label>
                      <p className="font-medium">
                        {formatDate(selectedTicket.fecha_movimiento)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Fecha Estimada de Devolución
                      </label>
                      <p className="font-medium">
                        {formatDate(selectedTicket.fecha_estimada_devolucion)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dependencia de Entrega
                      </label>
                      <p className="font-medium">
                        {selectedTicket.dependencia_entrega}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dependencia que Recibe
                      </label>
                      <p className="font-medium">
                        {selectedTicket.dependencia_recibe}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Motivo
                      </label>
                      <p className="font-medium">{selectedTicket.motivo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Número de Orden
                      </label>
                      <p className="font-medium">
                        {selectedTicket.orden_numero}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Elementos del ticket */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Elementos del Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Elemento</TableHead>
                          <TableHead>Serie</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTicket.ticket_elementos?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.elemento?.serie || "N/A"}
                                </p>
                                {item.elemento?.marca &&
                                  item.elemento?.modelo && (
                                    <p className="text-sm text-muted-foreground">
                                      {item.elemento.marca}{" "}
                                      {item.elemento.modelo}
                                    </p>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.elemento?.serie || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.elemento?.categoria?.nombre || "N/A"}
                                </p>
                                {item.elemento?.subcategoria && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.elemento.subcategoria.nombre}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.cantidad}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
