"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./input";
import { cn } from "@/lib/utils";

type FormInputProps = React.ComponentProps<typeof Input> & {
  name: string;
};

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, className, ...props }, ref) => {
    const { register } = useFormContext();

    return (
      <Input
        {...register(name)}
        {...props}
        ref={ref}
        className={cn(className)}
      />
    );
  }
);

FormInput.displayName = "FormInput";
