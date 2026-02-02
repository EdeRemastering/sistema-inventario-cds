"use client";

import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "../../lib/utils";

type TableSkeletonProps = {
  columns: number;
  rows?: number;
  columnWidths?: string[];
  showHeader?: boolean;
  className?: string;
};

export function TableSkeleton({
  columns,
  rows = 5,
  columnWidths,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton
                    className="h-4"
                    style={{ width: columnWidths?.[i] || "100px" }}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className="h-4"
                    style={{ width: columnWidths?.[colIndex] || "80%" }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Skeleton para la sección de filtros
export function FiltersSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para la paginación
export function PaginationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4",
        className
      )}
    >
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

// Skeleton completo para una página con tabla
export function PageWithTableSkeleton({
  title = true,
  filters = 4,
  columns = 5,
  rows = 5,
  pagination = true,
  className,
}: {
  title?: boolean;
  filters?: number;
  columns?: number;
  rows?: number;
  pagination?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {title && (
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}

      {/* Filtros */}
      {filters > 0 && <FiltersSkeleton count={filters} />}

      {/* Tabla */}
      <TableSkeleton columns={columns} rows={rows} />

      {/* Paginación */}
      {pagination && <PaginationSkeleton />}
    </div>
  );
}

// Skeleton para tarjetas
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// Skeleton para grid de tarjetas
export function CardsGridSkeleton({
  count = 6,
  columns = 3,
  className,
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para formularios
export function FormSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Skeleton para cronograma/calendario
export function CalendarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con mes/año */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días de la semana */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 w-full" />
        ))}
        {/* Días del mes */}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
