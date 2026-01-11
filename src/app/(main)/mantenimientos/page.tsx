import { listMantenimientosProgramados, listMantenimientosRealizados } from "../../../modules/mantenimientos/services";
import { getFormSelectOptions } from "../../../lib/form-options";
import {
  actionCreateMantenimientoProgramado,
  actionUpdateMantenimientoProgramado,
  actionDeleteMantenimientoProgramado,
  actionCreateMantenimientoRealizado,
  actionUpdateMantenimientoRealizado,
  actionDeleteMantenimientoRealizado,
  actionCambiarEstadoMantenimiento,
} from "../../../modules/mantenimientos/actions";
import { MantenimientosProgramadosList } from "../../../components/mantenimientos/mantenimientos-programados-list";
import { MantenimientosRealizadosList } from "../../../components/mantenimientos/mantenimientos-realizados-list";
import { MantenimientosSemanaView } from "../../../components/mantenimientos/mantenimientos-semana-view";
import { CronogramaView } from "../../../components/cronograma/cronograma-view";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Wrench, CalendarDays, Calendar, ClipboardCheck } from "lucide-react";

// Componente que maneja la lógica de datos
async function MantenimientosContent() {
  // Cargar datos y opciones filtradas en paralelo
  const [programados, realizados, options] = await Promise.all([
    listMantenimientosProgramados(),
    listMantenimientosRealizados(),
    getFormSelectOptions(),
  ]);

  // Contar pendientes para mostrar en el tab
  const pendientesCount = programados.filter(m => m.estado === "PENDIENTE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Mantenimientos</h1>
        {pendientesCount > 0 && (
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-red-500 text-white text-sm font-bold">
            {pendientesCount}
          </span>
        )}
      </div>

      <Tabs defaultValue="semana" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="semana" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Esta Semana</span>
            <span className="sm:hidden">Semana</span>
          </TabsTrigger>
          <TabsTrigger value="programados" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Programados</span>
            <span className="sm:hidden">Prog.</span>
            {pendientesCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {pendientesCount > 99 ? "99+" : pendientesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="realizados" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Realizados</span>
            <span className="sm:hidden">Real.</span>
          </TabsTrigger>
          <TabsTrigger value="cronograma" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Cronograma</span>
            <span className="sm:hidden">Cron.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semana" className="mt-6">
          <MantenimientosSemanaView
            mantenimientos={programados}
            elementos={options.elementos}
            onCambiarEstado={actionCambiarEstadoMantenimiento}
          />
        </TabsContent>

        <TabsContent value="programados" className="mt-6">
          <MantenimientosProgramadosList
            mantenimientos={programados}
            elementos={options.elementos}
            sedes={options.sedes}
            ubicaciones={options.ubicaciones}
            categorias={options.categorias}
            subcategorias={options.subcategorias}
            onCreateMantenimiento={actionCreateMantenimientoProgramado}
            onUpdateMantenimiento={actionUpdateMantenimientoProgramado}
            onDeleteMantenimiento={actionDeleteMantenimientoProgramado}
            onCambiarEstado={actionCambiarEstadoMantenimiento}
          />
        </TabsContent>

        <TabsContent value="realizados" className="mt-6">
          <MantenimientosRealizadosList
            mantenimientos={realizados}
            elementos={options.elementos}
            sedes={options.sedes}
            ubicaciones={options.ubicaciones}
            categorias={options.categorias}
            subcategorias={options.subcategorias}
            onCreateMantenimiento={actionCreateMantenimientoRealizado}
            onUpdateMantenimiento={actionUpdateMantenimientoRealizado}
            onDeleteMantenimiento={actionDeleteMantenimientoRealizado}
          />
        </TabsContent>

        <TabsContent value="cronograma" className="mt-6">
          <CronogramaView
            sedes={options.sedes}
            ubicaciones={options.ubicaciones}
            elementos={options.elementos}
            mantenimientos={programados}
            onCreateMantenimiento={actionCreateMantenimientoProgramado}
            onUpdateMantenimiento={actionUpdateMantenimientoProgramado}
            onDeleteMantenimiento={actionDeleteMantenimientoProgramado}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MantenimientosPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Mantenimientos</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-96"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <MantenimientosContent />
    </Suspense>
  );
}
