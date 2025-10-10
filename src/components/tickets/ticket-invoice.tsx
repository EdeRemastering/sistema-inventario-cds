"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { FileText, Download, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { SignatureDisplay } from "../ui/signature-display";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type TicketInvoiceProps = {
  ticket: {
    id: number;
    numero_ticket: string;
    fecha_salida: Date;
    fecha_estimada_devolucion?: Date | null;
    elemento?: string | null;
    serie?: string | null;
    marca_modelo?: string | null;
    cantidad: number;
    dependencia_entrega?: string | null;
    firma_funcionario_entrega?: string | null;
    dependencia_recibe?: string | null;
    firma_funcionario_recibe?: string | null;
    motivo?: string | null;
    orden_numero?: string | null;
    fecha_guardado?: Date | null;
    usuario_guardado?: string | null;
  };
};

export function TicketInvoice({ ticket }: TicketInvoiceProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const invoiceElement = document.getElementById("ticket-invoice-content");
      if (!invoiceElement) {
        throw new Error("No se encontró el contenido de la factura");
      }

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ticket-${ticket.numero_ticket}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "No especificado";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(true)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Ver Factura
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Factura de Ticket</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generando..." : "Exportar PDF"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div id="ticket-invoice-content" className="bg-white p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                SISTEMA DE INVENTARIO CDS
              </h1>
              <h2 className="text-xl font-semibold text-gray-600">
                COMPROBANTE DE PRÉSTAMO
              </h2>
              <div className="w-32 h-1 bg-blue-600 mx-auto mt-4"></div>
            </div>

            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Información del Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Número:</span>
                    <Badge variant="outline" className="font-mono">
                      {ticket.numero_ticket}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fecha de Salida:</span>
                    <span>{formatDate(ticket.fecha_salida)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Fecha Estimada Devolución:
                    </span>
                    <span>{formatDate(ticket.fecha_estimada_devolucion)}</span>
                  </div>
                  {ticket.orden_numero && (
                    <div className="flex justify-between">
                      <span className="font-medium">Orden Número:</span>
                      <span>{ticket.orden_numero}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Información del Elemento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ticket.elemento && (
                    <div className="flex justify-between">
                      <span className="font-medium">Elemento:</span>
                      <span>{ticket.elemento}</span>
                    </div>
                  )}
                  {ticket.serie && (
                    <div className="flex justify-between">
                      <span className="font-medium">Serie:</span>
                      <span className="font-mono">{ticket.serie}</span>
                    </div>
                  )}
                  {ticket.marca_modelo && (
                    <div className="flex justify-between">
                      <span className="font-medium">Marca/Modelo:</span>
                      <span>{ticket.marca_modelo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Cantidad:</span>
                    <Badge variant="secondary" className="font-mono">
                      {ticket.cantidad}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dependencies and Signatures */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <Card className="border-l-4 border-l-orange-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-orange-600">📤</span>
                    Dependencia de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium">Dependencia:</span>
                    <p className="text-gray-700 mt-1">
                      {ticket.dependencia_entrega || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Firma del Funcionario:</span>
                    <div className="mt-2">
                      <SignatureDisplay
                        signatureUrl={ticket.firma_funcionario_entrega}
                        label=""
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-purple-600">📥</span>
                    Dependencia que Recibe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium">Dependencia:</span>
                    <p className="text-gray-700 mt-1">
                      {ticket.dependencia_recibe || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Firma del Funcionario:</span>
                    <div className="mt-2">
                      <SignatureDisplay
                        signatureUrl={ticket.firma_funcionario_recibe}
                        label=""
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            {ticket.motivo && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Motivo del Préstamo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {ticket.motivo}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="border-t pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
                <div>
                  <p>
                    <strong>Fecha de Generación:</strong>{" "}
                    {formatDate(new Date())}
                  </p>
                  {ticket.usuario_guardado && (
                    <p>
                      <strong>Generado por:</strong> {ticket.usuario_guardado}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p>
                    <strong>Sistema de Inventario CDS</strong>
                  </p>
                  <p>Comprobante de Préstamo</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
