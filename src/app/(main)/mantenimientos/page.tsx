import { listMantenimientosProgramados, listMantenimientosRealizados } from "../../../modules/mantenimientos/services";
import { listElementos } from "../../../modules/elementos/services";
import {
  actionCreateMantenimientoProgramado,
  actionUpdateMantenimientoProgramado,
  actionDeleteMantenimientoProgramado,
  actionCreateMantenimientoRealizado,
  actionUpdateMantenimientoRealizado,
  actionDeleteMantenimientoRealizado,
} from "../../../modules/mantenimientos/actions";
import { MantenimientosProgramadosList } from "../../../components/mantenimientos/mantenimientos-programados-list";
import { MantenimientosRealizadosList } from "../../../components/mantenimientos/mantenimientos-realizados-list";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// Componente que maneja la lógica de datos
async function MantenimientosContent() {
  const [programados, realizados, elementos] = await Promise.all([
    listMantenimientosProgramados(),
    listMantenimientosRealizados(),
    listElementos(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mantenimientos</h1>
      <Tabs defaultValue="programados" className="w-full">
        <TabsList>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="realizados">Realizados</TabsTrigger>
        </TabsList>
        <TabsContent value="programados">
          <MantenimientosProgramadosList
            mantenimientos={programados}
            elementos={elementos}
            onCreateMantenimiento={actionCreateMantenimientoProgramado}
            onUpdateMantenimiento={actionUpdateMantenimientoProgramado}
            onDeleteMantenimiento={actionDeleteMantenimientoProgramado}
          />
        </TabsContent>
        <TabsContent value="realizados">
          <MantenimientosRealizadosList
            mantenimientos={realizados}
            elementos={elementos}
            onCreateMantenimiento={actionCreateMantenimientoRealizado}
            onUpdateMantenimiento={actionUpdateMantenimientoRealizado}
            onDeleteMantenimiento={actionDeleteMantenimientoRealizado}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MantenimientosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MantenimientosContent />
    </Suspense>
  );
}

