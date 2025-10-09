"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
};

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ name, className, ...props }, ref) => {
  const { register } = useFormContext();

  return (
    <textarea
      {...register(name)}
      {...props}
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border-2 border-primary/40 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 hover:border-primary/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
});

FormTextarea.displayName = "FormTextarea";
