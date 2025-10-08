"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Switch } from "./switch";
import { cn } from "@/lib/utils";

type FormSwitchProps = {
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function FormSwitch({
  name,
  label,
  className,
  disabled,
}: FormSwitchProps) {
  const { setValue, watch } = useFormContext();
  const value = watch(name);

  const handleChange = (checked: boolean) => {
    setValue(name, checked ? "activo" : "inactivo");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        checked={value === "activo"}
        onCheckedChange={handleChange}
        disabled={disabled}
        aria-label={label}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
