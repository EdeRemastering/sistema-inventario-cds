import { listProgramacionAmbientes } from "../../../modules/programacion_ambientes/services";
import { ProgramacionAmbientesView } from "../../../components/programacion-ambientes/programacion-ambientes-view";
import { getFormSelectOptions } from "../../../lib/form-options";
import { CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgramacionAmbientesPage() {
  const [programaciones, options] = await Promise.all([
    listProgramacionAmbientes(),
    getFormSelectOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarRange className="h-8 w-8" />
          Programación de Ambientes
        </h1>
        <p className="text-muted-foreground mt-1">
          Programación académica de ambientes según uso por docentes (integración Q10)
        </p>
      </div>

      <ProgramacionAmbientesView
        programaciones={programaciones}
        ubicaciones={options.ubicaciones}
      />
    </div>
  );
}
