"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { DeleteButton } from "../delete-button";
import type { ReporteGenerado } from "../../modules/reportes_generados/types";

type ReportesListProps = {
  reportes: ReporteGenerado[];
  onDeleteReporte: (id: number) => Promise<void>;
};

export function ReportesList({ reportes, onDeleteReporte }: ReportesListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: reportes,
      searchFields: ["tipo_reporte", "nombre_archivo"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Historial de Reportes</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar reportes..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            {/* Botón de crear removido - solo historial */}
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay reportes generados"
                  : `No se encontraron reportes que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza generando tu primer reporte para analizar los datos del sistema."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredData.map((reporte) => (
                <div
                  key={reporte.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{reporte.tipo_reporte}</div>
                    <div className="text-muted-foreground">
                      {reporte.nombre_archivo}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {reporte.fecha_generacion
                        ? new Date(
                            reporte.fecha_generacion
                          ).toLocaleDateString()
                        : "Sin fecha"}
                    </div>
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteReporte(reporte.id);
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
