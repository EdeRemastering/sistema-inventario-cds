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
import { ElementoForm } from "../../../components/elementos/elemento-form";
import { ElementoRow } from "../../../components/elementos/elemento-row";
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

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      try {
        await actionDeleteElemento(id);
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error("Error deleting elemento:", error);
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
          <ElementoForm
            action={handleCreate}
            categorias={categorias}
            subcategorias={subcategorias}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elementos.map((e) => (
              <ElementoRow
                key={e.id}
                elemento={e}
                categorias={categorias}
                subcategorias={subcategorias}
                onUpdate={handleUpdate}
                onDelete={(formData) => {
                  const id = Number(formData.get("id"));
                  return handleDelete(id);
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
