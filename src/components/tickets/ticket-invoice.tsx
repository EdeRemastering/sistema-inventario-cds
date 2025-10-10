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

      // Esperar un momento para que se renderice completamente
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(invoiceElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = imgHeight / imgWidth;
      let finalWidth = pdfWidth;
      let finalHeight = pdfWidth * ratio;

      // Si el contenido es muy alto, ajustar el ancho
      if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight / ratio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Si el contenido es muy alto, dividir en páginas
      if (finalHeight > pdfHeight - 20) {
        const pages = Math.ceil(finalHeight / (pdfHeight - 20));
        const pageHeight = pdfHeight - 20;

        for (let i = 1; i < pages; i++) {
          pdf.addPage();
          const sourceY = i * pageHeight * (imgHeight / finalHeight);
          const sourceHeight = Math.min(
            pageHeight * (imgHeight / finalHeight),
            imgHeight - sourceY
          );

          pdf.addImage(
            imgData,
            "PNG",
            x,
            10,
            finalWidth,
            sourceHeight * (finalWidth / imgWidth),
            0,
            sourceY,
            imgWidth,
            sourceHeight
          );
        }
      }

      pdf.save(`ticket-${ticket.numero_ticket}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert(`Error al generar el PDF: ${error.message}`);
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
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden">
          <DialogHeader className="flex-shrink-0">
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

          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
            <div
              id="ticket-invoice-content"
              className="bg-white p-8 w-full"
            >
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
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Información del Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-600">
                          Número:
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-sm w-fit"
                        >
                          {ticket.numero_ticket}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-600">
                          Fecha de Salida:
                        </span>
                        <span className="text-sm">
                          {formatDate(ticket.fecha_salida)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-600">
                          Fecha Estimada Devolución:
                        </span>
                        <span className="text-sm">
                          {formatDate(ticket.fecha_estimada_devolucion)}
                        </span>
                      </div>
                      {ticket.orden_numero && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-600">
                            Orden Número:
                          </span>
                          <span className="text-sm font-mono">
                            {ticket.orden_numero}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      Información del Elemento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {ticket.elemento && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-600">
                            Elemento:
                          </span>
                          <span className="text-sm break-words">
                            {ticket.elemento}
                          </span>
                        </div>
                      )}
                      {ticket.serie && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-600">
                            Serie:
                          </span>
                          <span className="text-sm font-mono break-all">
                            {ticket.serie}
                          </span>
                        </div>
                      )}
                      {ticket.marca_modelo && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-600">
                            Marca/Modelo:
                          </span>
                          <span className="text-sm break-words">
                            {ticket.marca_modelo}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-600">
                          Cantidad:
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-sm w-fit"
                        >
                          {ticket.cantidad}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

               {/* Dependencies and Signatures */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <Card className="border-l-4 border-l-orange-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-orange-600">📤</span>
                      Dependencia de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-600">
                        Dependencia:
                      </span>
                      <p className="text-gray-700 text-sm mt-1 break-words">
                        {ticket.dependencia_entrega || "No especificado"}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-600">
                        Firma del Funcionario:
                      </span>
                      <div className="mt-2">
                        <SignatureDisplay
                          signatureUrl={ticket.firma_funcionario_entrega}
                          label="Ver Firma"
                          className="text-xs"
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
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-600">
                        Dependencia:
                      </span>
                      <p className="text-gray-700 text-sm mt-1 break-words">
                        {ticket.dependencia_recibe || "No especificado"}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-600">
                        Firma del Funcionario:
                      </span>
                      <div className="mt-2">
                        <SignatureDisplay
                          signatureUrl={ticket.firma_funcionario_recibe}
                          label="Ver Firma"
                          className="text-xs"
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
                    <CardTitle className="text-lg">
                      Motivo del Préstamo
                    </CardTitle>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
