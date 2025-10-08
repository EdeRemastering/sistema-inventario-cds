import { Button } from "../ui/button";
import { DeleteButton } from "../delete-button";

type LogItem = {
  id: number;
  usuario_id: number;
  accion: string;
  detalles: string | null;
  ip: string | null;
  creado_en: Date;
};

type UsuarioOption = {
  id: number;
  nombre: string;
  username: string;
};

type LogRowProps = {
  log: LogItem;
  usuarios: UsuarioOption[];
  onDelete: () => Promise<void>;
};

export function LogRow({ log, usuarios, onDelete }: LogRowProps) {
  const usuario = usuarios.find((u) => u.id === log.usuario_id);

  return (
    <div className="flex items-start gap-4 rounded border p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{log.accion}</h3>
          <span className="text-sm text-muted-foreground">
            {new Date(log.creado_en).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Usuario:{" "}
          {usuario ? `${usuario.nombre} (${usuario.username})` : "Desconocido"}
        </p>
        {log.ip && (
          <p className="text-sm text-muted-foreground">IP: {log.ip}</p>
        )}
        {log.detalles && <p className="text-sm mt-2">{log.detalles}</p>}
      </div>
      <div className="flex gap-2">
        <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
      </div>
    </div>
  );
}
