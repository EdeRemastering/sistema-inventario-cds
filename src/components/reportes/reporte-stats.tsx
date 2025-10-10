"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  FileText,
  TrendingUp,
  Clock,
  Package,
  Tag,
  Eye,
  Ticket,
} from "lucide-react";

interface ReporteStatsProps {
  stats: {
    totalElementos: number;
    totalMovimientos: number;
    totalPrestamosActivos: number;
    totalCategorias: number;
    totalObservaciones: number;
    totalTickets: number;
  };
}

export function ReporteStats({ stats }: ReporteStatsProps) {
  const statCards = [
    {
      title: "Elementos",
      value: stats.totalElementos,
      icon: Package,
      description: "Total en inventario",
      color: "text-blue-600",
    },
    {
      title: "Movimientos",
      value: stats.totalMovimientos,
      icon: TrendingUp,
      description: "Entradas y salidas",
      color: "text-green-600",
    },
    {
      title: "Préstamos Activos",
      value: stats.totalPrestamosActivos,
      icon: Clock,
      description: "Sin devolver",
      color: "text-orange-600",
    },
    {
      title: "Categorías",
      value: stats.totalCategorias,
      icon: Tag,
      description: "Disponibles",
      color: "text-purple-600",
    },
    {
      title: "Observaciones",
      value: stats.totalObservaciones,
      icon: Eye,
      description: "Registradas",
      color: "text-indigo-600",
    },
    {
      title: "Tickets",
      value: stats.totalTickets,
      icon: Ticket,
      description: "Guardados",
      color: "text-pink-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
