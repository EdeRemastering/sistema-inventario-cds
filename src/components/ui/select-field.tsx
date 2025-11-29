"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type SelectFieldProps = {
  name: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function SelectField({
  name,
  options,
  placeholder = "Seleccionar...",
  className,
  defaultValue,
  value,
  onValueChange,
  disabled,
  required,
}: SelectFieldProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    value ?? defaultValue
  );
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = (v: string) => {
    setInternalValue(v);
    if (inputRef.current) inputRef.current.value = v;
    onValueChange?.(v);
  };

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const hasOptions = options.length > 0;

  return (
    <div className={cn("grid gap-1", className)}>
      <input
        ref={inputRef}
        name={name}
        defaultValue={internalValue}
        className="hidden"
        aria-hidden
        required={required}
        disabled={internalValue === undefined}
      />
      <Select
        disabled={disabled || !hasOptions}
        value={internalValue}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={hasOptions ? placeholder : "No hay opciones disponibles"} 
          />
        </SelectTrigger>
        <SelectContent>
          {hasOptions ? (
            options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              <p className="font-medium">No hay opciones disponibles</p>
              <p className="text-xs mt-1">
                Es posible que necesites crear o cargar datos primero
              </p>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
