import { listLogs } from "../../../modules/logs/services";
import { listUsuarios } from "../../../modules/usuario/services";
import {
  actionCreateLog,
  actionDeleteLog,
} from "../../../modules/logs/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { LogForm } from "../../../components/logs/log-form";
import { LogRow } from "../../../components/logs/log-row";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers para las acciones de logs
async function handleCreateLog(formData: FormData) {
  await actionCreateLog(formData);
  revalidatePath("/logs");
}

async function handleDeleteLog(id: number) {
  await actionDeleteLog(id);
  revalidatePath("/logs");
}

export default async function LogsPage() {
  const [logs, usuarios] = await Promise.all([listLogs(), listUsuarios()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logs del Sistema</h1>
      <Card>
        <CardHeader>
          <LogForm action={handleCreateLog} usuarios={usuarios} />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {logs.map((l) => (
                <LogRow
                  key={l.id}
                  log={l}
                  usuarios={usuarios}
                  onDelete={() => handleDeleteLog(l.id)}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
