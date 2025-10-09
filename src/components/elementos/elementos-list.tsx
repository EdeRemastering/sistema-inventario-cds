"use client";

import { Package2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { useSearch } from "../../hooks/use-search";
import { ElementoUpsertDialog } from "./elemento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Elemento } from "../../modules/elementos/types";
import type { Categoria } from "../../modules/categorias/types";
import type { Subcategoria } from "../../modules/subcategorias/types";

type ElementosListProps = {
  elementos: Elemento[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  onCreateElemento: (formData: FormData) => Promise<void>;
  onUpdateElemento: (formData: FormData) => Promise<void>;
  onDeleteElemento: (id: number) => Promise<void>;
};

export function ElementosList({
  elementos,
  categorias,
  subcategorias,
  onCreateElemento,
  onUpdateElemento,
  onDeleteElemento,
}: ElementosListProps) {
  const { searchQuery, filteredData, handleSearch, hasResults, hasData } =
    useSearch({
      data: elementos,
      searchFields: ["serie", "marca", "modelo"],
    });

  const showEmptyState = !hasData || !hasResults;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Elementos</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <SearchInput
              placeholder="Buscar elementos..."
              onSearch={handleSearch}
              className="max-w-sm"
            />
            <ElementoUpsertDialog
              create
              serverAction={onCreateElemento}
              categorias={categorias}
              subcategorias={subcategorias}
            />
          </div>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <EmptyState
              icon={<Package2 className="h-8 w-8 text-muted-foreground" />}
              title={
                !hasData
                  ? "No hay elementos registrados"
                  : `No se encontraron elementos que coincidan con "${searchQuery}"`
              }
              description={
                !hasData
                  ? "Comienza creando tu primer elemento para gestionar el inventario."
                  : "Intenta con un término de búsqueda diferente o más general."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredData.map((elemento) => (
                <div
                  key={elemento.id}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{elemento.serie}</div>
                    <div className="text-muted-foreground">
                      Cantidad: {elemento.cantidad}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <ElementoUpsertDialog
                      create={false}
                      serverAction={onUpdateElemento}
                      categorias={categorias}
                      subcategorias={subcategorias}
                      defaultValues={{
                        categoria_id: String(elemento.categoria_id),
                        subcategoria_id: elemento.subcategoria_id
                          ? String(elemento.subcategoria_id)
                          : "",
                        serie: elemento.serie,
                        marca: elemento.marca ?? "",
                        modelo: elemento.modelo ?? "",
                        cantidad: String(elemento.cantidad),
                      }}
                      hiddenFields={{ id: elemento.id }}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        await onDeleteElemento(elemento.id);
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
