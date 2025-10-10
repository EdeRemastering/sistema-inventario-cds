"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha y hora",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(
    value ? format(value, "HH:mm:ss") : "00:00:00"
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setSelectedTime(format(value, "HH:mm:ss"));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);

    if (date && selectedTime) {
      const [hours, minutes, seconds] = selectedTime.split(":").map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, seconds || 0, 0);
      onChange?.(newDateTime);
    } else {
      onChange?.(date);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);

    if (selectedDate && time) {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, seconds || 0, 0);
      onChange?.(newDateTime);
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="date-picker" className="px-1">
          Fecha
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-full justify-between font-normal"
              disabled={disabled}
            >
              {selectedDate
                ? format(selectedDate, "PPP", { locale: es })
                : placeholder}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={(date) => {
                handleDateSelect(date);
                setOpen(false);
              }}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Hora
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={selectedTime}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
