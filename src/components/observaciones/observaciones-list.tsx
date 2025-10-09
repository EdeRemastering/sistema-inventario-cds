"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { ObservacionUpsertDialog } from "./observacion-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Observacion } from "../../modules/observaciones/types";
import type { Elemento } from "../../modules/elementos/types";

type ObservacionesListProps = {
  observaciones: Observacion[];
  elementos: Elemento[];
  onCreateObservacion: (formData: FormData) => Promise<void>;
  onUpdateObservacion: (formData: FormData) => Promise<void>;
  onDeleteObservacion: (id: number) => Promise<void>;
};

export function ObservacionesList({
  observaciones,
  elementos,
  onCreateObservacion,
  onUpdateObservacion,
  onDeleteObservacion,
}: ObservacionesListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: observaciones,
      searchFields: ["descripcion"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Observaciones</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar observaciones..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <ObservacionUpsertDialog
              create
              serverAction={onCreateObservacion}
              elementos={elementos}
            />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay observaciones registradas"
                  : `No se encontraron observaciones que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primera observación para documentar el estado de los elementos."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((observacion) => (
                <div
                  key={observacion.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{observacion.descripcion}</div>
                    <div className="text-muted-foreground">
                      {new Date(
                        observacion.fecha_observacion
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <ObservacionUpsertDialog
                      create={false}
                      serverAction={onUpdateObservacion}
                      elementos={elementos}
                      defaultValues={{
                        elemento_id: String(observacion.elemento_id),
                        fecha_observacion: new Date(
                          observacion.fecha_observacion
                        )
                          .toISOString()
                          .slice(0, 10),
                        descripcion: observacion.descripcion,
                      }}
                      hiddenFields={{ id: observacion.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteObservacion(observacion.id);
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
