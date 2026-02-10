"use client";

import { useState, useEffect } from "react";
import { Package2, Plus, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ElementoUpsertDialog } from "../elementos/elemento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { actionGetElementosByUbicacion } from "../../modules/elementos/actions";
import type { ElementoListItem } from "../../modules/elementos/services";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Sede } from "../../modules/sedes/types";
import type { Categoria } from "../../modules/categorias/types";
import type { Subcategoria } from "../../modules/subcategorias/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubicacion: Ubicacion | null;
  sedes: Sede[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  ubicaciones: Ubicacion[];
  onCreateElemento: (formData: FormData) => Promise<void>;
  onUpdateElemento: (formData: FormData) => Promise<void>;
  onDeleteElemento: (id: number) => Promise<void>;
};

export function UbicacionElementosSheet({
  open,
  onOpenChange,
  ubicacion,
  sedes,
  categorias,
  subcategorias,
  ubicaciones,
  onCreateElemento,
  onUpdateElemento,
  onDeleteElemento,
}: Props) {
  const [elementos, setElementos] = useState<ElementoListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sedeId = ubicacion?.sede_id ?? ubicacion?.sede?.id;

  useEffect(() => {
    if (open && ubicacion?.id) {
      setLoading(true);
      actionGetElementosByUbicacion(ubicacion.id)
        .then(setElementos)
        .finally(() => setLoading(false));
    } else {
      setElementos([]);
    }
  }, [open, ubicacion?.id]);

  const ubicacionesParaSelect = ubicaciones.map((u) => ({
    id: u.id,
    codigo: u.codigo,
    nombre: u.nombre,
    sede_id: u.sede_id,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-xl overflow-y-auto flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Elementos en {ubicacion?.codigo} - {ubicacion?.nombre}
          </SheetTitle>
          <SheetDescription>
            Gestiona los elementos asignados a esta ubicación. Puedes agregar
            nuevos desde aquí.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 py-4">
          <div className="flex justify-end">
            {ubicacion && sedeId && (
              <ElementoUpsertDialog
                serverAction={onCreateElemento}
                create={true}
                triggerText="Agregar elemento"
                sedes={sedes}
                categorias={categorias}
                subcategorias={subcategorias}
                ubicaciones={ubicacionesParaSelect}
                defaultValues={{
                  ubicacion_id: ubicacion.id.toString(),
                  sede_id: sedeId.toString(),
                }}
                onClose={() => {
                  if (ubicacion?.id) {
                    actionGetElementosByUbicacion(ubicacion.id).then(
                      setElementos
                    );
                  }
                }}
              />
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : elementos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Package2 className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No hay elementos en esta ubicación</p>
              <p className="text-sm mt-1">
                Haz clic en &quot;Agregar elemento&quot; para crear el primero
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serie</TableHead>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elementos.map((el) => (
                    <TableRow key={el.id}>
                      <TableCell className="font-medium">{el.serie}</TableCell>
                      <TableCell>
                        {[el.marca, el.modelo].filter(Boolean).join(" ") || "-"}
                      </TableCell>
                      <TableCell>{el.cantidad}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <ElementoUpsertDialog
                            serverAction={onUpdateElemento}
                            create={false}
                            sedes={sedes}
                            categorias={categorias}
                            subcategorias={subcategorias}
                            ubicaciones={ubicacionesParaSelect}
                            defaultValues={{
                              sede_id:
                                el.ubicacion_rel?.sede?.id?.toString() ?? "",
                              ubicacion_id: el.ubicacion_id?.toString() ?? "",
                              categoria_id: el.categoria_id.toString(),
                              subcategoria_id:
                                el.subcategoria_id?.toString() ?? "",
                              serie: el.serie,
                              marca: el.marca ?? "",
                              modelo: el.modelo ?? "",
                              cantidad: el.cantidad.toString(),
                              imagen_url: el.imagen_url ?? "",
                            }}
                            hiddenFields={{ id: el.id }}
                            onClose={() => {
                              if (ubicacion?.id) {
                                actionGetElementosByUbicacion(
                                  ubicacion.id
                                ).then(setElementos);
                              }
                            }}
                          />
                          <DeleteButton
                            onConfirm={async () => {
                              await onDeleteElemento(el.id);
                              if (ubicacion?.id) {
                                const list =
                                  await actionGetElementosByUbicacion(
                                    ubicacion.id
                                  );
                                setElementos(list);
                              }
                            }}
                            title="Eliminar elemento"
                            description="¿Eliminar este elemento? Esta acción no se puede deshacer."
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
