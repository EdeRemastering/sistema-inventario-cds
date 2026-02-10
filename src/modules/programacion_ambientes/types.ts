export type ProgramacionAmbiente = {
  id: number;
  ubicacion_id: number;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  docente_id_q10: string | null;
  descripcion: string | null;
  ocupado: boolean;
  creado_en: Date;
  actualizado_en: Date;
  ubicacion?: {
    id: number;
    codigo: string;
    nombre: string;
    sede?: { nombre: string };
  };
};

export type CreateProgramacionAmbienteInput = Omit<ProgramacionAmbiente, "id" | "creado_en" | "actualizado_en" | "ubicacion">;
export type UpdateProgramacionAmbienteInput = Partial<CreateProgramacionAmbienteInput> & { id?: number };
