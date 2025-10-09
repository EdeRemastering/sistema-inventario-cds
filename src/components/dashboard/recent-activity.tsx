"use client";

import { Card, CardContent, CardHeader } from "../ui/card";
import { ActividadReciente } from "../../modules/dashboard/services";

interface RecentActivityProps {
  actividades: ActividadReciente[];
}

export function RecentActivity({ actividades }: RecentActivityProps) {
  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'elemento':
        return '📦';
      case 'movimiento':
        return '🔄';
      case 'usuario':
        return '👤';
      default:
        return '📝';
    }
  };

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case 'elemento':
        return 'bg-primary';
      case 'movimiento':
        return 'bg-blue-500';
      case 'usuario':
        return 'bg-green-500';
      default:
        return 'bg-accent';
    }
  };

  const formatTimeAgo = (fecha: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - fecha.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <h3 className="text-primary font-semibold">Actividad Reciente</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actividades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          ) : (
            actividades.map((actividad) => (
              <div key={`${actividad.tipo}-${actividad.id}`} className="flex items-center space-x-4">
                <div className={`w-2 h-2 ${getActivityColor(actividad.tipo)} rounded-full`}></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{actividad.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(actividad.fecha)}
                    {actividad.usuario && ` • ${actividad.usuario}`}
                  </p>
                </div>
                <div className="text-lg">
                  {getActivityIcon(actividad.tipo)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
