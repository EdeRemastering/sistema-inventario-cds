"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, TrendingUp, Package, Users } from "lucide-react";
import {
  getMovimientosDataAction,
  getCategoriasDataAction,
  getEstadosDataAction,
} from "../../modules/dashboard/actions";

type ChartData = {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
};

type DashboardStats = {
  totalElementos: number;
  totalCategorias: number;
  totalUsuarios: number;
  totalMovimientos: number;
  elementosEnStock: number;
  elementosPrestados: number;
  ticketsPendientes: number;
  reportesGenerados: number;
};

export function AdvancedCharts({ stats }: { stats: DashboardStats }) {
  const [movimientosData, setMovimientosData] = useState<ChartData[]>([]);
  const [categoriasData, setCategoriasData] = useState<ChartData[]>([]);
  const [estadosData, setEstadosData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movimientos, categorias, estados] = await Promise.all([
          getMovimientosDataAction(),
          getCategoriasDataAction(),
          getEstadosDataAction(),
        ]);

        setMovimientosData(movimientos);
        setCategoriasData(categorias);
        setEstadosData(estados);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos de gráficas:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [stats]);

  // Usar colores del tema CSS en lugar de colores fijos
  const getChartColors = () => {
    return [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cargando gráficos...
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
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Movimientos por Mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Movimientos por Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={movimientosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="movimientos"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                name="Total Movimientos"
              />
              <Area
                type="monotone"
                dataKey="prestamos"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                name="Préstamos"
              />
              <Area
                type="monotone"
                dataKey="devoluciones"
                stackId="3"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                name="Devoluciones"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Elementos por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Elementos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriasData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent as number) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="hsl(var(--chart-1))"
                dataKey="value"
              >
                {categoriasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getChartColors()[index % getChartColors().length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Estados de Elementos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estados de Elementos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="elementos" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estadísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div>
                <p className="text-sm font-medium text-primary">
                  Total Elementos
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalElementos}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-secondary-foreground/20">
              <div>
                <p className="text-sm font-medium text-secondary-foreground">
                  En Stock
                </p>
                <p className="text-2xl font-bold text-secondary-foreground">
                  {stats.elementosEnStock}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-accent-foreground/20">
              <div>
                <p className="text-sm font-medium text-accent-foreground">
                  Prestados
                </p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {stats.elementosPrestados}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-muted-foreground/20">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tickets Pendientes
                </p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {stats.ticketsPendientes}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
