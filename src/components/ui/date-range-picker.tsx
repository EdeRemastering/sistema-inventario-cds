"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  value?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Selecciona un rango",
  disabled = false,
  className,
}: Props) {
  const label = React.useMemo(() => {
    if (!value?.from) return placeholder;
    if (!value.to) return format(value.from, "PPP", { locale: es });
    return `${format(value.from, "PPP", { locale: es })} – ${format(value.to, "PPP", { locale: es })}`;
  }, [value, placeholder]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 border-2 border-primary/40 hover:border-primary/60 focus-visible:border-primary focus-visible:ring-primary/30 shadow-xs",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onValueChange}
          numberOfMonths={2}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}

