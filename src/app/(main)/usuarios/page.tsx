import { listUsuarios } from "../../../modules/usuario/services";
import {
  actionDeleteUsuario,
  actionCreateUsuario,
  actionUpdateUsuario,
} from "../../../modules/usuario/actions";
import { UsuariosList } from "../../../components/usuarios/usuarios-list";
import { UsuariosSkeleton } from "../../../components/skeletons/usuarios";
import { Suspense } from "react";

async function UsuariosContent() {
  const usuarios = await listUsuarios();

  return (
    <UsuariosList
      usuarios={usuarios}
      onCreateUsuario={actionCreateUsuario}
      onUpdateUsuario={actionUpdateUsuario}
      onDeleteUsuario={actionDeleteUsuario}
    />
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<UsuariosSkeleton />}>
      <UsuariosContent />
    </Suspense>
  );
}
