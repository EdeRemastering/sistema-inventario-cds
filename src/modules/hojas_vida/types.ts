import type { Prisma } from "@prisma/client";

export type HojaVida = {
  id: number;
  elemento_id: number;
  fecha_dilegenciamiento: Date;
  tipo_elemento: "EQUIPO" | "RECURSO_DIDACTICO";
  area_ubicacion: string | null;
  responsable: string | null;
  especificaciones_tecnicas: Prisma.JsonValue | null;
  descripcion: string | null;
  requerimientos_funcionamiento: string | null;
  requerimientos_seguridad: string | null;
  rutina_mantenimiento: "DIARIO" | "SEMANAL" | "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | null;
  fecha_actualizacion: Date | null;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
  elemento?: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
  };
  cambios?: CambioElemento[];
};

export type CambioElemento = {
  id: number;
  hoja_vida_id: number;
  fecha_cambio: Date;
  descripcion_cambio: string;
  tipo_cambio: "ACTUALIZACION" | "REPARACION" | "MEJORA" | "REEMPLAZO";
  usuario: string | null;
  creado_en: Date;
};

export type CreateHojaVidaInput = Omit<
  HojaVida,
  "id" | "creado_en" | "actualizado_en" | "elemento" | "cambios"
>;
export type UpdateHojaVidaInput = Partial<CreateHojaVidaInput> & { id?: number };

export type CreateCambioElementoInput = Omit<CambioElemento, "id" | "creado_en">;
export type UpdateCambioElementoInput = Partial<CreateCambioElementoInput> & { id?: number };

