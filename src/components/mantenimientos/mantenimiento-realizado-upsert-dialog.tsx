"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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
import { ElementoSearchSelect } from "../ui/elemento-search-select";
import type { MantenimientoRealizado } from "../../modules/mantenimientos/types";

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

/**
 * En creación, el "responsable" debe ser el usuario autenticado.
 * Nota: aunque lo autocompletamos aquí, el servidor también lo fuerza por seguridad.
 */
function getResponsableFromSession(session: ReturnType<typeof useSession>["data"]): string {
  const nombre = session?.user?.nombre ?? "";
  const apellido = session?.user?.apellido ?? "";
  const full = `${nombre} ${apellido}`.trim();
  return full || session?.user?.name || session?.user?.username || "";
}

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  elemento_id: z.string().min(1, "Selecciona elemento"),
  programacion_id: z.string().optional(),
  fecha_mantenimiento: z.string().min(1, "Fecha requerida"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  averias_encontradas: z.string().optional(),
  repuestos_utilizados: z.string().optional(),
  // El servidor lo completa con el usuario en sesión (en creación).
  // En edición puede venir del registro existente.
  responsable: z.string().optional().or(z.literal("")),
  costo: z.string().optional(),
  creado_por: z.string().optional(),
});

type MantenimientoRealizadoFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<MantenimientoRealizado>;
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function MantenimientoRealizadoUpsertDialog({
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
  // En creación NO debe abrirse automáticamente al entrar a la página.
  // En edición, el padre ya decide cuándo renderizar este diálogo.
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const responsableSesion = getResponsableFromSession(session);

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
  } = useForm<MantenimientoRealizadoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: elementoSeleccionado?.ubicacion_rel?.sede?.id?.toString() || "",
      ubicacion_id: elementoSeleccionado?.ubicacion_id?.toString() || "",
      categoria_id: elementoSeleccionado?.categoria_id?.toString() || "",
      subcategoria_id: elementoSeleccionado?.subcategoria_id?.toString() || "",
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      programacion_id: defaultValues?.programacion_id?.toString() || "",
      fecha_mantenimiento: defaultValues?.fecha_mantenimiento
        ? new Date(defaultValues.fecha_mantenimiento).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo: defaultValues?.tipo || "PREVENTIVO",
      descripcion: defaultValues?.descripcion || "",
      averias_encontradas: defaultValues?.averias_encontradas || "",
      repuestos_utilizados: defaultValues?.repuestos_utilizados || "",
      responsable: defaultValues?.responsable || "",
      costo: defaultValues?.costo?.toString() || "",
      creado_por: defaultValues?.creado_por || "",
    },
  });

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
      reset({
        elemento_id: defaultValues.elemento_id?.toString() || "",
        programacion_id: defaultValues.programacion_id?.toString() || "",
        fecha_mantenimiento: defaultValues.fecha_mantenimiento
          ? new Date(defaultValues.fecha_mantenimiento).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo: defaultValues.tipo || "PREVENTIVO",
        descripcion: defaultValues.descripcion || "",
        averias_encontradas: defaultValues.averias_encontradas || "",
        repuestos_utilizados: defaultValues.repuestos_utilizados || "",
        responsable: defaultValues.responsable || "",
        costo: defaultValues.costo?.toString() || "",
        creado_por: defaultValues.creado_por || "",
      });
    }
  }, [defaultValues, reset]);

  // Si este componente se renderiza para edición (defaultValues presentes),
  // lo abrimos automáticamente.
  useEffect(() => {
    if (!create && defaultValues) setOpen(true);
  }, [create, defaultValues]);

  // Auto-asignar responsable con el usuario en sesión (solo en creación).
  // Si la sesión todavía no cargó, permitimos que el form exista; el servidor validará.
  useEffect(() => {
    if (!create) return;
    if (!responsableSesion) return;
    const current = watch("responsable");
    if (!current) {
      setValue("responsable", responsableSesion, { shouldValidate: true, shouldDirty: true });
    }
  }, [create, responsableSesion, setValue, watch]);

  const onSubmit = async (data: MantenimientoRealizadoFormData) => {
    try {
      const formData = new FormData();

      formData.append("elemento_id", data.elemento_id);
      if (data.programacion_id) formData.append("programacion_id", data.programacion_id);
      formData.append("fecha_mantenimiento", data.fecha_mantenimiento);
      formData.append("tipo", data.tipo);
      formData.append("descripcion", data.descripcion);
      if (data.averias_encontradas) formData.append("averias_encontradas", data.averias_encontradas);
      if (data.repuestos_utilizados) formData.append("repuestos_utilizados", data.repuestos_utilizados);
      // En creación, normalmente viene autocompletado por sesión.
      // Aun así enviamos string (nunca undefined) para mantener el contrato del server action.
      formData.append("responsable", data.responsable ?? "");
      if (data.costo) formData.append("costo", data.costo);
      if (data.creado_por) formData.append("creado_por", data.creado_por);

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando mantenimiento..." : "Actualizando mantenimiento...",
        success: create
          ? "Mantenimiento realizado creado exitosamente"
          : "Mantenimiento realizado actualizado exitosamente",
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
  const title = create ? "Crear Mantenimiento Realizado" : "Editar Mantenimiento Realizado";
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              placeholder="Ej: escribe la serie o el código del elemento (MIC-00023 / PROY-0102)"
              disabled={!selectedUbicacionId || !selectedCategoriaId}
              error={errors.elemento_id?.message}
            />

            {/* Fecha y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="fecha_mantenimiento">Fecha de Mantenimiento</Label>
                <Input
                  id="fecha_mantenimiento"
                  type="date"
                  {...register("fecha_mantenimiento")}
                />
                {errors.fecha_mantenimiento && (
                  <p className="text-red-500 text-sm">{errors.fecha_mantenimiento.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tipo">Tipo de mantenimiento</Label>
                <Select
                  value={watch("tipo")}
                  onValueChange={(value) =>
                    setValue("tipo", value as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO")
                  }
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVO">
                      Preventivo — planificado para evitar fallas
                    </SelectItem>
                    <SelectItem value="CORRECTIVO">
                      Correctivo — reparación tras una falla o daño
                    </SelectItem>
                    <SelectItem value="PREDICTIVO">
                      Predictivo — según condición o inspección
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Puedes cambiar el tipo al editar si el mantenimiento pasó de preventivo a correctivo (ej. si el equipo se dañó).
                </p>
                {errors.tipo && (
                  <p className="text-red-500 text-sm">{errors.tipo.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Ej: Limpieza general, ajuste de conexiones, prueba funcional y calibración."
                {...register("descripcion")}
                rows={3}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Averías Encontradas */}
            <div className="grid gap-1">
              <Label htmlFor="averias_encontradas">Averías Encontradas</Label>
              <Textarea
                id="averias_encontradas"
                placeholder="Ej: Ruido intermitente, conector flojo, sobrecalentamiento. (Opcional)"
                {...register("averias_encontradas")}
                rows={2}
              />
            </div>

            {/* Repuestos Utilizados */}
            <div className="grid gap-1">
              <Label htmlFor="repuestos_utilizados">Repuestos Utilizados</Label>
              <Textarea
                id="repuestos_utilizados"
                placeholder="Ej: Cable XLR, fusible 2A, conector RJ45. (Opcional)"
                {...register("repuestos_utilizados")}
                rows={2}
              />
            </div>

            {/* Responsable y Costo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  type="text"
                  placeholder="Se toma del usuario en sesión"
                  {...register("responsable")}
                  readOnly={create && Boolean(responsableSesion)}
                />
                {errors.responsable && (
                  <p className="text-red-500 text-sm">{errors.responsable.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="costo">Costo (COP)</Label>
                <Input
                  id="costo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 150000"
                  {...register("costo")}
                />
              </div>
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

