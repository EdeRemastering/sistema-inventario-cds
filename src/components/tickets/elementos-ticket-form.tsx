"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ElementoSearchSelectV2 } from "../ui/elemento-search-select-v2";
import { Trash2, Plus } from "lucide-react";
import { ElementoFormData } from "@/modules/tickets_guardados/types";
import { toast } from "sonner";

interface ElementosTicketFormProps {
  elementos: {
    id: number;
    serie: string;
    marca?: string | null;
    modelo?: string | null;
    categoria: {
      nombre: string;
    };
    subcategoria?: {
      nombre: string;
    } | null;
  }[];
  elementosSeleccionados: ElementoFormData[];
  onElementosChange: (elementos: ElementoFormData[]) => void;
  error?: string;
}

export function ElementosTicketForm({
  elementos,
  elementosSeleccionados,
  onElementosChange,
  error,
}: ElementosTicketFormProps) {
  const [nuevoElemento, setNuevoElemento] = useState<ElementoFormData>({
    elemento_id: 0,
    cantidad: 1,
    elemento_nombre: "",
    serie: "",
    marca_modelo: "",
  });

  const agregarElemento = () => {
    if (nuevoElemento.elemento_id && nuevoElemento.cantidad > 0) {
      // Verificar si el elemento ya existe
      const elementoExistenteIndex = elementosSeleccionados.findIndex(
        (e) => e.elemento_id === nuevoElemento.elemento_id
      );

      if (elementoExistenteIndex !== -1) {
        // Si el elemento ya existe, sumar la cantidad
        const nuevosElementos = [...elementosSeleccionados];
        const cantidadAnterior =
          nuevosElementos[elementoExistenteIndex].cantidad;
        nuevosElementos[elementoExistenteIndex].cantidad +=
          nuevoElemento.cantidad;
        onElementosChange(nuevosElementos);

        // Mostrar mensaje de confirmación
        toast.success(
          `Cantidad actualizada: ${cantidadAnterior} + ${nuevoElemento.cantidad} = ${nuevosElementos[elementoExistenteIndex].cantidad}`,
          {
            duration: 3000,
          }
        );
      } else {
        // Si es un elemento nuevo, agregarlo a la lista
        onElementosChange([...elementosSeleccionados, { ...nuevoElemento }]);
        toast.success(
          `Elemento agregado (cantidad: ${nuevoElemento.cantidad})`,
          {
            duration: 2000,
          }
        );
      }

      // Limpiar el formulario después de agregar
      setNuevoElemento({
        elemento_id: 0,
        cantidad: 1,
        elemento_nombre: "",
        serie: "",
        marca_modelo: "",
      });
    }
  };

  const eliminarElemento = (index: number) => {
    const nuevosElementos = elementosSeleccionados.filter(
      (_, i) => i !== index
    );
    onElementosChange(nuevosElementos);
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    const nuevosElementos = [...elementosSeleccionados];
    nuevosElementos[index].cantidad = cantidad;
    onElementosChange(nuevosElementos);
  };

  const obtenerNombreElemento = (elementoId: number) => {
    const elemento = elementos.find((e) => e.id === elementoId);
    if (elemento) {
      return `${elemento.categoria.nombre}${
        elemento.subcategoria ? ` - ${elemento.subcategoria.nombre}` : ""
      }`;
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Elementos del Ticket</Label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Formulario para agregar nuevo elemento */}
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <h4 className="font-medium text-sm">Agregar Elemento</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <ElementoSearchSelectV2
              elementos={elementos}
              value={nuevoElemento.elemento_id}
              onValueChange={(value) => {
                setNuevoElemento((prev) => ({
                  ...prev,
                  elemento_id: value || 0,
                }));
                if (value) {
                  const elemento = elementos.find((e) => e.id === value);
                  if (elemento) {
                    setNuevoElemento((prev) => ({
                      ...prev,
                      elemento_id: value,
                      elemento_nombre: `${elemento.categoria.nombre}${
                        elemento.subcategoria
                          ? ` - ${elemento.subcategoria.nombre}`
                          : ""
                      }`,
                      serie: elemento.serie,
                      marca_modelo: `${elemento.marca || ""} ${
                        elemento.modelo || ""
                      }`.trim(),
                    }));
                  }
                }
              }}
              label="Elemento"
              placeholder="Buscar elemento..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad-nuevo">Cantidad</Label>
            <Input
              id="cantidad-nuevo"
              type="number"
              min="1"
              value={nuevoElemento.cantidad}
              onChange={(e) =>
                setNuevoElemento((prev) => ({
                  ...prev,
                  cantidad: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={agregarElemento}
          disabled={!nuevoElemento.elemento_id || nuevoElemento.cantidad < 1}
          className="w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Elemento
        </Button>
      </div>

      {/* Lista de elementos agregados */}
      {elementosSeleccionados.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">
            Elementos Agregados ({elementosSeleccionados.length})
          </h4>

          <div className="space-y-2">
            {elementosSeleccionados.map((elemento, index) => (
              <div
                key={`${elemento.elemento_id}-${index}`}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">Elemento</Label>
                    <p className="text-sm font-medium">
                      {elemento.elemento_nombre ||
                        obtenerNombreElemento(elemento.elemento_id)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Serie</Label>
                    <p className="text-sm">{elemento.serie}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={elemento.cantidad}
                      onChange={(e) =>
                        actualizarCantidad(index, parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarElemento(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {elementosSeleccionados.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay elementos agregados al ticket</p>
          <p className="text-sm">Agrega al menos un elemento para continuar</p>
        </div>
      )}
    </div>
  );
}
