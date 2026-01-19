"use client";

import { LucideIcon, FileX2, Search, AlertCircle, Database } from "lucide-react";
import { Button } from "./button";

type EmptyStateType = "no-data" | "no-results" | "error" | "custom";

type Props = {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

const defaultConfig: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string }> = {
  "no-data": {
    icon: Database,
    title: "Sin datos",
    description: "No hay registros disponibles. Comienza creando uno nuevo.",
  },
  "no-results": {
    icon: Search,
    title: "Sin resultados",
    description: "No se encontraron registros que coincidan con los filtros aplicados.",
  },
  "error": {
    icon: AlertCircle,
    title: "Error al cargar",
    description: "Ocurrió un error al cargar los datos. Intenta nuevamente.",
  },
  "custom": {
    icon: FileX2,
    title: "Sin contenido",
    description: "No hay contenido para mostrar.",
  },
};

export function DataTableEmpty({
  type = "no-data",
  title,
  description,
  icon,
  action,
  className = "",
}: Props) {
  const config = defaultConfig[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {displayDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Componente para usar dentro de TableBody
export function TableEmptyRow({
  colSpan,
  type = "no-data",
  title,
  description,
  action,
}: Props & { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <DataTableEmpty
          type={type}
          title={title}
          description={description}
          action={action}
        />
      </td>
    </tr>
  );
}
