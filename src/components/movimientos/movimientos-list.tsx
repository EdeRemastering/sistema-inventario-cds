"use client";

import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { MovimientoUpsertDialog } from "./movimiento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { SignatureDisplay } from "../ui/signature-display";
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
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: movimientos,
      searchFields: [
        "numero_ticket",
        "orden_numero",
        "dependencia_entrega",
        "dependencia_recibe",
        "motivo",
      ],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Movimientos</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar movimientos..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <MovimientoUpsertDialog
              create
              serverAction={onCreateMovimiento}
              elementos={elementos}
            />
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
            <div className="space-y-3">
              {filteredData.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm flex-1">
                    <div className="font-medium">
                      {movimiento.numero_ticket}
                    </div>
                    <div className="text-muted-foreground">
                      Cantidad: {movimiento.cantidad} | {movimiento.dependencia_entrega} → {movimiento.dependencia_recibe}
                    </div>
                    <div className="flex gap-4 mt-2">
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
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <MovimientoUpsertDialog
                      create={false}
                      serverAction={onUpdateMovimiento}
                      elementos={elementos}
                      defaultValues={{
                        elemento_id: String(movimiento.elemento_id),
                        cantidad: String(movimiento.cantidad),
                        orden_numero: movimiento.orden_numero,
                        fecha_movimiento: new Date(movimiento.fecha_movimiento)
                          .toISOString()
                          .slice(0, 16),
                        dependencia_entrega: movimiento.dependencia_entrega,
                        firma_funcionario_entrega:
                          movimiento.firma_funcionario_entrega ?? "",
                        cargo_funcionario_entrega:
                          movimiento.cargo_funcionario_entrega ?? "",
                        dependencia_recibe: movimiento.dependencia_recibe,
                        firma_funcionario_recibe: movimiento.firma_funcionario_recibe ?? "",
                        cargo_funcionario_recibe:
                          movimiento.cargo_funcionario_recibe ?? "",
                        motivo: movimiento.motivo,
                        fecha_estimada_devolucion: new Date(
                          movimiento.fecha_estimada_devolucion
                        )
                          .toISOString()
                          .slice(0, 10),
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
