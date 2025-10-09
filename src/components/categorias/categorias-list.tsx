"use client";

import { FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { CategoriaUpsertDialog } from "./categoria-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Categoria } from "../../modules/categorias/types";

type CategoriasListProps = {
  categorias: Categoria[];
  onCreateCategoria: (formData: FormData) => Promise<void>;
  onUpdateCategoria: (formData: FormData) => Promise<void>;
  onDeleteCategoria: (id: number) => Promise<void>;
};

export function CategoriasList({
  categorias,
  onCreateCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
}: CategoriasListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: categorias,
      searchFields: ["nombre", "descripcion"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar categorías..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <CategoriaUpsertDialog create serverAction={onCreateCategoria} />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<FolderTree className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay categorías registradas"
                  : `No se encontraron categorías que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primera categoría para organizar los elementos del inventario."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{categoria.nombre}</div>
                    <div className="text-muted-foreground">
                      {categoria.descripcion ?? ""}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <CategoriaUpsertDialog
                      create={false}
                      serverAction={onUpdateCategoria}
                      defaultValues={{
                        nombre: categoria.nombre,
                        descripcion: categoria.descripcion ?? "",
                        estado: categoria.estado as "activo" | "inactivo",
                      }}
                      hiddenFields={{ id: categoria.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteCategoria(categoria.id);
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
