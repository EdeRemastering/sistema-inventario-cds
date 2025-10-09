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
    // Simular carga de datos - en implementación real vendría de la API
    setTimeout(() => {
      setMovimientosData([
        { name: "Ene", movimientos: 12, prestamos: 8, devoluciones: 4 },
        { name: "Feb", movimientos: 19, prestamos: 12, devoluciones: 7 },
        { name: "Mar", movimientos: 15, prestamos: 9, devoluciones: 6 },
        { name: "Abr", movimientos: 22, prestamos: 14, devoluciones: 8 },
        { name: "May", movimientos: 18, prestamos: 11, devoluciones: 7 },
        { name: "Jun", movimientos: 25, prestamos: 16, devoluciones: 9 },
      ]);

      setCategoriasData([
        { name: "Equipos de Cómputo", elementos: 45, value: 45 },
        { name: "Muebles", elementos: 32, value: 32 },
        { name: "Equipos de Oficina", elementos: 28, value: 28 },
        { name: "Equipos de Laboratorio", elementos: 15, value: 15 },
        { name: "Otros", elementos: 12, value: 12 },
      ]);

      setEstadosData([
        {
          name: "En Stock",
          elementos: stats.elementosEnStock,
          value: stats.elementosEnStock,
        },
        {
          name: "Prestados",
          elementos: stats.elementosPrestados,
          value: stats.elementosPrestados,
        },
        { name: "Fuera de Servicio", elementos: 5, value: 5 },
        { name: "En Mantenimiento", elementos: 3, value: 3 },
      ]);

      setLoading(false);
    }, 1000);
  }, [stats]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
                stroke="#8884d8"
                fill="#8884d8"
                name="Total Movimientos"
              />
              <Area
                type="monotone"
                dataKey="prestamos"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Préstamos"
              />
              <Area
                type="monotone"
                dataKey="devoluciones"
                stackId="3"
                stroke="#ffc658"
                fill="#ffc658"
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
                fill="#8884d8"
                dataKey="value"
              >
                {categoriasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
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
              <Bar dataKey="elementos" fill="#8884d8" />
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
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Total Elementos
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalElementos}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">En Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.elementosEnStock}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-orange-900">Prestados</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.elementosPrestados}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Tickets Pendientes
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.ticketsPendientes}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
