import { listMantenimientosProgramados, listMantenimientosRealizados } from "../../../modules/mantenimientos/services";
import { listElementosWithRelations } from "../../../modules/elementos/services";
import { listSedesActivas } from "../../../modules/sedes/services";
import { listUbicacionesActivas } from "../../../modules/ubicaciones/services";
import { listCategorias } from "../../../modules/categorias/services";
import { listSubcategorias } from "../../../modules/subcategorias/services";
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
  const [programados, realizados, elementos, sedes, ubicaciones, categorias, subcategorias] = await Promise.all([
    listMantenimientosProgramados(),
    listMantenimientosRealizados(),
    listElementosWithRelations(),
    listSedesActivas(),
    listUbicacionesActivas(),
    listCategorias(),
    listSubcategorias(),
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
            sedes={sedes}
            ubicaciones={ubicaciones}
            categorias={categorias}
            subcategorias={subcategorias}
            onCreateMantenimiento={actionCreateMantenimientoProgramado}
            onUpdateMantenimiento={actionUpdateMantenimientoProgramado}
            onDeleteMantenimiento={actionDeleteMantenimientoProgramado}
          />
        </TabsContent>
        <TabsContent value="realizados">
          <MantenimientosRealizadosList
            mantenimientos={realizados}
            elementos={elementos}
            sedes={sedes}
            ubicaciones={ubicaciones}
            categorias={categorias}
            subcategorias={subcategorias}
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

