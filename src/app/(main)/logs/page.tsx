import { listLogs } from "../../../modules/logs/services";
import { listUsuarios } from "../../../modules/usuario/services";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { LogForm } from "../../../components/logs/log-form";
import { LogRow } from "../../../components/logs/log-row";
import { Suspense } from "react";

export default async function LogsPage() {
  const [logs, usuarios] = await Promise.all([listLogs(), listUsuarios()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logs del Sistema</h1>
      <Card>
        <CardHeader>
          <LogForm usuarios={usuarios} />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {logs.map((l) => (
                <LogRow
                  key={l.id}
                  log={l}
                  usuarios={usuarios}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
