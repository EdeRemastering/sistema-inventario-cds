"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { UsuarioUpsertDialog } from "./usuario-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Usuario } from "../../modules/usuario/types";

type UsuariosListProps = {
  usuarios: Usuario[];
  onCreateUsuario: (formData: FormData) => Promise<void>;
  onUpdateUsuario: (formData: FormData) => Promise<void>;
  onDeleteUsuario: (id: number) => Promise<void>;
};

export function UsuariosList({
  usuarios,
  onCreateUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
}: UsuariosListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: usuarios,
      searchFields: ["username", "nombre", "rol"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar usuarios..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <UsuarioUpsertDialog create serverAction={onCreateUsuario} />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay usuarios registrados"
                  : `No se encontraron usuarios que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primer usuario para acceder al sistema."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center gap-3 rounded border p-3"
                >
                  <span className="font-medium">{usuario.nombre}</span>
                  <span className="text-muted-foreground">@{usuario.username}</span>
                  <span className="text-xs rounded bg-secondary px-2 py-0.5 ml-2">
                    {usuario.rol}
                  </span>
                  {usuario.activo === false && (
                    <span className="text-xs rounded bg-destructive/10 text-destructive px-2 py-0.5">
                      Inactivo
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <UsuarioUpsertDialog
                      create={false}
                      serverAction={onUpdateUsuario}
                      defaultValues={{
                        nombre: usuario.nombre,
                        username: usuario.username,
                        rol: usuario.rol as "administrador" | "usuario",
                        activo: usuario.activo ?? true,
                      }}
                      hiddenFields={{ id: usuario.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteUsuario(usuario.id);
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
