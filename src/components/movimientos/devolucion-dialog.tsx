"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search, FileText } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SignaturePadComponent } from "../ui/signature-pad";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const devolucionSchema = z.object({
  numero_ticket: z.string().min(1, "Número de ticket requerido"),
  fecha_real_devolucion: z.string().min(1, "Fecha de devolución requerida"),
  observaciones_devolucion: z.string().optional(),
  devuelto_por: z.string().optional(),
  recibido_por: z.string().optional(),
});

type DevolucionFormData = z.infer<typeof devolucionSchema>;

type MovimientoPrestamo = {
  id: number;
  numero_ticket: string;
  fecha_movimiento: Date;
  cantidad: number;
  elemento: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
  };
  dependencia_entrega: string;
  funcionario_entrega: string;
  dependencia_recibe: string;
  funcionario_recibe: string;
  fecha_estimada_devolucion: Date;
  motivo: string;
};

type Props = {
  onDevolver: (formData: FormData) => Promise<void>;
  trigger?: React.ReactNode;
};

export function DevolucionDialog({ onDevolver, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [busquedaTicket, setBusquedaTicket] = useState("");
  const [prestamoEncontrado, setPrestamoEncontrado] =
    useState<MovimientoPrestamo | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [firmaDevuelve, setFirmaDevuelve] = useState<string | null>(null);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DevolucionFormData>({
    resolver: zodResolver(devolucionSchema),
    defaultValues: {
      fecha_real_devolucion: new Date().toISOString().split("T")[0],
    },
  });

  // Buscar préstamo por número de ticket
  const buscarPrestamo = async () => {
    if (!busquedaTicket.trim()) {
      toast.error("Ingresa un número de ticket");
      return;
    }

    setBuscando(true);

    try {
      const { actionBuscarPrestamoPorTicket } = await import("../../modules/movimientos/actions");
      const prestamo = await actionBuscarPrestamoPorTicket(busquedaTicket.trim());
      
      const prestamoEncontrado: MovimientoPrestamo = {
        id: prestamo.id,
        numero_ticket: prestamo.numero_ticket,
        fecha_movimiento: new Date(prestamo.fecha_movimiento),
        cantidad: prestamo.cantidad,
        elemento: {
          id: prestamo.elemento.id,
          serie: prestamo.elemento.serie,
          marca: prestamo.elemento.marca,
          modelo: prestamo.elemento.modelo,
        },
        dependencia_entrega: prestamo.dependencia_entrega,
        funcionario_entrega: prestamo.funcionario_entrega,
        dependencia_recibe: prestamo.dependencia_recibe,
        funcionario_recibe: prestamo.funcionario_recibe,
        fecha_estimada_devolucion: new Date(prestamo.fecha_estimada_devolucion),
        motivo: prestamo.motivo,
      };

      setPrestamoEncontrado(prestamoEncontrado);
      setValue("numero_ticket", prestamoEncontrado.numero_ticket);
      setBuscando(false);
      toast.success("Préstamo encontrado");
    } catch (error) {
      setBuscando(false);
      const errorMessage = error instanceof Error ? error.message : "Error buscando el préstamo";
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: DevolucionFormData) => {
    if (!prestamoEncontrado) {
      toast.error("Primero busca un préstamo válido");
      return;
    }

    // Validar que las firmas estén presentes
    if (!firmaDevuelve || !firmaRecibe) {
      toast.error("Se requieren ambas firmas para completar la devolución");
      return;
    }

    const formData = new FormData();

    // Datos de la devolución
    formData.append("id", prestamoEncontrado.id.toString());
    formData.append("fecha_real_devolucion", data.fecha_real_devolucion);
    formData.append(
      "observaciones_devolucion",
      data.observaciones_devolucion || ""
    );
    formData.append("devuelto_por", data.devuelto_por || "");
    formData.append("recibido_por", data.recibido_por || "");

    // Firmas digitales (ya validadas que existen)
    formData.append("firma_devuelve", firmaDevuelve);
    formData.append("firma_recibe_devolucion", firmaRecibe);

    try {
      await toast.promise(onDevolver(formData), {
        loading: "Procesando devolución...",
        success: "Devolución registrada exitosamente",
        error: (err) => err instanceof Error ? err.message : "Error al procesar la devolución",
      });

      reset();
      setPrestamoEncontrado(null);
      setBusquedaTicket("");
      setFirmaDevuelve(null);
      setFirmaRecibe(null);
      setOpen(false);
    } catch (error) {
      console.error("Error procesando devolución:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al procesar la devolución";
      toast.error(errorMessage);
    }
  };

  const isVencido =
    prestamoEncontrado &&
    prestamoEncontrado.fecha_estimada_devolucion < new Date();

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Registrar Devolución
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Registrar Devolución</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Búsqueda de Ticket */}
            <div className="space-y-4">
              <Label htmlFor="busqueda-ticket">
                Buscar Préstamo por Número de Ticket
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="busqueda-ticket"
                  placeholder="Ej: TICKET-2025-000001"
                  value={busquedaTicket}
                  onChange={(e) => setBusquedaTicket(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), buscarPrestamo())
                  }
                  className="w-full"
                />
                <Button
                  type="button"
                  onClick={buscarPrestamo}
                  disabled={buscando || !busquedaTicket.trim()}
                  className="w-full sm:w-auto"
                >
                  {buscando ? (
                    "Buscando..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Información del Préstamo Encontrado */}
            {prestamoEncontrado && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <FileText className="h-5 w-5" />
                    Préstamo Encontrado
                    {isVencido && (
                      <Badge variant="destructive" className="ml-auto">
                        VENCIDO
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Ticket:</span>{" "}
                      {prestamoEncontrado.numero_ticket}
                    </div>
                    <div>
                      <span className="font-medium">Elemento:</span>{" "}
                      {prestamoEncontrado.elemento.serie} -{" "}
                      {prestamoEncontrado.elemento.marca}{" "}
                      {prestamoEncontrado.elemento.modelo}
                    </div>
                    <div>
                      <span className="font-medium">Fecha Préstamo:</span>{" "}
                      {prestamoEncontrado.fecha_movimiento.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">
                        Fecha Est. Devolución:
                      </span>{" "}
                      {prestamoEncontrado.fecha_estimada_devolucion.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Funcionario Recibe:</span>{" "}
                      {prestamoEncontrado.funcionario_recibe}
                    </div>
                    <div>
                      <span className="font-medium">Dependencia:</span>{" "}
                      {prestamoEncontrado.dependencia_recibe}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Motivo:</span>{" "}
                    {prestamoEncontrado.motivo}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario de Devolución */}
            {prestamoEncontrado && (
              <>
                {/* Fecha de Devolución */}
                <div className="grid gap-1">
                  <Label htmlFor="fecha_real_devolucion">
                    Fecha de Devolución
                  </Label>
                  <Input
                    id="fecha_real_devolucion"
                    type="date"
                    {...register("fecha_real_devolucion")}
                  />
                  {errors.fecha_real_devolucion && (
                    <p className="text-red-500 text-sm">
                      {errors.fecha_real_devolucion.message}
                    </p>
                  )}
                </div>

                {/* Observaciones */}
                <div className="grid gap-1">
                  <Label htmlFor="observaciones_devolucion">
                    Observaciones de Devolución
                  </Label>
                  <textarea
                    id="observaciones_devolucion"
                    rows={3}
                    {...register("observaciones_devolucion")}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.observaciones_devolucion && (
                    <p className="text-red-500 text-sm">
                      {errors.observaciones_devolucion.message}
                    </p>
                  )}
                </div>

                {/* Firmas Digitales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Firmas Digitales
                  </h3>
                  <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                      <SignaturePadComponent
                        label="Firma de Quien Devuelve"
                        onSignatureChange={setFirmaDevuelve}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <SignaturePadComponent
                        label="Firma de Quien Recibe"
                        onSignatureChange={setFirmaRecibe}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !prestamoEncontrado}
              >
                {isSubmitting ? "Procesando..." : "Registrar Devolución"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
