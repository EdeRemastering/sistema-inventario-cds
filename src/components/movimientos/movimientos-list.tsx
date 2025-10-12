"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { MovimientoUpsertDialog } from "./movimiento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { SignatureDisplay } from "../ui/signature-display";
import { MovimientosFilters, MovimientoFilters } from "./movimientos-filters";
import type { Movimiento } from "../../modules/movimientos/types";
import type { Elemento } from "../../modules/elementos/types";

type MovimientosListProps = {
  movimientos: Movimiento[];
  elementos: Elemento[];
  onCreateMovimiento: (formData: FormData) => Promise<void>;
  onUpdateMovimiento: (formData: FormData) => Promise<void>;
  onDeleteMovimiento: (id: number) => Promise<void>;
};

export function MovimientosList({
  movimientos,
  elementos,
  onCreateMovimiento,
  onUpdateMovimiento,
  onDeleteMovimiento,
}: MovimientosListProps) {
  const [filters, setFilters] = useState<MovimientoFilters>({
    numeroTicket: "",
    dependenciaEntrega: "",
    dependenciaRecibe: "",
    fechaDesde: null,
    fechaHasta: null,
    tipo: "TODOS",
    elementoSerie: "",
    elementoNombre: "",
    funcionarioEntrega: "",
    funcionarioRecibe: "",
    estado: "TODOS",
    ordenNumero: "",
    motivo: "",
  });

  // Función para filtrar movimientos según los filtros avanzados
  const filterMovimientos = (movimientos: Movimiento[]) => {
    return movimientos.filter((movimiento) => {
      // Filtro por número de ticket
      if (
        filters.numeroTicket &&
        !movimiento.numero_ticket
          ?.toLowerCase()
          .includes(filters.numeroTicket.toLowerCase())
      ) {
        return false;
      }

      // Filtro por dependencia de entrega
      if (
        filters.dependenciaEntrega &&
        !movimiento.dependencia_entrega
          ?.toLowerCase()
          .includes(filters.dependenciaEntrega.toLowerCase())
      ) {
        return false;
      }

      // Filtro por dependencia que recibe
      if (
        filters.dependenciaRecibe &&
        !movimiento.dependencia_recibe
          ?.toLowerCase()
          .includes(filters.dependenciaRecibe.toLowerCase())
      ) {
        return false;
      }

      // Filtro por tipo
      if (filters.tipo !== "TODOS" && movimiento.tipo !== filters.tipo) {
        return false;
      }

      // Filtro por serie del elemento
      if (
        filters.elementoSerie &&
        !movimiento.elemento?.serie
          ?.toLowerCase()
          .includes(filters.elementoSerie.toLowerCase())
      ) {
        return false;
      }

      // Filtro por nombre del elemento
      if (
        filters.elementoNombre &&
        !movimiento.elemento?.marca
          ?.toLowerCase()
          .includes(filters.elementoNombre.toLowerCase()) &&
        !movimiento.elemento?.modelo
          ?.toLowerCase()
          .includes(filters.elementoNombre.toLowerCase())
      ) {
        return false;
      }

      // Filtro por funcionario que entrega
      if (
        filters.funcionarioEntrega &&
        !movimiento.firma_funcionario_entrega
          ?.toLowerCase()
          .includes(filters.funcionarioEntrega.toLowerCase())
      ) {
        return false;
      }

      // Filtro por funcionario que recibe
      if (
        filters.funcionarioRecibe &&
        !movimiento.firma_funcionario_recibe
          ?.toLowerCase()
          .includes(filters.funcionarioRecibe.toLowerCase())
      ) {
        return false;
      }

      // Filtro por orden número
      if (
        filters.ordenNumero &&
        !movimiento.orden_numero
          ?.toLowerCase()
          .includes(filters.ordenNumero.toLowerCase())
      ) {
        return false;
      }

      // Filtro por motivo
      if (
        filters.motivo &&
        !movimiento.motivo?.toLowerCase().includes(filters.motivo.toLowerCase())
      ) {
        return false;
      }

      // Filtro por fechas
      if (filters.fechaDesde) {
        const fechaMovimiento = new Date(movimiento.fecha_movimiento);
        if (fechaMovimiento < filters.fechaDesde) {
          return false;
        }
      }

      if (filters.fechaHasta) {
        const fechaMovimiento = new Date(movimiento.fecha_movimiento);
        if (fechaMovimiento > filters.fechaHasta) {
          return false;
        }
      }

      // Filtro por estado
      if (filters.estado !== "TODOS") {
        switch (filters.estado) {
          case "ACTIVO":
            return !movimiento.fecha_real_devolucion;
          case "ENTREGADO":
            return !!movimiento.fecha_real_devolucion;
          default:
            return true;
        }
      }

      return true;
    });
  };

  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: filterMovimientos(movimientos),
      searchFields: [
        "numero_ticket",
        "orden_numero",
        "dependencia_entrega",
        "dependencia_recibe",
        "motivo",
      ],
    });

  const handleFiltersChange = (newFilters: MovimientoFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      numeroTicket: "",
      dependenciaEntrega: "",
      dependenciaRecibe: "",
      fechaDesde: null,
      fechaHasta: null,
      tipo: "TODOS",
      elementoSerie: "",
      elementoNombre: "",
      funcionarioEntrega: "",
      funcionarioRecibe: "",
      estado: "TODOS",
      ordenNumero: "",
      motivo: "",
    });
  };

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Historial de Movimientos</h1>
      </div>

      <MovimientosFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SearchInput
              placeholder="Buscar en movimientos filtrados..."
              onSearch={handleSearch}
              className="w-full sm:max-w-sm"
            />
            {/* <div className="flex justify-end">
              <MovimientoUpsertDialog
                create
                serverAction={onCreateMovimiento}
                elementos={elementos}
              />
            </div> */}
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay movimientos registrados"
                  : `No se encontraron movimientos que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primer movimiento para gestionar el flujo de elementos."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredData.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="rounded-lg border bg-card p-4 space-y-4"
                >
                  {/* Header con información principal */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-semibold text-base">
                          {movimiento.numero_ticket}
                        </span>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          Cantidad: {movimiento.cantidad}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="font-medium">{movimiento.dependencia_entrega}</span>
                          <span className="hidden sm:inline">→</span>
                          <span className="sm:hidden">↓</span>
                          <span className="font-medium">{movimiento.dependencia_recibe}</span>
                        </div>
                        {movimiento.orden_numero && (
                          <div className="mt-1">
                            Orden: {movimiento.orden_numero}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botones de acción en móvil */}
                    <div className="flex sm:hidden gap-2">
                      <MovimientoUpsertDialog
                        create={false}
                        serverAction={onUpdateMovimiento}
                        elementos={elementos}
                        defaultValues={{
                          elemento_id: String(movimiento.elemento_id),
                          cantidad: String(movimiento.cantidad),
                          orden_numero: movimiento.orden_numero,
                          fecha_movimiento: new Date(movimiento.fecha_movimiento),
                          dependencia_entrega: movimiento.dependencia_entrega,
                          firma_funcionario_entrega:
                            movimiento.firma_funcionario_entrega ?? "",
                          cargo_funcionario_entrega:
                            movimiento.cargo_funcionario_entrega ?? "",
                          dependencia_recibe: movimiento.dependencia_recibe,
                          firma_funcionario_recibe:
                            movimiento.firma_funcionario_recibe ?? "",
                          cargo_funcionario_recibe:
                            movimiento.cargo_funcionario_recibe ?? "",
                          motivo: movimiento.motivo,
                          fecha_estimada_devolucion: new Date(
                            movimiento.fecha_estimada_devolucion
                          ),
                          numero_ticket: movimiento.numero_ticket,
                          observaciones_entrega:
                            movimiento.observaciones_entrega ?? "",
                        }}
                        hiddenFields={{ id: movimiento.id }}
                      />
                      <DeleteButton
                        onConfirm={async () => {
                          await onDeleteMovimiento(movimiento.id);
                        }}
                      >
                        Eliminar
                      </DeleteButton>
                    </div>
                  </div>

                  {/* Firmas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SignatureDisplay
                      signatureUrl={movimiento.firma_funcionario_entrega}
                      label="Firma Entrega"
                      className="text-xs"
                    />
                    <SignatureDisplay
                      signatureUrl={movimiento.firma_funcionario_recibe}
                      label="Firma Recibe"
                      className="text-xs"
                    />
                  </div>

                  {/* Información adicional y botones en desktop */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground space-y-1">
                      {movimiento.motivo && (
                        <div>Motivo: {movimiento.motivo}</div>
                      )}
                      <div>
                        Fecha: {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MovimientoUpsertDialog
                        create={false}
                        serverAction={onUpdateMovimiento}
                        elementos={elementos}
                        defaultValues={{
                          elemento_id: String(movimiento.elemento_id),
                          cantidad: String(movimiento.cantidad),
                          orden_numero: movimiento.orden_numero,
                          fecha_movimiento: new Date(movimiento.fecha_movimiento),
                          dependencia_entrega: movimiento.dependencia_entrega,
                          firma_funcionario_entrega:
                            movimiento.firma_funcionario_entrega ?? "",
                          cargo_funcionario_entrega:
                            movimiento.cargo_funcionario_entrega ?? "",
                          dependencia_recibe: movimiento.dependencia_recibe,
                          firma_funcionario_recibe:
                            movimiento.firma_funcionario_recibe ?? "",
                          cargo_funcionario_recibe:
                            movimiento.cargo_funcionario_recibe ?? "",
                          motivo: movimiento.motivo,
                          fecha_estimada_devolucion: new Date(
                            movimiento.fecha_estimada_devolucion
                          ),
                          numero_ticket: movimiento.numero_ticket,
                          observaciones_entrega:
                            movimiento.observaciones_entrega ?? "",
                        }}
                        hiddenFields={{ id: movimiento.id }}
                      />
                      <DeleteButton
                        onConfirm={async () => {
                          await onDeleteMovimiento(movimiento.id);
                        }}
                      >
                        Eliminar
                      </DeleteButton>
                    </div>
                  </div>

                  {/* Información adicional en móvil */}
                  <div className="sm:hidden text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    {movimiento.motivo && (
                      <div>Motivo: {movimiento.motivo}</div>
                    )}
                    <div>
                      Fecha: {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                    </div>
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
