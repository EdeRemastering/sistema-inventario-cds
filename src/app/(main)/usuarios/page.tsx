import { listUsuarios } from "../../../modules/usuario/services";
import { actionDeleteUsuario } from "../../../modules/usuario/actions";
import { DeleteButton } from "../../../components/delete-button";
import { Button } from "../../../components/ui/button";

type UsuarioItem = {
  id: number;
  username: string;
  nombre: string;
  rol: string;
};

export default async function UsuariosPage() {
  const usuarios: UsuarioItem[] = await listUsuarios();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Button disabled>Nuevo usuario</Button>
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
            <div className="ml-auto flex gap-2">
              <DeleteButton
                onConfirm={async () => {
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
