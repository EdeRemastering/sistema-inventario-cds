"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon, Package } from "lucide-react";

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

export interface ElementoOption {
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

interface ElementoSearchSelectProps {
  elementos: ElementoOption[];
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function ElementoSearchSelect({
  elementos,
  value,
  onValueChange,
  placeholder = "Seleccionar elemento",
  label,
  className,
  disabled = false,
  required = false,
  error,
}: ElementoSearchSelectProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const selectedElemento = elementos.find((elemento) => elemento.id === value);

  const handleSelect = (currentValue: string) => {
    const numericValue = parseInt(currentValue);
    const newValue = numericValue === value ? undefined : numericValue;
    onValueChange?.(newValue);
    setOpen(false);
  };

  const formatElementoLabel = (elemento: ElementoOption) => {
    const subcategoriaText = elemento.subcategoria
      ? ` - ${elemento.subcategoria.nombre}`
      : "";
    return `${elemento.categoria.nombre}${subcategoriaText}`;
  };

  return (
    <div className={cn("grid gap-1", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            required && "after:content-['*'] after:text-red-500 after:ml-1"
          )}
        >
          {label}
        </Label>
      )}
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]",
              error && "border-red-500 focus-visible:outline-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "truncate flex items-center gap-2",
                !value && "text-muted-foreground"
              )}
            >
              {selectedElemento ? (
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{selectedElemento.serie}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatElementoLabel(selectedElemento)}
                  </span>
                </div>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0 max-h-[300px]"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar elemento..." />
            <CommandList className="max-h-[250px]">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron elementos
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {elementos.map((elemento) => (
                  <CommandItem
                    key={elemento.id}
                    value={`${elemento.id}`}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{elemento.serie}</span>
                        {elemento.marca && elemento.modelo && (
                          <span className="text-sm text-muted-foreground">
                            {elemento.marca} {elemento.modelo}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatElementoLabel(elemento)}
                      </span>
                    </div>
                    {value === elemento.id && (
                      <CheckIcon size={16} className="ml-auto text-primary" />
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

// Componente por defecto para mantener compatibilidad
export default function Component() {
  const frameworks = [
    { id: 1, serie: "next.js", categoria: { nombre: "Next.js" } },
    { id: 2, serie: "sveltekit", categoria: { nombre: "SvelteKit" } },
    { id: 3, serie: "nuxt.js", categoria: { nombre: "Nuxt.js" } },
  ] as ElementoOption[];

  return (
    <div className="*:not-first:mt-2">
      <ElementoSearchSelect
        elementos={frameworks}
        label="Select with search"
        placeholder="Seleccionar framework"
      />
    </div>
  );
}
