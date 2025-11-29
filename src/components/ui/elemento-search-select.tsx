"use client";

import { useState, useMemo } from "react";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Search } from "lucide-react";

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  codigo_equipo?: string | null;
  [key: string]: unknown; // Permitir propiedades adicionales
};

type Props = {
  elementos: ElementoOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
};

export function ElementoSearchSelect({
  elementos,
  value,
  onValueChange,
  placeholder = "Buscar por ID, código o serie...",
  label,
  disabled = false,
  error,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar elementos por búsqueda
  const filteredElementos = useMemo(() => {
    if (!searchQuery.trim()) {
      return elementos;
    }

    const query = searchQuery.toLowerCase().trim();
    return elementos.filter((elemento) => {
      const idMatch = elemento.id.toString().includes(query);
      const serieMatch = elemento.serie.toLowerCase().includes(query);
      const codigoMatch = elemento.codigo_equipo?.toLowerCase().includes(query) || false;
      const marcaMatch = elemento.marca?.toLowerCase().includes(query) || false;
      const modeloMatch = elemento.modelo?.toLowerCase().includes(query) || false;
      
      return idMatch || serieMatch || codigoMatch || marcaMatch || modeloMatch;
    });
  }, [elementos, searchQuery]);

  // Si hay un valor seleccionado, encontrar el elemento para mostrar
  const selectedElemento = elementos.find((e) => e.id.toString() === value);

  return (
    <div className="grid gap-1">
      {label && <Label>{label}</Label>}
      <div className="space-y-2">
        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
        
        {/* Select de elementos filtrados */}
        <Select
          value={value || undefined}
          onValueChange={(val) => {
            onValueChange(val);
            setSearchQuery(""); // Limpiar búsqueda al seleccionar
          }}
          disabled={disabled || elementos.length === 0}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                elementos.length === 0 
                  ? "No hay elementos disponibles" 
                  : "Selecciona elemento"
              }
            >
              {selectedElemento
                ? `${selectedElemento.serie} - ${selectedElemento.marca || ""} ${selectedElemento.modelo || ""}`.trim()
                : elementos.length === 0 
                  ? "No hay elementos disponibles" 
                  : "Selecciona elemento"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {elementos.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                <p className="font-medium">No hay elementos disponibles</p>
                <p className="text-xs mt-1">
                  Crea elementos en el inventario para poder seleccionarlos aquí
                </p>
              </div>
            ) : filteredElementos.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                <p className="font-medium">No se encontraron elementos</p>
                <p className="text-xs mt-1">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : (
              filteredElementos.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {e.serie} - {e.marca || ""} {e.modelo || ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {e.id} {e.codigo_equipo ? `| Código: ${e.codigo_equipo}` : ""}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

