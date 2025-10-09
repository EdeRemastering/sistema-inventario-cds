"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";

type LowStockElement = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  ubicacion: string | null;
  estado_funcional: string;
  estado_fisico: string;
  categoria: { nombre: string };
  subcategoria: { nombre: string } | null;
  availableStock: number;
  totalPrestado: number;
};

export function LowStockAlerts() {
  const [lowStockElements, setLowStockElements] = useState<LowStockElement[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En una implementación real, esto vendría de una API
    // Por ahora simulamos datos
    setTimeout(() => {
      setLowStockElements([
        {
          id: 1,
          serie: "LAP001",
          marca: "Dell",
          modelo: "Latitude 5520",
          cantidad: 10,
          ubicacion: "Oficina Principal",
          estado_funcional: "B",
          estado_fisico: "B",
          categoria: { nombre: "Equipos de Cómputo" },
          subcategoria: { nombre: "Laptops" },
          availableStock: 2,
          totalPrestado: 8,
        },
        {
          id: 2,
          serie: "MON001",
          marca: "Samsung",
          modelo: '24" LED',
          cantidad: 5,
          ubicacion: "Almacén",
          estado_funcional: "B",
          estado_fisico: "B",
          categoria: { nombre: "Equipos de Cómputo" },
          subcategoria: { nombre: "Monitores" },
          availableStock: 1,
          totalPrestado: 4,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
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
            <Package className="h-5 w-5 text-green-500" />
            Stock Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Package className="h-12 w-12 text-green-500 mx-auto mb-2" />
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Stock Bajo
          <Badge variant="destructive" className="ml-auto">
            {lowStockElements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockElements.map((elemento) => (
            <div
              key={elemento.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">{elemento.serie}</span>
                  <Badge variant="outline" className="text-xs">
                    {elemento.categoria.nombre}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {elemento.marca} {elemento.modelo}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs">
                    <span className="font-medium text-orange-600">
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
              <div className="flex items-center gap-2">
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

        <div className="mt-4 pt-4 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/elementos">Ver Todos los Elementos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
