"use client";

import { listElementos } from "../../../modules/elementos/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
import {
  actionCreateElemento,
  actionDeleteElemento,
  actionUpdateElemento,
} from "../../../modules/elementos/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ElementoUpsertDialog } from "../../../components/elementos/elemento-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { useEffect, useState, useTransition } from "react";

// Función para obtener datos
async function fetchData() {
  const [elementos, categorias, subcategorias] = await Promise.all([
    listElementos(),
    listCategorias(),
    listSubcategorias(),
  ]);
  return { elementos, categorias, subcategorias };
}

export default function ElementosPage() {
  const [data, setData] = useState<{
    elementos: Array<{
      id: number;
      categoria_id: number;
      subcategoria_id: number | null;
      serie: string;
      marca: string | null;
      modelo: string | null;
      cantidad: number;
    }>;
    categorias: Array<{ id: number; nombre: string }>;
    subcategorias: Array<{ id: number; nombre: string }>;
  }>({
    elementos: [],
    categorias: [],
    subcategorias: [],
  });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await actionCreateElemento(formData);
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error("Error creating elemento:", error);
      }
    });
  };

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await actionUpdateElemento(formData);
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error("Error updating elemento:", error);
      }
    });
  };

  if (loading || isPending) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Elementos</h1>
        <div className="animate-pulse">
          <div className="h-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  const { elementos, categorias, subcategorias } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Elementos</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <ElementoUpsertDialog
              create
              serverAction={handleCreate}
              categorias={categorias}
              subcategorias={subcategorias}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elementos.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{e.serie}</div>
                  <div className="text-muted-foreground">
                    Cantidad: {e.cantidad}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ElementoUpsertDialog
                    create={false}
                    serverAction={handleUpdate}
                    categorias={categorias}
                    subcategorias={subcategorias}
                    defaultValues={{
                      categoria_id: String(e.categoria_id),
                      subcategoria_id: e.subcategoria_id
                        ? String(e.subcategoria_id)
                        : "",
                      serie: e.serie,
                      marca: e.marca ?? "",
                      modelo: e.modelo ?? "",
                      cantidad: String(e.cantidad),
                    }}
                    hiddenFields={{ id: e.id }}
                  />
                  <DeleteButton
                    action={async () => {
                      await actionDeleteElemento(e.id);
                    }}
                    fields={{ id: e.id }}
                  >
                    Eliminar
                  </DeleteButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
