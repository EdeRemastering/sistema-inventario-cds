"use client";

import * as React from "react";
import { Switch } from "./switch";

type EstadoSwitchProps = {
  name: string;
  defaultValue?: boolean;
  label?: string;
  className?: string;
};

export function EstadoSwitch({
  name,
  defaultValue = true,
  label = "Activo",
  className,
}: EstadoSwitchProps) {
  const [checked, setChecked] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked);
    if (inputRef.current) {
      inputRef.current.value = newChecked ? "activo" : "inactivo";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <input
        ref={inputRef}
        name={name}
        defaultValue={checked ? "activo" : "inactivo"}
        className="hidden"
        aria-hidden
      />
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        aria-label={label}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
