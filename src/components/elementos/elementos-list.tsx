"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package2, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ElementoUpsertDialog } from "./elemento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { ElementoListItem } from "../../modules/elementos/services";
import type { Categoria } from "../../modules/categorias/types";
import type { Subcategoria } from "../../modules/subcategorias/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Sede } from "../../modules/sedes/types";

type PaginationInfo = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ElementosListProps = {
  elementos: ElementoListItem[];
  pagination: PaginationInfo;
  sedes: Sede[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  ubicaciones: Ubicacion[];
  onCreateElemento: (formData: FormData) => Promise<void>;
  onUpdateElemento: (formData: FormData) => Promise<void>;
  onDeleteElemento: (id: number) => Promise<void>;
};

export function ElementosList({
  elementos,
  pagination,
  sedes,
  categorias,
  subcategorias,
  ubicaciones,
  onCreateElemento,
  onUpdateElemento,
  onDeleteElemento,
}: ElementosListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      if (searchValue) params.set("search", searchValue);
      params.set("page", "1");
      router.push(`/elementos?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/elementos?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    setSearchValue("");
    startTransition(() => {
      router.push("/elementos");
    });
  };

  const showEmptyState = elementos.length === 0;
  const currentSearch = searchParams.get("search");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Elementos</h1>
        <span className="text-sm text-muted-foreground">
          {pagination.total.toLocaleString()} elementos totales
        </span>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por serie, marca o modelo..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
              {currentSearch && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Limpiar
                </Button>
              )}
            </form>
            <ElementoUpsertDialog
              create
              serverAction={onCreateElemento}
              sedes={sedes}
              categorias={categorias}
              subcategorias={subcategorias}
              ubicaciones={ubicaciones}
            />
          </div>
        </CardHeader>
        <CardContent className={isPending ? "opacity-50 pointer-events-none" : ""}>
          {showEmptyState ? (
            <EmptyState
              icon={<Package2 className="h-8 w-8 text-muted-foreground" />}
              title={
                currentSearch
                  ? `No se encontraron elementos que coincidan con "${currentSearch}"`
                  : "No hay elementos registrados"
              }
              description={
                currentSearch
                  ? "Intenta con un término de búsqueda diferente o más general."
                  : "Comienza creando tu primer elemento para gestionar el inventario."
              }
            />
          ) : (
            <div className="space-y-2">
              {elementos.map((elemento) => (
                <div
                  key={elemento.id}
                  className="flex items-center justify-between gap-3 rounded border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-sm flex-1 min-w-0">
                    <div className="font-medium truncate">{elemento.serie}</div>
                    <div className="text-muted-foreground text-xs">
                      {elemento.marca} {elemento.modelo} • Cantidad: {elemento.cantidad}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ElementoUpsertDialog
                      create={false}
                      serverAction={onUpdateElemento}
                      sedes={sedes}
                      categorias={categorias}
                      subcategorias={subcategorias}
                      ubicaciones={ubicaciones}
                      defaultValues={{
                        sede_id: elemento.ubicacion_rel?.sede?.id
                          ? String(elemento.ubicacion_rel.sede.id)
                          : "",
                        ubicacion_id: elemento.ubicacion_id
                          ? String(elemento.ubicacion_id)
                          : "",
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
        
        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm px-2">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isPending}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
