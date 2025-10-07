export type Usuario = {
  id: number;
  username: string;
  nombre: string;
  rol: "administrador" | "usuario";
  activo: boolean | null;
  creado_en: Date;
  actualizado_en: Date;
};

export type CreateUsuarioInput = {
  username: string;
  password: string;
  nombre: string;
  rol?: "administrador" | "usuario";
  activo?: boolean;
};

export type UpdateUsuarioInput = Partial<Omit<CreateUsuarioInput, "username" | "password">> & {
  id: number;
  password?: string;
};


