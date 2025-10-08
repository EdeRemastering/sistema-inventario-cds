"use client";

import { listCategorias } from "../../../modules/categorias/services";
import {
  actionCreateCategoria,
  actionDeleteCategoria,
  actionUpdateCategoria,
} from "../../../modules/categorias/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { CategoriaForm } from "../../../components/categorias/categoria-form";
import { CategoriaRow } from "../../../components/categorias/categoria-row";
import { useEffect, useState } from "react";

// Handlers para las acciones de categorías
async function handleCreateCategoria(data: {
  nombre: string;
  descripcion?: string;
  estado: string;
}) {
  const formData = new FormData();
  formData.append("nombre", data.nombre);
  if (data.descripcion) formData.append("descripcion", data.descripcion);
  formData.append("estado", data.estado);

  await actionCreateCategoria(formData);
}

async function handleUpdateCategoria(data: {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}) {
  const formData = new FormData();
  formData.append("id", String(data.id));
  formData.append("nombre", data.nombre);
  if (data.descripcion) formData.append("descripcion", data.descripcion);
  formData.append("estado", data.estado);

  await actionUpdateCategoria(formData);
}

async function handleDeleteCategoria(id: number) {
  await actionDeleteCategoria(id);
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Array<{
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await listCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error fetching categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCreate = async (data: {
    nombre: string;
    descripcion?: string;
    estado: string;
  }) => {
    await handleCreateCategoria(data);
    // Refetch categorias after creation
    const updatedCategorias = await listCategorias();
    setCategorias(updatedCategorias);
  };

  const handleUpdate = async (data: {
    id: number;
    nombre: string;
    descripcion?: string;
    estado: string;
  }) => {
    await handleUpdateCategoria(data);
    // Refetch categorias after update
    const updatedCategorias = await listCategorias();
    setCategorias(updatedCategorias);
  };

  const handleDelete = async (id: number) => {
    await handleDeleteCategoria(id);
    // Refetch categorias after deletion
    const updatedCategorias = await listCategorias();
    setCategorias(updatedCategorias);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <Card>
        <CardHeader>
          <CategoriaForm action={handleCreate} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categorias.map((c) => (
              <CategoriaRow
                key={c.id}
                id={c.id}
                nombre={c.nombre}
                descripcion={c.descripcion ?? ""}
                estado={c.estado}
                onUpdate={handleUpdate}
                onDelete={() => handleDelete(c.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
