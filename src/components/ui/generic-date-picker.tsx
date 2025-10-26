"use client";

import { useState } from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";

interface GenericDatePickerProps {
  label: string;
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  includeTime?: boolean;
  className?: string;
  disabled?: boolean;
  timeValue?: string;
  onTimeChange?: (time: string) => void;
}

export function GenericDatePicker({
  label,
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  error,
  required = false,
  includeTime = false,
  className,
  disabled = false,
  timeValue,
  onTimeChange,
}: GenericDatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Si se incluye tiempo, mantener la hora actual si existe
      if (includeTime && timeValue) {
        const [hours, minutes] = timeValue.split(":");
        if (
          hours &&
          minutes &&
          !isNaN(parseInt(hours)) &&
          !isNaN(parseInt(minutes))
        ) {
          date.setHours(parseInt(hours), parseInt(minutes));
        }
      }
      onChange(date);
    }
    setOpen(false);
  };

  const formatDisplayValue = (date: Date | string | undefined) => {
    if (!date) return placeholder;
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "dd/MM/yyyy", { locale: es });
  };

  // Si incluye tiempo, mostrar fecha y hora por separado
  if (includeTime) {
    return (
      <div className={cn("grid gap-1", className)}>
        <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        <div className="flex gap-4">
          {/* Selector de Fecha */}
          <div className="flex flex-col gap-3">
            <Label
              htmlFor={`${label.toLowerCase().replace(/\s+/g, "-")}-date`}
              className="px-1 text-sm"
            >
              Fecha
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={`${label.toLowerCase().replace(/\s+/g, "-")}-date`}
                  className={cn(
                    "w-32 justify-between font-normal",
                    error && "border-red-500 focus-visible:ring-red-500",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={disabled}
                >
                  {value
                    ? value instanceof Date
                      ? value.toLocaleDateString()
                      : new Date(value).toLocaleDateString()
                    : "Seleccionar"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={
                    value instanceof Date
                      ? value
                      : value
                      ? new Date(value)
                      : undefined
                  }
                  onSelect={handleDateSelect}
                  captionLayout="dropdown"
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selector de Hora */}
          <div className="flex flex-col gap-3">
            <Label
              htmlFor={`${label.toLowerCase().replace(/\s+/g, "-")}-time`}
              className="px-1 text-sm"
            >
              Hora
            </Label>
            <Input
              type="time"
              id={`${label.toLowerCase().replace(/\s+/g, "-")}-time`}
              value={timeValue || ""}
              onChange={(e) => {
                const timeValue = e.target.value;
                // Validar formato de hora (HH:MM)
                if (
                  timeValue === "" ||
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)
                ) {
                  onTimeChange?.(timeValue);
                }
              }}
              className={cn(
                "w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                error && "border-red-500 focus-visible:ring-red-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  // Selector solo de fecha (comportamiento original)
  return (
    <div className={cn("grid gap-1", className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={label.toLowerCase().replace(/\s+/g, "-")}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayValue(value)}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={
              value instanceof Date
                ? value
                : value
                ? new Date(value)
                : undefined
            }
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            locale={es}
          />
        </PopoverContent>
      </Popover>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

// Componente específico para fecha y hora (DateTimePicker)
export function GenericDateTimePicker({
  label,
  value,
  onChange,
  placeholder = "Seleccionar fecha y hora",
  error,
  required = false,
  className,
  disabled = false,
  timeValue,
  onTimeChange,
}: Omit<GenericDatePickerProps, "includeTime">) {
  return (
    <GenericDatePicker
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      required={required}
      includeTime={true}
      className={className}
      disabled={disabled}
      timeValue={timeValue}
      onTimeChange={onTimeChange}
    />
  );
}
