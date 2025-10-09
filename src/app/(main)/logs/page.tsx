import { listLogs } from "../../../modules/logs/services";
import { listUsuarios } from "../../../modules/usuario/services";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { LogUpsertDialog } from "../../../components/logs/log-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { LogsSkeleton } from "../../../components/skeletons/logs";
import { Suspense } from "react";
import { actionCreateLog, actionDeleteLog } from "../../../modules/logs/actions";

async function LogsContent() {
  const [logs, usuarios] = await Promise.all([listLogs(), listUsuarios()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logs del Sistema</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <LogUpsertDialog
              create
              serverAction={actionCreateLog}
              usuarios={usuarios}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{l.accion}</div>
                  <div className="text-muted-foreground">
                    {l.detalles ?? ""}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <LogUpsertDialog
                    create={false}
                    serverAction={actionCreateLog}
                    usuarios={usuarios}
                    defaultValues={{
                      usuario_id: String(l.usuario_id),
                      accion: l.accion,
                      descripcion: l.detalles ?? "",
                    }}
                    hiddenFields={{ id: l.id }}
                  />
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await actionDeleteLog(l.id);
                    }}
                  >
                    Eliminar
                  </DeleteButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={<LogsSkeleton />}>
      <LogsContent />
    </Suspense>
  );
}
