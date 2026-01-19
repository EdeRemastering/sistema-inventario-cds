"use client";

import { Button } from "./button";
import {
  FileX2,
  Inbox,
  Search,
  Database,
  AlertCircle,
  FolderOpen,
  Package,
  Users,
  Calendar,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";

type EmptyStateVariant =
  | "default"
  | "search"
  | "error"
  | "noData"
  | "noResults"
  | "folder"
  | "items"
  | "users"
  | "calendar"
  | "settings";

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  noData: Database,
  noResults: FileX2,
  folder: FolderOpen,
  items: Package,
  users: Users,
  calendar: Calendar,
  settings: Settings,
};

const variantDefaults: Record<EmptyStateVariant, { title: string; description: string }> = {
  default: {
    title: "No hay datos",
    description: "No se encontraron elementos para mostrar.",
  },
  search: {
    title: "Sin resultados",
    description: "No se encontraron resultados para tu búsqueda. Intenta con otros términos.",
  },
  error: {
    title: "Error al cargar",
    description: "Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.",
  },
  noData: {
    title: "Sin datos",
    description: "Aún no hay datos registrados en el sistema.",
  },
  noResults: {
    title: "Sin resultados",
    description: "No hay elementos que coincidan con los filtros aplicados.",
  },
  folder: {
    title: "Carpeta vacía",
    description: "Esta carpeta no contiene elementos.",
  },
  items: {
    title: "Sin elementos",
    description: "No hay elementos registrados todavía.",
  },
  users: {
    title: "Sin usuarios",
    description: "No hay usuarios registrados en el sistema.",
  },
  calendar: {
    title: "Sin eventos",
    description: "No hay eventos programados para este período.",
  },
  settings: {
    title: "Sin configuración",
    description: "No hay configuraciones disponibles.",
  },
};

type EmptyStateProps = {
  variant?: EmptyStateVariant;
  icon?: LucideIcon | ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "md",
}: EmptyStateProps) {
  const DefaultIcon = variantIcons[variant];
  const defaults = variantDefaults[variant];
  
  // Determinar si icon es un componente Lucide o un ReactNode
  const isLucideIcon = icon && typeof icon === 'function';

  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "h-8 w-8",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-10",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  const renderIcon = () => {
    if (!icon) {
      return <DefaultIcon className={cn("text-muted-foreground", sizes.icon)} />;
    }
    if (isLucideIcon) {
      const LucideIconComponent = icon as LucideIcon;
      return <LucideIconComponent className={cn("text-muted-foreground", sizes.icon)} />;
    }
    return icon; // Es un ReactNode
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        {renderIcon()}
      </div>

      <h3 className={cn("font-semibold text-foreground mb-1", sizes.title)}>
        {title || defaults.title}
      </h3>

      <p className={cn("text-muted-foreground max-w-md mb-4", sizes.description)}>
        {description || defaults.description}
      </p>

      {children}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-2">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Componente específico para tablas vacías
type TableEmptyStateProps = Omit<EmptyStateProps, "size"> & {
  colSpan?: number;
};

export function TableEmptyState({
  colSpan = 1,
  ...props
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState size="md" {...props} />
      </td>
    </tr>
  );
}

// Componente para errores
export function ErrorState({
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: "Reintentar",
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Componente para resultados de búsqueda vacíos
export function NoSearchResults({
  searchTerm,
  onClear,
  className,
}: {
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="search"
      title="Sin resultados"
      description={
        searchTerm
          ? `No se encontraron resultados para "${searchTerm}".`
          : "No se encontraron resultados para tu búsqueda."
      }
      action={
        onClear
          ? {
              label: "Limpiar búsqueda",
              onClick: onClear,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Componente para filtros sin resultados
export function NoFilterResults({
  onClearFilters,
  className,
}: {
  onClearFilters?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="noResults"
      title="Sin resultados"
      description="No hay elementos que coincidan con los filtros seleccionados."
      action={
        onClearFilters
          ? {
              label: "Limpiar filtros",
              onClick: onClearFilters,
            }
          : undefined
      }
      className={className}
    />
  );
}
