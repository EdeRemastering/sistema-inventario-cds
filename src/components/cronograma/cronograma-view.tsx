"use client";

import { useState, useMemo, useTransition } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import type { MantenimientoProgramado } from "../../modules/mantenimientos/types";

type SedeOption = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
};

type UbicacionOption = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
};

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel: {
    id: number;
    codigo: string;
    nombre: string;
    sede: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};

type Props = {
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  elementos: ElementoOption[];
  mantenimientos: MantenimientoProgramado[];
  categorias?: { id: number; nombre: string }[];
  onCreateMantenimiento: (formData: FormData) => Promise<void>;
  onUpdateMantenimiento: (formData: FormData) => Promise<void>;
  onDeleteMantenimiento: (id: number) => Promise<void>;
};

const MESES = [
  { key: "enero", nombre: "ENERO", short: "ENE" },
  { key: "febrero", nombre: "FEBRERO", short: "FEB" },
  { key: "marzo", nombre: "MARZO", short: "MAR" },
  { key: "abril", nombre: "ABRIL", short: "ABR" },
  { key: "mayo", nombre: "MAYO", short: "MAY" },
  { key: "junio", nombre: "JUNIO", short: "JUN" },
  { key: "julio", nombre: "JULIO", short: "JUL" },
  { key: "agosto", nombre: "AGOSTO", short: "AGO" },
  { key: "septiembre", nombre: "SEPTIEMBRE", short: "SEP" },
  { key: "octubre", nombre: "OCTUBRE", short: "OCT" },
  { key: "noviembre", nombre: "NOVIEMBRE", short: "NOV" },
  { key: "diciembre", nombre: "DICIEMBRE", short: "DIC" },
];

const FRECUENCIAS = [
  { value: "DIARIO", label: "Diario" },
  { value: "SEMANAL", label: "Semanal" },
  { value: "MENSUAL", label: "Mensual" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-gray-200" },
  { value: "REALIZADO", label: "Realizado", color: "bg-cyan-400" },
  { value: "APLAZADO", label: "Aplazado", color: "bg-red-500" },
  { value: "CANCELADO", label: "Cancelado", color: "bg-gray-400" },
];

export function CronogramaView({
  sedes,
  ubicaciones,
  elementos,
  mantenimientos,
  onCreateMantenimiento,
  onUpdateMantenimiento,
  onDeleteMantenimiento,
}: Props) {
  const [selectedSedeId, setSelectedSedeId] = useState<string>("");
  const [selectedUbicacionId, setSelectedUbicacionId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedElemento, setSelectedElemento] = useState<ElementoOption | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoProgramado | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estado para el formulario
  const [formSemanas, setFormSemanas] = useState<Record<string, boolean>>({});
  const [formFrecuencia, setFormFrecuencia] = useState<string>("TRIMESTRAL");
  const [formObservaciones, setFormObservaciones] = useState<string>("");

  // Filtrar ubicaciones por sede
  const filteredUbicaciones = useMemo(() => {
    if (!selectedSedeId) return [];
    return ubicaciones.filter(u => u.sede_id === parseInt(selectedSedeId));
  }, [ubicaciones, selectedSedeId]);

  // Filtrar elementos por ubicación
  const filteredElementos = useMemo(() => {
    if (!selectedUbicacionId) return [];
    return elementos.filter(e => e.ubicacion_id === parseInt(selectedUbicacionId));
  }, [elementos, selectedUbicacionId]);

  // Obtener mantenimientos del año seleccionado
  const mantenimientosDelAno = useMemo(() => {
    return mantenimientos.filter(m => m.año === selectedYear);
  }, [mantenimientos, selectedYear]);

  // Crear mapa de mantenimientos por elemento
  const mantenimientosMap = useMemo(() => {
    const map = new Map<number, MantenimientoProgramado>();
    mantenimientosDelAno.forEach(m => {
      map.set(m.elemento_id, m);
    });
    return map;
  }, [mantenimientosDelAno]);

  // Obtener ubicación seleccionada
  const ubicacionSeleccionada = useMemo(() => {
    return ubicaciones.find(u => u.id.toString() === selectedUbicacionId);
  }, [ubicaciones, selectedUbicacionId]);

  const handleElementoClick = (elemento: ElementoOption) => {
    const mantenimiento = mantenimientosMap.get(elemento.id);
    setSelectedElemento(elemento);
    setSelectedMantenimiento(mantenimiento || null);
    
    if (mantenimiento) {
      const semanas: Record<string, boolean> = {};
      MESES.forEach(mes => {
        [1, 2, 3, 4].forEach(semana => {
          const key = `${mes.key}_semana${semana}`;
          semanas[key] = mantenimiento[key as keyof MantenimientoProgramado] as boolean;
        });
      });
      setFormSemanas(semanas);
      setFormFrecuencia(mantenimiento.frecuencia);
      setFormObservaciones(mantenimiento.observaciones || "");
    } else {
      const semanas: Record<string, boolean> = {};
      MESES.forEach(mes => {
        [1, 2, 3, 4].forEach(semana => {
          semanas[`${mes.key}_semana${semana}`] = false;
        });
      });
      setFormSemanas(semanas);
      setFormFrecuencia("TRIMESTRAL");
      setFormObservaciones("");
    }
    
    setIsDialogOpen(true);
  };

  const toggleSemana = (mesKey: string, semana: number) => {
    const key = `${mesKey}_semana${semana}`;
    setFormSemanas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!selectedElemento) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("elemento_id", selectedElemento.id.toString());
      formData.append("año", selectedYear.toString());
      formData.append("frecuencia", formFrecuencia);
      formData.append("estado", selectedMantenimiento?.estado || "PENDIENTE");
      formData.append("observaciones", formObservaciones);

      Object.entries(formSemanas).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      try {
        if (selectedMantenimiento) {
          formData.append("id", selectedMantenimiento.id.toString());
          await toast.promise(onUpdateMantenimiento(formData), {
            loading: "Actualizando cronograma...",
            success: "Cronograma actualizado",
            error: "Error al actualizar",
          });
        } else {
          await toast.promise(onCreateMantenimiento(formData), {
            loading: "Creando cronograma...",
            success: "Cronograma creado",
            error: "Error al crear",
          });
        }
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedMantenimiento) return;

    startTransition(async () => {
      try {
        await toast.promise(onDeleteMantenimiento(selectedMantenimiento.id), {
          loading: "Eliminando cronograma...",
          success: "Cronograma eliminado",
          error: "Error al eliminar",
        });
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  // Obtener color de celda según estado
  const getCellColor = (mantenimiento: MantenimientoProgramado | undefined, mesKey: string, semana: number): string => {
    if (!mantenimiento) return "";
    
    const key = `${mesKey}_semana${semana}` as keyof MantenimientoProgramado;
    const isMarked = mantenimiento[key] as boolean;
    
    if (!isMarked) return "";
    
    switch (mantenimiento.estado) {
      case "REALIZADO":
        return "bg-cyan-400";
      case "APLAZADO":
        return "bg-red-500";
      case "CANCELADO":
        return "bg-gray-400";
      default:
        return "bg-yellow-400"; // PENDIENTE = Programado
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Cronograma de Mantenimientos
        </h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 min-w-[200px]">
              <Label>Sede</Label>
              <Select value={selectedSedeId} onValueChange={(v) => {
                setSelectedSedeId(v);
                setSelectedUbicacionId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map(sede => (
                    <SelectItem key={sede.id} value={sede.id.toString()}>
                      {sede.nombre} - {sede.ciudad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 min-w-[200px]">
              <Label>Ubicación</Label>
              <Select 
                value={selectedUbicacionId} 
                onValueChange={setSelectedUbicacionId}
                disabled={!selectedSedeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedSedeId ? "Selecciona ubicación" : "Primero selecciona sede"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.map(ubicacion => (
                    <SelectItem key={ubicacion.id} value={ubicacion.id.toString()}>
                      {ubicacion.codigo} - {ubicacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Año</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setSelectedYear(y => y - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-bold text-lg">{selectedYear}</span>
                <Button variant="outline" size="icon" onClick={() => setSelectedYear(y => y + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Leyenda */}
            <div className="ml-auto flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 border border-yellow-500"></div>
                <span>Programados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-400 border border-cyan-500"></div>
                <span>Realizados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border border-red-600"></div>
                <span>Aplazados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma estilo Excel */}
      {selectedUbicacionId ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 bg-[#92D050] text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold">AÑO:</span>
                <span className="font-bold text-xl">{selectedYear}</span>
              </div>
              <Badge variant="secondary" className="bg-white text-black">
                {filteredElementos.length} elementos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {filteredElementos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay elementos en esta ubicación</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-xs">
                <thead>
                  {/* Primera fila: Headers principales y meses */}
                  <tr className="bg-[#FFFF99]">
                    <th rowSpan={2} className="border border-black p-1 font-bold text-center w-8 bg-[#92D050]">
                      <div className="writing-mode-vertical transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        ÁREA
                      </div>
                    </th>
                    <th rowSpan={2} className="border border-black p-1 font-bold text-center min-w-[120px] bg-[#FFFF99]">
                      ELEMENTO DE LA<br/>INFRAESTRUCTURA O<br/>RECURSO DIDÁCTICO
                    </th>
                    <th rowSpan={2} className="border border-black p-1 font-bold text-center min-w-[100px] bg-[#FFFF99]">
                      CÓDIGO
                    </th>
                    <th rowSpan={2} className="border border-black p-1 font-bold text-center w-20 bg-[#FFFF99]">
                      FRECUENCIA
                    </th>
                    {MESES.map(mes => (
                      <th key={mes.key} colSpan={4} className="border border-black p-1 font-bold text-center bg-[#FFFF99]">
                        {mes.short}
                      </th>
                    ))}
                    <th rowSpan={2} className="border border-black p-1 font-bold text-center min-w-[150px] bg-[#FFFF99]">
                      OBSERVACIONES
                    </th>
                  </tr>
                  {/* Segunda fila: Semanas */}
                  <tr className="bg-[#FFFF99]">
                    {MESES.map(mes => (
                      [1, 2, 3, 4].map(semana => (
                        <th key={`${mes.key}-${semana}`} className="border border-black p-0.5 font-bold text-center w-5 bg-[#FFFF99]">
                          {semana}
                        </th>
                      ))
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredElementos.map((elemento, index) => {
                    const mantenimiento = mantenimientosMap.get(elemento.id);
                    
                    return (
                      <tr 
                        key={elemento.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleElementoClick(elemento)}
                      >
                        {/* Área - solo en primera fila con rowSpan */}
                        {index === 0 && (
                          <td 
                            rowSpan={filteredElementos.length} 
                            className="border border-black p-1 bg-[#FFFF99] font-bold text-center align-middle"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            {ubicacionSeleccionada?.nombre.toUpperCase()}
                          </td>
                        )}
                        {/* Tipo de elemento */}
                        <td className="border border-black p-1 bg-[#FFFF99] font-medium">
                          {elemento.marca?.toUpperCase() || "EQUIPO"}
                        </td>
                        {/* Código */}
                        <td className="border border-black p-1 bg-[#FFFF99]">
                          {elemento.serie}
                        </td>
                        {/* Frecuencia */}
                        <td className="border border-black p-1 text-center bg-[#FFFF99]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {mantenimiento?.frecuencia || "-"}
                        </td>
                        {/* Celdas de semanas */}
                        {MESES.map(mes => (
                          [1, 2, 3, 4].map(semana => {
                            const cellColor = getCellColor(mantenimiento, mes.key, semana);
                            return (
                              <td 
                                key={`${mes.key}-${semana}`}
                                className={`border border-black p-0 w-5 h-6 ${cellColor}`}
                              >
                                &nbsp;
                              </td>
                            );
                          })
                        ))}
                        {/* Observaciones */}
                        <td className="border border-black p-1 text-xs bg-white">
                          {mantenimiento?.observaciones || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Selecciona una sede y ubicación</p>
              <p className="text-sm">para ver el cronograma de mantenimientos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para configurar cronograma */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurar Cronograma - {selectedYear}
            </DialogTitle>
            <DialogDescription>
              {selectedElemento && (
                <span className="font-medium">
                  {selectedElemento.serie} {selectedElemento.marca && `- ${selectedElemento.marca}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Frecuencia */}
            <div className="flex items-center gap-4">
              <Label className="min-w-[80px]">Frecuencia:</Label>
              <Select value={formFrecuencia} onValueChange={setFormFrecuencia}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRECUENCIAS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de meses y semanas estilo Excel */}
            <div className="border rounded overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFFF99]">
                    <th className="border border-black p-2 font-bold">MES</th>
                    <th className="border border-black p-2 font-bold text-center w-20">SEM 1</th>
                    <th className="border border-black p-2 font-bold text-center w-20">SEM 2</th>
                    <th className="border border-black p-2 font-bold text-center w-20">SEM 3</th>
                    <th className="border border-black p-2 font-bold text-center w-20">SEM 4</th>
                  </tr>
                </thead>
                <tbody>
                  {MESES.map((mes, i) => (
                    <tr key={mes.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-black p-2 font-medium bg-[#FFFF99]">
                        {mes.nombre}
                      </td>
                      {[1, 2, 3, 4].map(semana => {
                        const key = `${mes.key}_semana${semana}`;
                        const isChecked = formSemanas[key] || false;
                        
                        return (
                          <td 
                            key={semana}
                            className={`border border-black p-2 text-center cursor-pointer transition-colors ${
                              isChecked ? "bg-yellow-400" : "hover:bg-yellow-100"
                            }`}
                            onClick={() => toggleSemana(mes.key, semana)}
                          >
                            {isChecked && <Check className="h-5 w-5 mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={formObservaciones}
                onChange={(e) => setFormObservaciones(e.target.value)}
                placeholder="Ej: 18/03/2025 Se reprograma mantenimiento preventivo para el próximo período"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            {selectedMantenimiento && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Eliminar
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} className="bg-[#92D050] hover:bg-[#7BC043] text-black">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {selectedMantenimiento ? "Guardar Cambios" : "Crear Cronograma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
