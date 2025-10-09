"use client";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { BarChart3, Package2, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al Sistema de Inventario del CDs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Elementos</h3>
            <Package2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Categorías</h3>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">45</div>
            <p className="text-xs text-muted-foreground">+2 nuevas este mes</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Usuarios Activos</h3>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground">+1 nuevo usuario</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Movimientos</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">89</div>
            <p className="text-xs text-muted-foreground">
              +12% desde la semana pasada
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <h3 className="text-primary font-semibold">Actividad Reciente</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Nuevo elemento agregado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Categoría actualizada</p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Usuario registrado</p>
                  <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <h3 className="text-primary font-semibold">Estadísticas Rápidas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Elementos en stock</span>
                <span className="font-medium text-primary">1,156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Elementos prestados</span>
                <span className="font-medium text-primary">78</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tickets pendientes</span>
                <span className="font-medium text-primary">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Reportes generados</span>
                <span className="font-medium text-primary">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
