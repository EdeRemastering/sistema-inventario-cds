"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { SelectField } from "./select-field";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type FormSelectProps = {
  name: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function FormSelect({
  name,
  options,
  placeholder,
  className,
  disabled,
}: FormSelectProps) {
  const { setValue, watch } = useFormContext();
  const value = watch(name);

  const handleChange = (newValue: string) => {
    setValue(name, newValue);
  };

  return (
    <SelectField
      name={name}
      options={options}
      placeholder={placeholder}
      className={cn(className)}
      value={value}
      onValueChange={handleChange}
      disabled={disabled}
    />
  );
}
