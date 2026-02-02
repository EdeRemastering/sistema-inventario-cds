"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Calendar } from "./calendar";
import { CalendarIcon, Search, X, Filter, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";

// Tipos de filtros soportados
export type FilterType = "text" | "select" | "date" | "dateRange" | "number" | "boolean";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[]; // Para selects
  min?: number; // Para números
  max?: number; // Para números
};

export type FilterValues = Record<string, string | number | boolean | Date | { from?: Date; to?: Date } | undefined>;

type Props = {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  className?: string;
  showResetButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export function DataTableFilters({
  filters,
  values,
  onChange,
  onReset,
  className,
  showResetButton = true,
  collapsible = false,
  defaultExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleChange = useCallback((key: string, value: FilterValues[string]) => {
    onChange({ ...values, [key]: value });
  }, [values, onChange]);

  const handleReset = useCallback(() => {
    const emptyValues: FilterValues = {};
    filters.forEach((filter) => {
      emptyValues[filter.key] = undefined;
    });
    onChange(emptyValues);
    onReset?.();
  }, [filters, onChange, onReset]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(values).filter((v) => v !== undefined && v !== "" && v !== null).length;
  }, [values]);

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case "text":
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={filter.key}
                type="text"
                placeholder={filter.placeholder || `Buscar ${filter.label.toLowerCase()}...`}
                value={(value as string) || ""}
                onChange={(e) => handleChange(filter.key, e.target.value)}
                className="pl-8"
              />
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => handleChange(filter.key, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        );

      case "select":
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Select
              value={(value as string) || "all"}
              onValueChange={(v) => handleChange(filter.key, v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `Seleccionar ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "date":
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value instanceof Date
                    ? format(value, "PPP", { locale: es })
                    : filter.placeholder || "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value instanceof Date ? value : undefined}
                  onSelect={(date) => handleChange(filter.key, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "dateRange":
        const rangeValue = value as { from?: Date; to?: Date } | undefined;
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !rangeValue?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rangeValue?.from
                      ? format(rangeValue.from, "dd/MM/yy", { locale: es })
                      : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rangeValue?.from}
                    onSelect={(date) =>
                      handleChange(filter.key, { ...rangeValue, from: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !rangeValue?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rangeValue?.to
                      ? format(rangeValue.to, "dd/MM/yy", { locale: es })
                      : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rangeValue?.to}
                    onSelect={(date) =>
                      handleChange(filter.key, { ...rangeValue, to: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "number":
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Input
              id={filter.key}
              type="number"
              placeholder={filter.placeholder}
              value={(value as number) || ""}
              onChange={(e) => handleChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
              min={filter.min}
              max={filter.max}
            />
          </div>
        );

      case "boolean":
        return (
          <div key={filter.key} className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Select
              value={value === undefined ? "all" : value ? "true" : "false"}
              onValueChange={(v) =>
                handleChange(filter.key, v === "all" ? undefined : v === "true")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  if (collapsible) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          {showResetButton && activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
        {expanded && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4 border rounded-lg bg-muted/30">
            {filters.map(renderFilter)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filters.map(renderFilter)}
      </div>
      {showResetButton && activeFiltersCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook para usar filtros con facilidad
export function useTableFilters(initialFilters: FilterConfig[]) {
  const [values, setValues] = useState<FilterValues>({});

  const resetFilters = useCallback(() => {
    setValues({});
  }, []);

  return {
    filters: initialFilters,
    values,
    setValues,
    resetFilters,
  };
}
