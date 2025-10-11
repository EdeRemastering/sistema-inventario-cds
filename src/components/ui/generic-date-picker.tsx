"use client";

import { useState } from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Label } from "./label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";

interface GenericDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  includeTime?: boolean;
  className?: string;
  disabled?: boolean;
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
}: GenericDatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Si se incluye tiempo, mantener la hora actual
      if (includeTime && value) {
        date.setHours(value.getHours());
        date.setMinutes(value.getMinutes());
      }
      onChange(date);
    }
    setOpen(false);
  };

  const formatDisplayValue = (date: Date | undefined) => {
    if (!date) return placeholder;

    if (includeTime) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    }
    return format(date, "dd/MM/yyyy", { locale: es });
  };

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
            selected={value}
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
    />
  );
}
