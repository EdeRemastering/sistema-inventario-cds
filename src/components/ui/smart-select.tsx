"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "../../lib/utils";

export type SmartSelectOption = {
  value: string;
  label: string;
  hasData?: boolean;
  disabled?: boolean;
  description?: string;
};

type SmartSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SmartSelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  showDisabledOptions?: boolean;
  hideEmptyOptions?: boolean;
  className?: string;
  id?: string;
};

/**
 * Select inteligente que automáticamente:
 * - Deshabilita opciones sin datos
 * - Muestra indicadores visuales
 * - Oculta o muestra opciones vacías según configuración
 */
export function SmartSelect({
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar...",
  emptyMessage = "No hay opciones disponibles",
  disabled = false,
  showDisabledOptions = true,
  hideEmptyOptions = false,
  className,
  id,
}: SmartSelectProps) {
  // Filtrar opciones si se debe ocultar las vacías
  const filteredOptions = hideEmptyOptions
    ? options.filter((opt) => opt.hasData !== false)
    : options;

  // Verificar si hay opciones disponibles
  const hasAvailableOptions = filteredOptions.some(
    (opt) => opt.hasData !== false && !opt.disabled
  );

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled || !hasAvailableOptions}
    >
      <SelectTrigger className={className} id={id}>
        <SelectValue
          placeholder={
            !hasAvailableOptions && filteredOptions.length > 0
              ? "Sin opciones con datos"
              : filteredOptions.length === 0
              ? emptyMessage
              : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          filteredOptions.map((option) => {
            const isDisabled = option.disabled || option.hasData === false;

            if (!showDisabledOptions && isDisabled) {
              return null;
            }

            return (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={isDisabled}
                className={cn(
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                  {isDisabled && (
                    <span className="text-xs text-muted-foreground">
                      (sin elementos)
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
}

/**
 * Helper para convertir opciones simples a SmartSelectOption
 */
export function toSmartOptions<T extends { id: number; nombre?: string }>(
  items: T[],
  dataSet?: Set<number>,
  labelKey: keyof T = "nombre" as keyof T
): SmartSelectOption[] {
  return items.map((item) => ({
    value: item.id.toString(),
    label: String(item[labelKey] || item.id),
    hasData: dataSet ? dataSet.has(item.id) : true,
    disabled: dataSet ? !dataSet.has(item.id) : false,
  }));
}
