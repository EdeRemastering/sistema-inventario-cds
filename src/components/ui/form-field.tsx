"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  name: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  name,
  label,
  children,
  className,
}: FormFieldProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn("grid gap-1", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
