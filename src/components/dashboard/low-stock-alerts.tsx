"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Package, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";
import {
  actionGetLowStockElementos,
  type LowStockElement,
} from "@/modules/elementos/actions";

const ITEMS_TO_SHOW = 5;

export function LowStockAlerts() {
  const [lowStockElements, setLowStockElements] = useState<LowStockElement[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadLowStockElements = async () => {
      try {
        // Obtener elementos con stock bajo usando actions
        const data = await actionGetLowStockElementos();
        setLowStockElements(data);
      } catch (error) {
        console.error("Error cargando elementos con stock bajo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLowStockElements();
  }, []);

  // Ordenar por prioridad: sin stock primero, luego por menor stock disponible
  const sortedElements = useMemo(() => {
    return [...lowStockElements].sort((a, b) => {
      // Primero los que no tienen stock
      if (a.availableStock === 0 && b.availableStock !== 0) return -1;
      if (b.availableStock === 0 && a.availableStock !== 0) return 1;
      // Luego por menor stock disponible
      return a.availableStock - b.availableStock;
    });
  }, [lowStockElements]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const sinStock = lowStockElements.filter(e => e.availableStock === 0).length;
    const stockBajo = lowStockElements.filter(e => e.availableStock > 0).length;
    return { sinStock, stockBajo, total: lowStockElements.length };
  }, [lowStockElements]);

  // Elementos a mostrar según estado expandido
  const displayedElements = expanded 
    ? sortedElements.slice(0, 15) // Máximo 15 cuando está expandido
    : sortedElements.slice(0, ITEMS_TO_SHOW);

  const hasMore = sortedElements.length > ITEMS_TO_SHOW;
  const remainingCount = sortedElements.length - displayedElements.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Alertas de Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lowStockElements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Stock Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Package className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Todos los elementos tienen stock suficiente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Alertas de Stock Bajo
          <Badge variant="destructive" className="ml-auto">
            {stats.total}
          </Badge>
        </CardTitle>
        {/* Resumen de estadísticas */}
        <div className="flex gap-3 mt-2">
          {stats.sinStock > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.sinStock} sin stock
            </Badge>
          )}
          {stats.stockBajo > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stats.stockBajo} stock bajo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {displayedElements.map((elemento) => (
            <div
              key={elemento.id}
              className="flex items-center justify-between p-2.5 border rounded-lg bg-destructive/10 border-destructive/20"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{elemento.serie}</span>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {elemento.categoria.nombre}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {elemento.marca} {elemento.modelo}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs">
                    <span className="font-medium text-destructive">
                      {elemento.availableStock}
                    </span>{" "}
                    disponibles
                  </span>
                  <span className="text-xs">
                    <span className="font-medium">
                      {elemento.totalPrestado}
                    </span>{" "}
                    prestados
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {elemento.availableStock === 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Sin Stock
                  </Badge>
                )}
                {elemento.availableStock > 0 && elemento.availableStock < 3 && (
                  <Badge variant="secondary" className="text-xs">
                    Stock Bajo
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón expandir/contraer */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Ver más ({remainingCount > 10 ? "10+" : remainingCount} más)
              </>
            )}
          </Button>
        )}

        <div className="mt-3 pt-3 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/elementos">
              Ver Todos los Elementos ({stats.total} alertas)
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
