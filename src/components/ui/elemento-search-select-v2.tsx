"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ElementoOptionV2 {
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
}

interface ElementoSearchSelectV2Props {
  elementos: ElementoOptionV2[];
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function ElementoSearchSelectV2({
  elementos,
  value,
  onValueChange,
  placeholder = "Seleccionar elemento...",
  label = "Elemento",
  className,
  disabled = false,
  required = false,
  error,
}: ElementoSearchSelectV2Props) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const selectedElemento = elementos.find((elemento) => elemento.id === value);

  const handleSelect = (currentValue: number) => {
    const newValue = currentValue === value ? undefined : currentValue;
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background hover:text-foreground focus-visible:outline-[3px]",
              error && "border-red-500 focus-visible:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "truncate text-foreground",
                !value && "text-muted-foreground"
              )}
            >
              {selectedElemento
                ? `${selectedElemento.serie} - ${
                    selectedElemento.categoria.nombre
                  }${
                    selectedElemento.subcategoria
                      ? ` - ${selectedElemento.subcategoria.nombre}`
                      : ""
                  }`
                : placeholder}
            </span>
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar elemento..." />
            <CommandList>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>
              <CommandGroup>
                {elementos.map((elemento) => (
                  <CommandItem
                    key={elemento.id}
                    value={`${elemento.serie} ${elemento.categoria.nombre} ${
                      elemento.subcategoria?.nombre || ""
                    } ${elemento.marca || ""} ${elemento.modelo || ""}`}
                    onSelect={() => handleSelect(elemento.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{elemento.serie}</span>
                      <span className="text-sm text-muted-foreground">
                        {elemento.categoria.nombre}
                        {elemento.subcategoria &&
                          ` - ${elemento.subcategoria.nombre}`}
                        {elemento.marca && ` | ${elemento.marca}`}
                        {elemento.modelo && ` ${elemento.modelo}`}
                      </span>
                    </div>
                    {value === elemento.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
