"use client";

import { ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { LogUpsertDialog } from "./log-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Log } from "../../modules/logs/types";
import type { Usuario } from "../../modules/usuario/types";

type LogsListProps = {
  logs: Log[];
  usuarios: Usuario[];
  onCreateLog: (formData: FormData) => Promise<void>;
  onUpdateLog: (formData: FormData) => Promise<void>;
  onDeleteLog: (id: number) => Promise<void>;
};

export function LogsList({
  logs,
  usuarios,
  onCreateLog,
  onUpdateLog,
  onDeleteLog,
}: LogsListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: logs,
      searchFields: ["accion", "detalles"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logs del Sistema</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar logs..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <LogUpsertDialog
              create
              serverAction={onCreateLog}
              usuarios={usuarios}
            />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<ListChecks className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay logs registrados"
                  : `No se encontraron logs que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Los logs del sistema aparecerán aquí cuando se realicen acciones."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{log.accion}</div>
                    <div className="text-muted-foreground">
                      {log.detalles ?? ""}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <LogUpsertDialog
                      create={false}
                      serverAction={onUpdateLog}
                      usuarios={usuarios}
                      defaultValues={{
                        usuario_id: String(log.usuario_id),
                        accion: log.accion,
                        descripcion: log.detalles ?? "",
                      }}
                      hiddenFields={{ id: log.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteLog(log.id);
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
