"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, Check, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import type { MantenimientoProgramado } from "../../modules/mantenimientos/types";

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  ubicacion_rel?: {
    nombre: string;
    sede?: {
      nombre: string;
    } | null;
  } | null;
};

type Props = {
  mantenimientos: MantenimientoProgramado[];
  elementos: ElementoOption[];
  onCambiarEstado?: (id: number, estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO") => Promise<void>;
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const MESES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const adjustedDate = date.getDate() + dayOfWeek;
  return Math.ceil(adjustedDate / 7);
}

export function MantenimientosSemanaView({
  mantenimientos,
  elementos,
  onCambiarEstado,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Obtener año, mes y semana actual
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth(); // 0-11
  const currentWeek = getWeekOfMonth(selectedDate);
  const mesKey = MESES[currentMonth];

  // Crear mapa de elementos para acceso rápido
  const elementosMap = useMemo(() => {
    const map = new Map<number, ElementoOption>();
    elementos.forEach(e => map.set(e.id, e));
    return map;
  }, [elementos]);

  // Filtrar mantenimientos de la semana actual
  const mantenimientosSemana = useMemo(() => {
    const semanaKey = `${mesKey}_semana${currentWeek}` as keyof MantenimientoProgramado;
    
    return mantenimientos.filter(m => {
      if (m.año !== currentYear) return false;
      return m[semanaKey] === true;
    });
  }, [mantenimientos, currentYear, mesKey, currentWeek]);

  // Separar por estado
  const { pendientes, realizados, aplazados } = useMemo(() => {
    const pendientes: MantenimientoProgramado[] = [];
    const realizados: MantenimientoProgramado[] = [];
    const aplazados: MantenimientoProgramado[] = [];

    mantenimientosSemana.forEach(m => {
      if (m.estado === "PENDIENTE") pendientes.push(m);
      else if (m.estado === "REALIZADO") realizados.push(m);
      else if (m.estado === "APLAZADO") aplazados.push(m);
    });

    return { pendientes, realizados, aplazados };
  }, [mantenimientosSemana]);

  const handleCambiarEstado = async (id: number, estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO") => {
    if (!onCambiarEstado) return;
    setLoadingId(id);
    try {
      await onCambiarEstado(id, estado);
    } finally {
      setLoadingId(null);
    }
  };

  // Navegación de semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Obtener rango de fechas de la semana
  const getWeekRange = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day + (day === 0 ? -6 : 1)); // Lunes
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Domingo

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const MantenimientoCard = ({ mantenimiento }: { mantenimiento: MantenimientoProgramado }) => {
    const elemento = elementosMap.get(mantenimiento.elemento_id);
    const isLoading = loadingId === mantenimiento.id;

    const getEstadoBadge = () => {
      switch (mantenimiento.estado) {
        case "PENDIENTE":
          return <Badge className="bg-yellow-500 text-black">Pendiente</Badge>;
        case "REALIZADO":
          return <Badge className="bg-cyan-500 text-white">Realizado</Badge>;
        case "APLAZADO":
          return <Badge className="bg-red-500 text-white">Aplazado</Badge>;
        default:
          return <Badge variant="secondary">{mantenimiento.estado}</Badge>;
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {elemento?.serie || `ID: ${mantenimiento.elemento_id}`}
              </div>
              {elemento?.marca && (
                <div className="text-sm text-muted-foreground truncate">
                  {elemento.marca} {elemento.modelo && `- ${elemento.modelo}`}
                </div>
              )}
              {elemento?.ubicacion_rel && (
                <div className="text-xs text-muted-foreground mt-1">
                  📍 {elemento.ubicacion_rel.nombre}
                  {elemento.ubicacion_rel.sede && ` (${elemento.ubicacion_rel.sede.nombre})`}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {getEstadoBadge()}
                <span className="text-xs text-muted-foreground">
                  {mantenimiento.frecuencia}
                </span>
              </div>
              {mantenimiento.observaciones && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {mantenimiento.observaciones}
                </p>
              )}
            </div>

            {/* Acciones rápidas */}
            {mantenimiento.estado === "PENDIENTE" && onCambiarEstado && (
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                  disabled={isLoading}
                  onClick={() => handleCambiarEstado(mantenimiento.id, "REALIZADO")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Hecho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  disabled={isLoading}
                  onClick={() => handleCambiarEstado(mantenimiento.id, "APLAZADO")}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Aplazar
                </Button>
              </div>
            )}

            {mantenimiento.estado !== "PENDIENTE" && onCambiarEstado && (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleCambiarEstado(mantenimiento.id, "PENDIENTE")}
              >
                Restaurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {MESES_NOMBRES[currentMonth]} {currentYear} - Semana {currentWeek}
          </h2>
          <p className="text-sm text-muted-foreground">{getWeekRange()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{pendientes.length}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-cyan-500" />
              <div>
                <div className="text-2xl font-bold">{realizados.length}</div>
                <div className="text-sm text-muted-foreground">Realizados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{aplazados.length}</div>
                <div className="text-sm text-muted-foreground">Aplazados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de mantenimientos */}
      {mantenimientosSemana.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No hay mantenimientos esta semana</p>
              <p className="text-sm">Selecciona otra semana o revisa el cronograma</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pendientes primero */}
          {pendientes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pendientes ({pendientes.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendientes.map(m => (
                  <MantenimientoCard key={m.id} mantenimiento={m} />
                ))}
              </div>
            </div>
          )}

          {/* Realizados */}
          {realizados.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-cyan-600 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Realizados ({realizados.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {realizados.map(m => (
                  <MantenimientoCard key={m.id} mantenimiento={m} />
                ))}
              </div>
            </div>
          )}

          {/* Aplazados */}
          {aplazados.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-red-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aplazados ({aplazados.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {aplazados.map(m => (
                  <MantenimientoCard key={m.id} mantenimiento={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


