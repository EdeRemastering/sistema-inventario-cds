"use client";

import { HandCoins } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SearchInput } from "../ui/search-input";
import { EmptyState } from "../ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PrestamoUpsertDialog } from "./prestamo-upsert-dialog";
import { SignatureDisplay } from "../ui/signature-display";
import { PrestamoActions } from "./prestamo-actions";
import type { PrestamoGuardado } from "../../modules/prestamos/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";

type PrestamosListProps = {
  prestamos: PrestamoGuardado[];
  ubicaciones: Ubicacion[];
  onCreatePrestamo: (formData: FormData) => Promise<void>;
  onUpdatePrestamo: (formData: FormData) => Promise<void>;
  onDeletePrestamo: (id: number) => Promise<void>;
  onMarkAsCompleted?: (id: number) => Promise<void>;
};

export function PrestamosList({
  prestamos,
  ubicaciones,
  onCreatePrestamo,
  onUpdatePrestamo,
  onDeletePrestamo,
  onMarkAsCompleted,
}: PrestamosListProps) {
  const [tab, setTab] = useState<"activos" | "historial">("activos");
  const [searchQuery, setSearchQuery] = useState("");

  const isPrestamoClosed = (prestamo: PrestamoGuardado) => {
    const motivo = (prestamo.motivo ?? "").toLowerCase();
    return (
      motivo.includes("devuelto") ||
      motivo.includes("completado") ||
      motivo.includes("entregado")
    );
  };

  const { activos, historial } = useMemo(() => {
    const activos: PrestamoGuardado[] = [];
    const historial: PrestamoGuardado[] = [];

    for (const t of prestamos) {
      if (isPrestamoClosed(t)) historial.push(t);
      else activos.push(t);
    }

    return { activos, historial };
  }, [prestamos]);

  const matchesSearch = (prestamo: PrestamoGuardado) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const haystack = [
      prestamo.numero_ticket,
      prestamo.dependencia_recibe,
      prestamo.persona_entrega_nombre ?? "",
      prestamo.persona_entrega_apellido ?? "",
      prestamo.persona_recibe_nombre ?? "",
      prestamo.persona_recibe_apellido ?? "",
      prestamo.motivo ?? "",
      prestamo.orden_numero ?? "",
      prestamo.ubicacion?.nombre ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  };

  const activosFiltrados = useMemo(
    () => activos.filter(matchesSearch),
    [activos, searchQuery]
  );
  const historialFiltrado = useMemo(
    () => historial.filter(matchesSearch),
    [historial, searchQuery]
  );

  const PrestamoCard = ({ prestamo }: { prestamo: PrestamoGuardado }) => (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Header con información principal */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold text-base">{prestamo.numero_ticket}</span>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              Préstamo #{prestamo.numero_ticket}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Resuelve:</span>{" "}
                <span>
                  {prestamo.persona_entrega_nombre || prestamo.persona_entrega_apellido
                    ? `${prestamo.persona_entrega_nombre ?? ""} ${prestamo.persona_entrega_apellido ?? ""}`.trim()
                    : "Coordinación de Logística"}
                </span>
              </div>
              <div>
                <span className="font-medium">Solicitante:</span>{" "}
                <span>
                  {prestamo.persona_recibe_nombre || prestamo.persona_recibe_apellido
                    ? `${prestamo.persona_recibe_nombre ?? ""} ${prestamo.persona_recibe_apellido ?? ""}`.trim()
                    : "No especificado"}
                  {prestamo.dependencia_recibe ? ` (${prestamo.dependencia_recibe})` : ""}
                </span>
              </div>
            </div>
            <div className="mt-1">
              Fecha de inicio: {new Date(prestamo.fecha_salida).toLocaleDateString()}
            </div>
            {prestamo.ubicacion?.nombre && (
              <div className="mt-1">Ubicación: {prestamo.ubicacion.nombre}</div>
            )}
            {prestamo.orden_numero && <div className="mt-1">Orden: {prestamo.orden_numero}</div>}
          </div>
        </div>

        {/* Botones de acción en móvil */}
        <div className="flex sm:hidden gap-2">
          <PrestamoActions
            prestamo={prestamo}
            ubicaciones={ubicaciones}
            onUpdatePrestamo={onUpdatePrestamo}
            onDeletePrestamo={onDeletePrestamo}
            onMarkAsCompleted={onMarkAsCompleted}
          />
        </div>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SignatureDisplay
          signatureUrl={prestamo.firma_funcionario_entrega}
          label="Firma (Resuelve)"
          className="text-xs"
        />
        <SignatureDisplay
          signatureUrl={prestamo.firma_funcionario_recibe}
          label="Firma (Solicitante)"
          className="text-xs"
        />
      </div>

      {/* Información adicional y botones en desktop */}
      <div className="hidden sm:flex sm:items-center sm:justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          {prestamo.motivo && <div>Motivo: {prestamo.motivo}</div>}
        </div>
        <div className="flex gap-2">
          <PrestamoActions
            prestamo={prestamo}
            ubicaciones={ubicaciones}
            onUpdatePrestamo={onUpdatePrestamo}
            onDeletePrestamo={onDeletePrestamo}
            onMarkAsCompleted={onMarkAsCompleted}
          />
        </div>
      </div>

      {/* Información adicional en móvil */}
      <div className="sm:hidden text-xs text-muted-foreground space-y-1 pt-2 border-t">
        {prestamo.motivo && <div>Motivo: {prestamo.motivo}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold" data-tour="page-title">
          Préstamos
        </h1>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SearchInput
              placeholder="Buscar préstamos..."
              onSearch={setSearchQuery}
              className="w-full sm:max-w-sm"
            />
            <div className="flex justify-end" data-tour="prestamos-create">
              <PrestamoUpsertDialog create serverAction={onCreatePrestamo} ubicaciones={ubicaciones} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "activos" | "historial")}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="activos" className="flex-1 sm:flex-none">
                Activos ({activos.length})
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex-1 sm:flex-none">
                Historial ({historial.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activos">
              {activos.length === 0 ? (
                <EmptyState
                  icon={<HandCoins className="h-8 w-8 text-muted-foreground" />}
                  title="No hay préstamos activos"
                  description="Crea un préstamo para registrar una ubicación (ambiente) prestada."
                />
              ) : activosFiltrados.length === 0 ? (
                <EmptyState
                  icon={<HandCoins className="h-8 w-8 text-muted-foreground" />}
                  title={`No se encontraron préstamos activos que coincidan con "${searchQuery}"`}
                  description="Intenta con un término de búsqueda diferente o más general."
                />
              ) : (
                <div className="space-y-4">
                  {activosFiltrados.map((prestamo) => (
                    <PrestamoCard key={prestamo.id} prestamo={prestamo} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="historial">
              {historial.length === 0 ? (
                <EmptyState
                  icon={<HandCoins className="h-8 w-8 text-muted-foreground" />}
                  title="No hay historial de préstamos"
                  description="Cuando cierres préstamos (devolución / completado) aparecerán aquí."
                />
              ) : historialFiltrado.length === 0 ? (
                <EmptyState
                  icon={<HandCoins className="h-8 w-8 text-muted-foreground" />}
                  title={`No se encontraron préstamos en el historial que coincidan con "${searchQuery}"`}
                  description="Intenta con un término de búsqueda diferente o más general."
                />
              ) : (
                <div className="space-y-4">
                  {historialFiltrado.map((prestamo) => (
                    <PrestamoCard key={prestamo.id} prestamo={prestamo} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
