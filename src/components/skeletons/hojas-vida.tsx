import { Skeleton } from "../ui/skeleton";

/**
 * Skeleton para la vista de "Hojas de Vida".
 * Simula: título + botón crear + tabla con varias filas.
 */
export function HojasVidaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center">
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

