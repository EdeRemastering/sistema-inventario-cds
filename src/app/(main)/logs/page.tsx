import { listLogs } from "../../../modules/logs/services";
import { listUsuarios } from "../../../modules/usuario/services";
import {
  actionCreateLog,
  actionDeleteLog,
} from "../../../modules/logs/actions";
import { LogsList } from "../../../components/logs/logs-list";
import { LogsSkeleton } from "../../../components/skeletons/logs";
import { Suspense } from "react";

async function LogsContent() {
  const [logs, usuarios] = await Promise.all([listLogs(), listUsuarios()]);

  return (
    <LogsList
      logs={logs}
      usuarios={usuarios}
      onCreateLog={actionCreateLog}
      onUpdateLog={actionCreateLog} // Usando la misma acción para crear/actualizar
      onDeleteLog={actionDeleteLog}
    />
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={<LogsSkeleton />}>
      <LogsContent />
    </Suspense>
  );
}
