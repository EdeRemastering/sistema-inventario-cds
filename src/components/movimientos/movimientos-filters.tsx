"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";

export type MovimientoFilters = {
  numeroTicket: string;
  dependenciaEntrega: string;
  dependenciaRecibe: string;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  tipo: "TODOS" | "SALIDA" | "DEVOLUCION";
  // Nuevos filtros para historial completo
  elementoSerie: string;
  elementoNombre: string;
  funcionarioEntrega: string;
  funcionarioRecibe: string;
  estado: "TODOS" | "ACTIVO" | "DEVUELTO" | "VENCIDO";
  ordenNumero: string;
  motivo: string;
};

type MovimientosFiltersProps = {
  filters: MovimientoFilters;
  onFiltersChange: (filters: MovimientoFilters) => void;
  onClearFilters: () => void;
};

export function MovimientosFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: MovimientosFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (
    key: keyof MovimientoFilters,
    value: string | Date | null | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.numeroTicket ||
    filters.dependenciaEntrega ||
    filters.dependenciaRecibe ||
    filters.fechaDesde ||
    filters.fechaHasta ||
    filters.tipo !== "TODOS" ||
    filters.elementoSerie ||
    filters.elementoNombre ||
    filters.funcionarioEntrega ||
    filters.funcionarioRecibe ||
    filters.estado !== "TODOS" ||
    filters.ordenNumero ||
    filters.motivo;

  const clearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "Ocultar" : "Mostrar"} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {/* Fila 1: Número de Ticket y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroTicket">Número de Ticket</Label>
              <Input
                id="numeroTicket"
                placeholder="Ej: TICKET-2024-000001"
                value={filters.numeroTicket}
                onChange={(e) =>
                  handleFilterChange("numeroTicket", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimiento</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.tipo}
                onChange={(e) => handleFilterChange("tipo", e.target.value)}
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="SALIDA">Solo Salidas</option>
                <option value="DEVOLUCION">Solo Devoluciones</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Dependencias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dependenciaEntrega">Dependencia de Entrega</Label>
              <Input
                id="dependenciaEntrega"
                placeholder="Ej: Departamento de TI"
                value={filters.dependenciaEntrega}
                onChange={(e) =>
                  handleFilterChange("dependenciaEntrega", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dependenciaRecibe">Dependencia que Recibe</Label>
              <Input
                id="dependenciaRecibe"
                placeholder="Ej: Gerencia General"
                value={filters.dependenciaRecibe}
                onChange={(e) =>
                  handleFilterChange("dependenciaRecibe", e.target.value)
                }
              />
            </div>
          </div>

          {/* Fila 3: Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.fechaDesde && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaDesde
                      ? format(filters.fechaDesde, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fechaDesde || undefined}
                    onSelect={(date) => handleFilterChange("fechaDesde", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.fechaHasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaHasta
                      ? format(filters.fechaHasta, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fechaHasta || undefined}
                    onSelect={(date) => handleFilterChange("fechaHasta", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Fila 3: Información del Elemento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="elementoSerie">Serie del Elemento</Label>
              <Input
                id="elementoSerie"
                placeholder="Ej: LAP001"
                value={filters.elementoSerie}
                onChange={(e) =>
                  handleFilterChange("elementoSerie", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementoNombre">Nombre del Elemento</Label>
              <Input
                id="elementoNombre"
                placeholder="Ej: Laptop Dell"
                value={filters.elementoNombre}
                onChange={(e) =>
                  handleFilterChange("elementoNombre", e.target.value)
                }
              />
            </div>
          </div>

          {/* Fila 4: Funcionarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funcionarioEntrega">
                Funcionario que Entrega
              </Label>
              <Input
                id="funcionarioEntrega"
                placeholder="Nombre del funcionario"
                value={filters.funcionarioEntrega}
                onChange={(e) =>
                  handleFilterChange("funcionarioEntrega", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funcionarioRecibe">Funcionario que Recibe</Label>
              <Input
                id="funcionarioRecibe"
                placeholder="Nombre del funcionario"
                value={filters.funcionarioRecibe}
                onChange={(e) =>
                  handleFilterChange("funcionarioRecibe", e.target.value)
                }
              />
            </div>
          </div>

          {/* Fila 5: Estado y Orden */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado del Préstamo</Label>
              <select
                id="estado"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.estado}
                onChange={(e) => handleFilterChange("estado", e.target.value)}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="DEVUELTO">Devuelto</option>
                <option value="VENCIDO">Vencido</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordenNumero">Número de Orden</Label>
              <Input
                id="ordenNumero"
                placeholder="Ej: ORD-2024-001"
                value={filters.ordenNumero}
                onChange={(e) =>
                  handleFilterChange("ordenNumero", e.target.value)
                }
              />
            </div>
          </div>

          {/* Fila 6: Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del Préstamo</Label>
            <Input
              id="motivo"
              placeholder="Buscar por motivo del préstamo"
              value={filters.motivo}
              onChange={(e) => handleFilterChange("motivo", e.target.value)}
            />
          </div>

          {/* Botón de búsqueda */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
