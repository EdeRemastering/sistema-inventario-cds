import { Skeleton } from "../ui/skeleton";

export function UbicacionesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="grid grid-cols-5 gap-3 border-b p-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20 justify-self-end" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-3 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="justify-self-end flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

