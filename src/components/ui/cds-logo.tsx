import Image from "next/image";
import { cn } from "@/lib/utils";

interface CDSLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 80, height: 80 },
};

export function CDSLogo({
  size = "md",
  className,
  showText = false,
  textClassName,
}: CDSLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/cds-logo.png"
        alt="CDS Logo"
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-lg"
      />
      {showText && (
        <span className={cn("font-semibold", textClassName)}>
          Sistema Inventario
        </span>
      )}
    </div>
  );
}
