import { listUsuarios } from "../../../modules/usuario/services";
import {
  actionDeleteUsuario,
  actionCreateUsuario,
  actionUpdateUsuario,
} from "../../../modules/usuario/actions";
import { DeleteButton } from "../../../components/delete-button";
import { UsuarioUpsertDialog } from "../../../components/usuarios/usuario-upsert-dialog";
import { UsuariosSkeleton } from "../../../components/skeletons/usuarios";
import { Suspense } from "react";

type UsuarioItem = {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  activo: boolean | null;
};

async function UsuariosContent() {
  const usuarios: UsuarioItem[] = await listUsuarios();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <UsuarioUpsertDialog create serverAction={actionCreateUsuario} />
      </div>
      <div className="space-y-3">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3 rounded border p-3"
          >
            <span className="font-medium">{u.nombre}</span>
            <span className="text-muted-foreground">@{u.username}</span>
            <span className="text-xs rounded bg-secondary px-2 py-0.5 ml-2">
              {u.rol}
            </span>
            {u.activo === false && (
              <span className="text-xs rounded bg-destructive/10 text-destructive px-2 py-0.5">
                Inactivo
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <UsuarioUpsertDialog
                create={false}
                serverAction={actionUpdateUsuario}
                defaultValues={{
                  nombre: u.nombre,
                  username: u.username,
                  rol: u.rol as "administrador" | "usuario",
                  activo: u.activo ?? true,
                }}
                hiddenFields={{ id: u.id }}
              />
              <DeleteButton
                action={async () => {
                  "use server";
                  await actionDeleteUsuario(u.id);
                }}
              >
                Eliminar
              </DeleteButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<UsuariosSkeleton />}>
      <UsuariosContent />
    </Suspense>
  );
}
