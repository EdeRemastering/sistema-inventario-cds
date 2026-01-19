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
import { Checkbox } from "../ui/checkbox";
import { ElementoSearchSelect } from "../ui/elemento-search-select";
import type { MantenimientoProgramado } from "../../modules/mantenimientos/types";

type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
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

const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  elemento_id: z.string().min(1, "Selecciona elemento"),
  frecuencia: z.enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
  año: z.string().min(1, "Año requerido"),
  estado: z.enum(["PENDIENTE", "REALIZADO", "APLAZADO", "CANCELADO"]),
  observaciones: z.string().optional(),
  // Semanas de cada mes
  enero_semana1: z.boolean(),
  enero_semana2: z.boolean(),
  enero_semana3: z.boolean(),
  enero_semana4: z.boolean(),
  febrero_semana1: z.boolean(),
  febrero_semana2: z.boolean(),
  febrero_semana3: z.boolean(),
  febrero_semana4: z.boolean(),
  marzo_semana1: z.boolean(),
  marzo_semana2: z.boolean(),
  marzo_semana3: z.boolean(),
  marzo_semana4: z.boolean(),
  abril_semana1: z.boolean(),
  abril_semana2: z.boolean(),
  abril_semana3: z.boolean(),
  abril_semana4: z.boolean(),
  mayo_semana1: z.boolean(),
  mayo_semana2: z.boolean(),
  mayo_semana3: z.boolean(),
  mayo_semana4: z.boolean(),
  junio_semana1: z.boolean(),
  junio_semana2: z.boolean(),
  junio_semana3: z.boolean(),
  junio_semana4: z.boolean(),
  julio_semana1: z.boolean(),
  julio_semana2: z.boolean(),
  julio_semana3: z.boolean(),
  julio_semana4: z.boolean(),
  agosto_semana1: z.boolean(),
  agosto_semana2: z.boolean(),
  agosto_semana3: z.boolean(),
  agosto_semana4: z.boolean(),
  septiembre_semana1: z.boolean(),
  septiembre_semana2: z.boolean(),
  septiembre_semana3: z.boolean(),
  septiembre_semana4: z.boolean(),
  octubre_semana1: z.boolean(),
  octubre_semana2: z.boolean(),
  octubre_semana3: z.boolean(),
  octubre_semana4: z.boolean(),
  noviembre_semana1: z.boolean(),
  noviembre_semana2: z.boolean(),
  noviembre_semana3: z.boolean(),
  noviembre_semana4: z.boolean(),
  diciembre_semana1: z.boolean(),
  diciembre_semana2: z.boolean(),
  diciembre_semana3: z.boolean(),
  diciembre_semana4: z.boolean(),
});

type MantenimientoProgramadoFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<MantenimientoProgramado>;
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function MantenimientoProgramadoUpsertDialog({
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
  // Para crear: empieza cerrado (el botón lo abre)
  // Para editar: empieza abierto cuando hay defaultValues
  const [open, setOpen] = useState(false);

  // Abrir automáticamente cuando es modo edición y hay valores
  useEffect(() => {
    if (!create && defaultValues) {
      setOpen(true);
    }
  }, [create, defaultValues]);

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
  } = useForm<MantenimientoProgramadoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: elementoSeleccionado?.ubicacion_rel?.sede?.id?.toString() || "",
      ubicacion_id: elementoSeleccionado?.ubicacion_id?.toString() || "",
      categoria_id: elementoSeleccionado?.categoria_id?.toString() || "",
      subcategoria_id: elementoSeleccionado?.subcategoria_id?.toString() || "",
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      frecuencia: defaultValues?.frecuencia || "MENSUAL",
      año: defaultValues?.año?.toString() || new Date().getFullYear().toString(),
      estado: defaultValues?.estado || "PENDIENTE",
      observaciones: defaultValues?.observaciones || "",
      enero_semana1: defaultValues?.enero_semana1 || false,
      enero_semana2: defaultValues?.enero_semana2 || false,
      enero_semana3: defaultValues?.enero_semana3 || false,
      enero_semana4: defaultValues?.enero_semana4 || false,
      febrero_semana1: defaultValues?.febrero_semana1 || false,
      febrero_semana2: defaultValues?.febrero_semana2 || false,
      febrero_semana3: defaultValues?.febrero_semana3 || false,
      febrero_semana4: defaultValues?.febrero_semana4 || false,
      marzo_semana1: defaultValues?.marzo_semana1 || false,
      marzo_semana2: defaultValues?.marzo_semana2 || false,
      marzo_semana3: defaultValues?.marzo_semana3 || false,
      marzo_semana4: defaultValues?.marzo_semana4 || false,
      abril_semana1: defaultValues?.abril_semana1 || false,
      abril_semana2: defaultValues?.abril_semana2 || false,
      abril_semana3: defaultValues?.abril_semana3 || false,
      abril_semana4: defaultValues?.abril_semana4 || false,
      mayo_semana1: defaultValues?.mayo_semana1 || false,
      mayo_semana2: defaultValues?.mayo_semana2 || false,
      mayo_semana3: defaultValues?.mayo_semana3 || false,
      mayo_semana4: defaultValues?.mayo_semana4 || false,
      junio_semana1: defaultValues?.junio_semana1 || false,
      junio_semana2: defaultValues?.junio_semana2 || false,
      junio_semana3: defaultValues?.junio_semana3 || false,
      junio_semana4: defaultValues?.junio_semana4 || false,
      julio_semana1: defaultValues?.julio_semana1 || false,
      julio_semana2: defaultValues?.julio_semana2 || false,
      julio_semana3: defaultValues?.julio_semana3 || false,
      julio_semana4: defaultValues?.julio_semana4 || false,
      agosto_semana1: defaultValues?.agosto_semana1 || false,
      agosto_semana2: defaultValues?.agosto_semana2 || false,
      agosto_semana3: defaultValues?.agosto_semana3 || false,
      agosto_semana4: defaultValues?.agosto_semana4 || false,
      septiembre_semana1: defaultValues?.septiembre_semana1 || false,
      septiembre_semana2: defaultValues?.septiembre_semana2 || false,
      septiembre_semana3: defaultValues?.septiembre_semana3 || false,
      septiembre_semana4: defaultValues?.septiembre_semana4 || false,
      octubre_semana1: defaultValues?.octubre_semana1 || false,
      octubre_semana2: defaultValues?.octubre_semana2 || false,
      octubre_semana3: defaultValues?.octubre_semana3 || false,
      octubre_semana4: defaultValues?.octubre_semana4 || false,
      noviembre_semana1: defaultValues?.noviembre_semana1 || false,
      noviembre_semana2: defaultValues?.noviembre_semana2 || false,
      noviembre_semana3: defaultValues?.noviembre_semana3 || false,
      noviembre_semana4: defaultValues?.noviembre_semana4 || false,
      diciembre_semana1: defaultValues?.diciembre_semana1 || false,
      diciembre_semana2: defaultValues?.diciembre_semana2 || false,
      diciembre_semana3: defaultValues?.diciembre_semana3 || false,
      diciembre_semana4: defaultValues?.diciembre_semana4 || false,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const elemento = elementos.find((e) => e.id === defaultValues.elemento_id);
      reset({
        sede_id: elemento?.ubicacion_rel?.sede?.id?.toString() || "",
        ubicacion_id: elemento?.ubicacion_id?.toString() || "",
        categoria_id: elemento?.categoria_id?.toString() || "",
        subcategoria_id: elemento?.subcategoria_id?.toString() || "",
        elemento_id: defaultValues.elemento_id?.toString() || "",
        frecuencia: defaultValues.frecuencia || "MENSUAL",
        año: defaultValues.año?.toString() || new Date().getFullYear().toString(),
        estado: defaultValues.estado || "PENDIENTE",
        observaciones: defaultValues.observaciones || "",
        enero_semana1: defaultValues.enero_semana1 || false,
        enero_semana2: defaultValues.enero_semana2 || false,
        enero_semana3: defaultValues.enero_semana3 || false,
        enero_semana4: defaultValues.enero_semana4 || false,
        febrero_semana1: defaultValues.febrero_semana1 || false,
        febrero_semana2: defaultValues.febrero_semana2 || false,
        febrero_semana3: defaultValues.febrero_semana3 || false,
        febrero_semana4: defaultValues.febrero_semana4 || false,
        marzo_semana1: defaultValues.marzo_semana1 || false,
        marzo_semana2: defaultValues.marzo_semana2 || false,
        marzo_semana3: defaultValues.marzo_semana3 || false,
        marzo_semana4: defaultValues.marzo_semana4 || false,
        abril_semana1: defaultValues.abril_semana1 || false,
        abril_semana2: defaultValues.abril_semana2 || false,
        abril_semana3: defaultValues.abril_semana3 || false,
        abril_semana4: defaultValues.abril_semana4 || false,
        mayo_semana1: defaultValues.mayo_semana1 || false,
        mayo_semana2: defaultValues.mayo_semana2 || false,
        mayo_semana3: defaultValues.mayo_semana3 || false,
        mayo_semana4: defaultValues.mayo_semana4 || false,
        junio_semana1: defaultValues.junio_semana1 || false,
        junio_semana2: defaultValues.junio_semana2 || false,
        junio_semana3: defaultValues.junio_semana3 || false,
        junio_semana4: defaultValues.junio_semana4 || false,
        julio_semana1: defaultValues.julio_semana1 || false,
        julio_semana2: defaultValues.julio_semana2 || false,
        julio_semana3: defaultValues.julio_semana3 || false,
        julio_semana4: defaultValues.julio_semana4 || false,
        agosto_semana1: defaultValues.agosto_semana1 || false,
        agosto_semana2: defaultValues.agosto_semana2 || false,
        agosto_semana3: defaultValues.agosto_semana3 || false,
        agosto_semana4: defaultValues.agosto_semana4 || false,
        septiembre_semana1: defaultValues.septiembre_semana1 || false,
        septiembre_semana2: defaultValues.septiembre_semana2 || false,
        septiembre_semana3: defaultValues.septiembre_semana3 || false,
        septiembre_semana4: defaultValues.septiembre_semana4 || false,
        octubre_semana1: defaultValues.octubre_semana1 || false,
        octubre_semana2: defaultValues.octubre_semana2 || false,
        octubre_semana3: defaultValues.octubre_semana3 || false,
        octubre_semana4: defaultValues.octubre_semana4 || false,
        noviembre_semana1: defaultValues.noviembre_semana1 || false,
        noviembre_semana2: defaultValues.noviembre_semana2 || false,
        noviembre_semana3: defaultValues.noviembre_semana3 || false,
        noviembre_semana4: defaultValues.noviembre_semana4 || false,
        diciembre_semana1: defaultValues.diciembre_semana1 || false,
        diciembre_semana2: defaultValues.diciembre_semana2 || false,
        diciembre_semana3: defaultValues.diciembre_semana3 || false,
        diciembre_semana4: defaultValues.diciembre_semana4 || false,
      });
    }
  }, [defaultValues, reset, elementos]);

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

  const onSubmit = async (data: MantenimientoProgramadoFormData) => {
    try {
      const formData = new FormData();

      formData.append("elemento_id", data.elemento_id);
      formData.append("frecuencia", data.frecuencia);
      formData.append("año", data.año);
      formData.append("estado", data.estado);
      if (data.observaciones) formData.append("observaciones", data.observaciones);

      // Agregar todas las semanas
      meses.forEach((mes) => {
        for (let i = 1; i <= 4; i++) {
          const fieldName = `${mes}_semana${i}` as keyof MantenimientoProgramadoFormData;
          formData.append(fieldName, String(data[fieldName] || false));
        }
      });

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando mantenimiento..." : "Actualizando mantenimiento...",
        success: create
          ? "Mantenimiento programado creado exitosamente"
          : "Mantenimiento programado actualizado exitosamente",
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
  const title = create ? "Crear Mantenimiento Programado" : "Editar Mantenimiento Programado";
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  setValue("ubicacion_id", "");
                  setValue("categoria_id", "");
                  setValue("subcategoria_id", "");
                  setValue("elemento_id", "");
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
                  setValue("categoria_id", "");
                  setValue("subcategoria_id", "");
                  setValue("elemento_id", "");
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
                  setValue("subcategoria_id", "");
                  setValue("elemento_id", "");
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
                  setValue("elemento_id", "");
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

            {/* Frecuencia y Año */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="frecuencia">Frecuencia</Label>
                <Select
                  value={watch("frecuencia")}
                  onValueChange={(value) => setValue("frecuencia", value as "DIARIO" | "SEMANAL" | "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIARIO">Diario</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frecuencia && (
                  <p className="text-red-500 text-sm">{errors.frecuencia.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  type="number"
                  min="2020"
                  max="2100"
                  {...register("año")}
                />
                {errors.año && (
                  <p className="text-red-500 text-sm">{errors.año.message}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="grid gap-1">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={watch("estado")}
                onValueChange={(value) => setValue("estado", value as "PENDIENTE" | "REALIZADO")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="REALIZADO">Ejecutado</SelectItem>
                  <SelectItem value="APLAZADO">Aplazado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-red-500 text-sm">{errors.estado.message}</p>
              )}
            </div>

            {/* Programación por Meses - Grid de 12 meses x 4 semanas */}
            <div className="grid gap-4">
              <Label>Programación Mensual (Selecciona las semanas)</Label>
              <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                {meses.map((mes) => (
                  <div key={mes} className="space-y-2">
                    <Label className="font-semibold capitalize">{mes}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((semana) => {
                        const fieldName = `${mes}_semana${semana}` as keyof MantenimientoProgramadoFormData;
                        return (
                          <div key={semana} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${mes}_semana${semana}`}
                              checked={Boolean(watch(fieldName))}
                              onCheckedChange={(checked) =>
                                setValue(fieldName, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`${mes}_semana${semana}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              Sem {semana}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div className="grid gap-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                {...register("observaciones")}
                rows={3}
              />
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

