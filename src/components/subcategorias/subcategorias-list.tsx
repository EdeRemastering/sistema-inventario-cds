"use client";

import { Boxes } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { SubcategoriaUpsertDialog } from "./subcategoria-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Subcategoria } from "../../modules/subcategorias/types";
import type { Categoria } from "../../modules/categorias/types";

type SubcategoriasListProps = {
  subcategorias: Subcategoria[];
  categorias: Categoria[];
  onCreateSubcategoria: (formData: FormData) => Promise<void>;
  onUpdateSubcategoria: (formData: FormData) => Promise<void>;
  onDeleteSubcategoria: (id: number) => Promise<void>;
};

export function SubcategoriasList({
  subcategorias,
  categorias,
  onCreateSubcategoria,
  onUpdateSubcategoria,
  onDeleteSubcategoria,
}: SubcategoriasListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: subcategorias,
      searchFields: ["nombre", "descripcion"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Subcategorías</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar subcategorías..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <SubcategoriaUpsertDialog
              create
              serverAction={onCreateSubcategoria}
              categorias={categorias}
            />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<Boxes className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay subcategorías registradas"
                  : `No se encontraron subcategorías que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primera subcategoría para organizar mejor los elementos."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((subcategoria) => (
                <div
                  key={subcategoria.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{subcategoria.nombre}</div>
                    <div className="text-muted-foreground">
                      {subcategoria.descripcion ?? ""}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <SubcategoriaUpsertDialog
                      create={false}
                      serverAction={onUpdateSubcategoria}
                      categorias={categorias}
                      defaultValues={{
                        nombre: subcategoria.nombre,
                        descripcion: subcategoria.descripcion ?? "",
                        categoria_id: String(subcategoria.categoria_id),
                      }}
                      hiddenFields={{ id: subcategoria.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteSubcategoria(subcategoria.id);
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
