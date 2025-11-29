"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { ElementoSearchSelect } from "../ui/elemento-search-select";
import { DatePicker } from "../ui/date-picker";
import type { HojaVida } from "../../modules/hojas_vida/types";
import type { Elemento } from "../../modules/elementos/types";

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  elemento_id: z.string().min(1, "Selecciona elemento"),
  fecha_dilegenciamiento: z.string().min(1, "Fecha requerida"),
  tipo_elemento: z.enum(["EQUIPO", "RECURSO_DIDACTICO"]),
  area_ubicacion: z.string().optional(),
  responsable: z.string().optional(),
  descripcion: z.string().optional(),
  requerimientos_funcionamiento: z.string().optional(),
  requerimientos_seguridad: z.string().optional(),
  rutina_mantenimiento: z.enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).optional().or(z.literal("")),
  fecha_actualizacion: z.string().optional(),
  activo: z.boolean(),
});

type HojaVidaFormData = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };
type ElementoOption = Elemento & {
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel?: {
    id: number;
    codigo: string;
    nombre: string;
    sede?: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<HojaVida>;
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function HojaVidaUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  hiddenFields,
  onClose,
}: Props) {
  const [open, setOpen] = useState(!defaultValues);

  // Obtener el elemento seleccionado para pre-llenar los filtros
  const elementoSeleccionado = defaultValues?.elemento_id
    ? elementos.find((e) => e.id === defaultValues.elemento_id)
    : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HojaVidaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: elementoSeleccionado?.ubicacion_rel?.sede?.id?.toString() || "",
      ubicacion_id: elementoSeleccionado?.ubicacion_id?.toString() || "",
      categoria_id: elementoSeleccionado?.categoria_id?.toString() || "",
      subcategoria_id: elementoSeleccionado?.subcategoria_id?.toString() || "",
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      fecha_dilegenciamiento: defaultValues?.fecha_dilegenciamiento
        ? new Date(defaultValues.fecha_dilegenciamiento).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo_elemento: defaultValues?.tipo_elemento || "EQUIPO",
      area_ubicacion: defaultValues?.area_ubicacion || "",
      responsable: defaultValues?.responsable || "",
      descripcion: defaultValues?.descripcion || "",
      requerimientos_funcionamiento: defaultValues?.requerimientos_funcionamiento || "",
      requerimientos_seguridad: defaultValues?.requerimientos_seguridad || "",
      rutina_mantenimiento: defaultValues?.rutina_mantenimiento || "",
      fecha_actualizacion: defaultValues?.fecha_actualizacion
        ? new Date(defaultValues.fecha_actualizacion).toISOString().split("T")[0]
        : "",
      activo: defaultValues?.activo ?? true,
    },
  });

  // Estados para las fechas
  const [fechaDiligenciamiento, setFechaDiligenciamiento] = useState<Date | undefined>(
    defaultValues?.fecha_dilegenciamiento 
      ? new Date(defaultValues.fecha_dilegenciamiento) 
      : new Date()
  );
  const [fechaActualizacion, setFechaActualizacion] = useState<Date | undefined>(
    defaultValues?.fecha_actualizacion 
      ? new Date(defaultValues.fecha_actualizacion) 
      : undefined
  );

  // Filtrar ubicaciones por sede seleccionada
  const selectedSedeId = watch("sede_id");
  const filteredUbicaciones = ubicaciones.filter(
    (u) => u.sede_id === parseInt(selectedSedeId || "0")
  );

  // Filtrar subcategorías por categoría seleccionada
  const selectedCategoriaId = watch("categoria_id");
  const filteredSubcategorias = subcategorias.filter(
    (sub) => sub.categoria_id === parseInt(selectedCategoriaId || "0")
  );

  // Filtrar elementos por todas las selecciones
  const selectedUbicacionId = watch("ubicacion_id");
  const selectedSubcategoriaId = watch("subcategoria_id");
  
  const filteredElementos = elementos.filter((elemento) => {
    const matchUbicacion = !selectedUbicacionId || elemento.ubicacion_id === parseInt(selectedUbicacionId);
    const matchCategoria = !selectedCategoriaId || elemento.categoria_id === parseInt(selectedCategoriaId);
    const matchSubcategoria = !selectedSubcategoriaId || elemento.subcategoria_id === parseInt(selectedSubcategoriaId);
    return matchUbicacion && matchCategoria && matchSubcategoria;
  });

  useEffect(() => {
    if (defaultValues) {
      const elemento = elementos.find((e) => e.id === defaultValues.elemento_id);
      
      // Actualizar estados de fecha
      setFechaDiligenciamiento(
        defaultValues.fecha_dilegenciamiento 
          ? new Date(defaultValues.fecha_dilegenciamiento) 
          : new Date()
      );
      setFechaActualizacion(
        defaultValues.fecha_actualizacion 
          ? new Date(defaultValues.fecha_actualizacion) 
          : undefined
      );

      reset({
        sede_id: elemento?.ubicacion_rel?.sede?.id?.toString() || "",
        ubicacion_id: elemento?.ubicacion_id?.toString() || "",
        categoria_id: elemento?.categoria_id?.toString() || "",
        subcategoria_id: elemento?.subcategoria_id?.toString() || "",
        elemento_id: defaultValues.elemento_id?.toString() || "",
        fecha_dilegenciamiento: defaultValues.fecha_dilegenciamiento
          ? new Date(defaultValues.fecha_dilegenciamiento).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo_elemento: defaultValues.tipo_elemento || "EQUIPO",
        area_ubicacion: defaultValues.area_ubicacion || "",
        responsable: defaultValues.responsable || "",
        descripcion: defaultValues.descripcion || "",
        requerimientos_funcionamiento: defaultValues.requerimientos_funcionamiento || "",
        requerimientos_seguridad: defaultValues.requerimientos_seguridad || "",
        rutina_mantenimiento: defaultValues.rutina_mantenimiento || "",
        fecha_actualizacion: defaultValues.fecha_actualizacion
          ? new Date(defaultValues.fecha_actualizacion).toISOString().split("T")[0]
          : "",
        activo: defaultValues.activo ?? true,
      });
    }
  }, [defaultValues, reset, elementos]);

  const onSubmit = async (data: HojaVidaFormData) => {
    try {
      const formData = new FormData();

      formData.append("elemento_id", data.elemento_id);
      
      // Convertir fecha de diligenciamiento al formato correcto
      if (fechaDiligenciamiento) {
        formData.append("fecha_dilegenciamiento", fechaDiligenciamiento.toISOString().split("T")[0]);
      }
      
      formData.append("tipo_elemento", data.tipo_elemento);
      if (data.area_ubicacion) formData.append("area_ubicacion", data.area_ubicacion);
      if (data.responsable) formData.append("responsable", data.responsable);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      if (data.requerimientos_funcionamiento) formData.append("requerimientos_funcionamiento", data.requerimientos_funcionamiento);
      if (data.requerimientos_seguridad) formData.append("requerimientos_seguridad", data.requerimientos_seguridad);
      if (data.rutina_mantenimiento) formData.append("rutina_mantenimiento", data.rutina_mantenimiento);
      
      // Convertir fecha de actualización al formato correcto
      if (fechaActualizacion) {
        formData.append("fecha_actualizacion", fechaActualizacion.toISOString().split("T")[0]);
      }
      
      formData.append("activo", String(data.activo));

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando hoja de vida..." : "Actualizando hoja de vida...",
        success: create
          ? "Hoja de vida creada exitosamente"
          : "Hoja de vida actualizada exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear Hoja de Vida" : "Editar Hoja de Vida";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      {create && (
        <Button onClick={() => setOpen(true)}>{btnText}</Button>
      )}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && onClose) onClose();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Sede */}
            <div className="grid gap-1">
              <Label htmlFor="sede_id">Sede</Label>
              <Select
                value={watch("sede_id")}
                onValueChange={(value) => {
                  setValue("sede_id", value);
                  setValue("ubicacion_id", ""); // Reset ubicación al cambiar sede
                  setValue("categoria_id", ""); // Reset categoría
                  setValue("subcategoria_id", ""); // Reset subcategoría
                  setValue("elemento_id", ""); // Reset elemento
                }}
                disabled={sedes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    sedes.length === 0 
                      ? "No hay sedes disponibles" 
                      : "Selecciona sede"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sedes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay sedes disponibles</p>
                      <p className="text-xs mt-1">
                        Crea sedes en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre} - {sede.ciudad}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.sede_id && (
                <p className="text-red-500 text-sm">{errors.sede_id.message}</p>
              )}
            </div>

            {/* Ubicación */}
            <div className="grid gap-1">
              <Label htmlFor="ubicacion_id">Ubicación</Label>
              <Select
                value={watch("ubicacion_id") || undefined}
                onValueChange={(value) => {
                  setValue("ubicacion_id", value || "");
                  setValue("categoria_id", ""); // Reset categoría
                  setValue("subcategoria_id", ""); // Reset subcategoría
                  setValue("elemento_id", ""); // Reset elemento
                }}
                disabled={!selectedSedeId || filteredUbicaciones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedSedeId 
                      ? "Primero selecciona una sede" 
                      : filteredUbicaciones.length === 0 
                        ? "No hay ubicaciones disponibles" 
                        : "Selecciona ubicación"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedSedeId 
                          ? "Selecciona una sede primero" 
                          : "No hay ubicaciones disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedSedeId 
                          ? "Debes seleccionar una sede para ver sus ubicaciones" 
                          : "Crea ubicaciones para esta sede en la configuración"}
                      </p>
                    </div>
                  ) : (
                    filteredUbicaciones.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.codigo} - {u.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && (
                <p className="text-red-500 text-sm">{errors.ubicacion_id.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="grid gap-1">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(value) => {
                  setValue("categoria_id", value);
                  setValue("subcategoria_id", ""); // Reset subcategoría
                  setValue("elemento_id", ""); // Reset elemento
                }}
                disabled={categorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    categorias.length === 0 
                      ? "No hay categorías disponibles" 
                      : "Selecciona categoría"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay categorías disponibles</p>
                      <p className="text-xs mt-1">
                        Crea categorías en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoria_id && (
                <p className="text-red-500 text-sm">{errors.categoria_id.message}</p>
              )}
            </div>

            {/* Subcategoría */}
            <div className="grid gap-1">
              <Label htmlFor="subcategoria_id">Subcategoría</Label>
              <Select
                value={watch("subcategoria_id") || undefined}
                onValueChange={(value) => {
                  setValue("subcategoria_id", value || "");
                  setValue("elemento_id", ""); // Reset elemento
                }}
                disabled={!selectedCategoriaId || filteredSubcategorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedCategoriaId 
                      ? "Primero selecciona una categoría" 
                      : filteredSubcategorias.length === 0 
                        ? "No hay subcategorías (opcional)" 
                        : "Selecciona subcategoría (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedCategoriaId 
                          ? "Selecciona una categoría primero" 
                          : "No hay subcategorías disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedCategoriaId 
                          ? "Debes seleccionar una categoría para ver sus subcategorías" 
                          : "Este campo es opcional, puedes continuar sin seleccionar"}
                      </p>
                    </div>
                  ) : (
                    filteredSubcategorias.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Elemento con búsqueda */}
            <ElementoSearchSelect
              elementos={filteredElementos}
              value={watch("elemento_id") || undefined}
              onValueChange={(value) => setValue("elemento_id", value)}
              label="Elemento"
              placeholder="Buscar por ID, código, serie, marca o modelo..."
              disabled={!selectedUbicacionId || !selectedCategoriaId}
              error={errors.elemento_id?.message}
            />

            {/* Fecha Diligenciamiento y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="fecha_dilegenciamiento">Fecha Diligenciamiento</Label>
                <DatePicker
                  date={fechaDiligenciamiento}
                  onDateChange={(date) => {
                    setFechaDiligenciamiento(date);
                    if (date) {
                      setValue("fecha_dilegenciamiento", date.toISOString().split("T")[0]);
                    }
                  }}
                  placeholder="Selecciona fecha de diligenciamiento"
                />
                {errors.fecha_dilegenciamiento && (
                  <p className="text-red-500 text-sm">{errors.fecha_dilegenciamiento.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tipo_elemento">Tipo de Elemento</Label>
                <Select
                  value={watch("tipo_elemento")}
                  onValueChange={(value) => setValue("tipo_elemento", value as "EQUIPO" | "RECURSO_DIDACTICO")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQUIPO">Equipo</SelectItem>
                    <SelectItem value="RECURSO_DIDACTICO">Recurso Didáctico</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_elemento && (
                  <p className="text-red-500 text-sm">{errors.tipo_elemento.message}</p>
                )}
              </div>
            </div>

            {/* Área Ubicación y Responsable */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="area_ubicacion">Área de Ubicación</Label>
                <Input
                  id="area_ubicacion"
                  type="text"
                  placeholder="Área donde se ubica el elemento"
                  {...register("area_ubicacion")}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  type="text"
                  placeholder="Nombre del responsable"
                  {...register("responsable")}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del elemento..."
                {...register("descripcion")}
                rows={3}
              />
            </div>

            {/* Requerimientos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="requerimientos_funcionamiento">Requerimientos de Funcionamiento</Label>
                <Textarea
                  id="requerimientos_funcionamiento"
                  placeholder="Requerimientos para el funcionamiento..."
                  {...register("requerimientos_funcionamiento")}
                  rows={3}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="requerimientos_seguridad">Requerimientos de Seguridad</Label>
                <Textarea
                  id="requerimientos_seguridad"
                  placeholder="Requerimientos de seguridad..."
                  {...register("requerimientos_seguridad")}
                  rows={3}
                />
              </div>
            </div>

            {/* Rutina Mantenimiento y Fecha Actualización */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="rutina_mantenimiento">Rutina de Mantenimiento</Label>
                <Select
                  value={watch("rutina_mantenimiento") || "NONE"}
                  onValueChange={(value) => {
                    // Si se selecciona "NONE", establecer como cadena vacía para que sea null en el backend
                    setValue("rutina_mantenimiento", value === "NONE" ? "" : value as "" | "DIARIO" | "SEMANAL" | "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona frecuencia (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Sin rutina</SelectItem>
                    <SelectItem value="DIARIO">Diario</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="fecha_actualizacion">Fecha de Actualización (opcional)</Label>
                <DatePicker
                  date={fechaActualizacion}
                  onDateChange={(date) => {
                    setFechaActualizacion(date);
                    if (date) {
                      setValue("fecha_actualizacion", date.toISOString().split("T")[0]);
                    } else {
                      setValue("fecha_actualizacion", "");
                    }
                  }}
                  placeholder="Seleccionar fecha"
                />
              </div>
            </div>

            {/* Activo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={watch("activo")}
                onCheckedChange={(checked) => setValue("activo", checked)}
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Activo
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  if (onClose) onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

