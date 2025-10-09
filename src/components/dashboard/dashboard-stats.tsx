"use client";

import { Card, CardContent, CardHeader } from "../ui/card";
import { BarChart3, Package2, Users, TrendingUp } from "lucide-react";
import { DashboardStats } from "../../modules/dashboard/services";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  // Calcular porcentajes de cambio
  const cambioElementos = stats.elementosMesAnterior > 0 
    ? ((stats.totalElementos - stats.elementosMesAnterior) / stats.elementosMesAnterior * 100)
    : 0;

  const cambioCategorias = stats.categoriasMesAnterior > 0
    ? ((stats.totalCategorias - stats.categoriasMesAnterior) / stats.categoriasMesAnterior * 100)
    : 0;

  const cambioUsuarios = stats.usuariosMesAnterior > 0
    ? ((stats.totalUsuarios - stats.usuariosMesAnterior) / stats.usuariosMesAnterior * 100)
    : 0;

  const cambioMovimientos = stats.movimientosSemanaAnterior > 0
    ? ((stats.totalMovimientos - stats.movimientosSemanaAnterior) / stats.movimientosSemanaAnterior * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Elementos</h3>
          <Package2 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalElementos.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {cambioElementos >= 0 ? '+' : ''}{cambioElementos.toFixed(1)}% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Categorías</h3>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalCategorias}
          </div>
          <p className="text-xs text-muted-foreground">
            {cambioCategorias >= 0 ? '+' : ''}{cambioCategorias.toFixed(1)}% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Usuarios Activos</h3>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalUsuarios}
          </div>
          <p className="text-xs text-muted-foreground">
            {cambioUsuarios >= 0 ? '+' : ''}{cambioUsuarios.toFixed(1)}% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Movimientos</h3>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalMovimientos.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {cambioMovimientos >= 0 ? '+' : ''}{cambioMovimientos.toFixed(1)}% desde la semana pasada
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardQuickStats({ stats }: DashboardStatsProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <h3 className="text-primary font-semibold">Estadísticas Rápidas</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Elementos en stock</span>
            <span className="font-medium text-primary">{stats.elementosEnStock}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Elementos prestados</span>
            <span className="font-medium text-primary">{stats.elementosPrestados}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Tickets pendientes</span>
            <span className="font-medium text-primary">{stats.ticketsPendientes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Reportes generados</span>
            <span className="font-medium text-primary">{stats.reportesGenerados}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
