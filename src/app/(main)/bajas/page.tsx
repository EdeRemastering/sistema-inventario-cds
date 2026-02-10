import { listBajasElementos } from "../../../modules/bajas_elementos/services";
import { BajasList } from "../../../components/bajas/bajas-list";
import { BajaUpsertDialog } from "../../../components/bajas/baja-upsert-dialog";
import { getFormSelectOptions } from "../../../lib/form-options";
import { actionCreateBajaElemento, actionGetAutorizadores } from "../../../modules/bajas_elementos/actions";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BajasPage() {
  const [bajas, options, autorizadores] = await Promise.all([
    listBajasElementos(),
    getFormSelectOptions(),
    actionGetAutorizadores(),
  ]);

  const elementosActivos = options.elementos.filter((e) => e.activo !== false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" />
            Bajas de Elementos
          </h1>
          <p className="text-muted-foreground mt-1">
            Registro de bajas con evidencia PDF y autorización obligatoria
          </p>
        </div>
        <BajaUpsertDialog
          serverAction={actionCreateBajaElemento}
          elementos={elementosActivos}
          autorizadores={autorizadores}
        />
      </div>

      <BajasList bajas={bajas} />
    </div>
  );
}
