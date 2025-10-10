"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { FileText, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { SignatureDisplay } from "../ui/signature-display";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CDSLogo } from "../ui/cds-logo";

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Crear una versión simplificada del contenido para PDF
      const simplifiedElement = invoiceElement.cloneNode(true) as HTMLElement;

      // Limpiar completamente todos los estilos problemáticos
      const cleanElementStyles = (element: HTMLElement) => {
        // Remover todos los estilos inline
        element.removeAttribute("style");

        // Remover clases que puedan causar problemas
        const classList = element.classList;
        if (classList) {
          // Mantener solo clases básicas necesarias
          const allowedClasses = [
            "text-sm",
            "font-medium",
            "font-mono",
            "break-words",
            "break-all",
          ];
          const classesToRemove = [];

          for (let i = 0; i < classList.length; i++) {
            const className = classList[i];
            if (!allowedClasses.includes(className)) {
              classesToRemove.push(className);
            }
          }

          classesToRemove.forEach((cls) => classList.remove(cls));
        }

        // Aplicar estilos básicos seguros
        if (element.tagName === "H1") {
          element.style.cssText =
            "font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;";
        } else if (element.tagName === "H2") {
          element.style.cssText =
            "font-size: 18px; font-weight: 600; color: #4b5563; margin: 0 0 16px 0;";
        } else if (element.tagName === "P") {
          element.style.cssText = "color: #374151; margin: 4px 0;";
        } else if (element.tagName === "SPAN") {
          element.style.cssText = "color: #4b5563;";
        } else if (element.classList.contains("font-medium")) {
          element.style.cssText = "font-weight: 500; color: #4b5563;";
        } else if (element.classList.contains("font-mono")) {
          element.style.cssText = "font-family: monospace; color: #374151;";
        } else {
          element.style.cssText = "color: #000000;";
        }

        // Procesar elementos hijos
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
          cleanElementStyles(children[i] as HTMLElement);
        }
      };

      cleanElementStyles(simplifiedElement);

      // Agregar estilos CSS seguros
      const safeStyles = document.createElement("style");
      safeStyles.textContent = `
        * {
          color: #000000 !important;
          background-color: transparent !important;
        }
        .bg-white {
          background-color: #ffffff !important;
        }
        .border-l-4 {
          border-left: 4px solid #e5e7eb !important;
        }
        .border-t {
          border-top: 1px solid #e5e7eb !important;
        }
        .p-8 {
          padding: 32px !important;
        }
        .p-6 {
          padding: 24px !important;
        }
        .mb-8 {
          margin-bottom: 32px !important;
        }
        .space-y-4 > * + * {
          margin-top: 16px !important;
        }
        .space-y-3 > * + * {
          margin-top: 12px !important;
        }
        .grid {
          display: grid !important;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .gap-8 {
          gap: 32px !important;
        }
        .gap-6 {
          gap: 24px !important;
        }
        .gap-4 {
          gap: 16px !important;
        }
        .flex {
          display: flex !important;
        }
        .flex-col {
          flex-direction: column !important;
        }
        .items-center {
          align-items: center !important;
        }
        .justify-between {
          justify-content: space-between !important;
        }
        .text-center {
          text-align: center !important;
        }
        .rounded {
          border-radius: 4px !important;
        }
        .border {
          border: 1px solid #e5e7eb !important;
        }
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        h1 { font-size: 24px; font-weight: bold; color: #1f2937; }
        h2 { font-size: 18px; font-weight: 600; color: #4b5563; }
        h3 { font-size: 16px; font-weight: 600; color: #374151; }
        p { color: #374151; margin: 4px 0; }
        .font-medium { font-weight: 500; }
        .font-mono { font-family: monospace; }
        .text-sm { font-size: 14px; }
        .break-words { word-break: break-word; }
        .break-all { word-break: break-all; }
      `;
      simplifiedElement.appendChild(safeStyles);

      // Configuración ultra conservadora para html2canvas
      const canvas = await html2canvas(simplifiedElement, {
        scale: 1,
        useCORS: false,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Asegurar que no hay estilos problemáticos
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            const element = el as HTMLElement;
            if (element.style) {
              // Forzar colores básicos
              element.style.color = element.style.color || "#000000";
              element.style.backgroundColor =
                element.style.backgroundColor || "transparent";
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png", 0.9);
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
            sourceHeight * (finalWidth / imgWidth)
          );
        }
      }

      pdf.save(`ticket-${ticket.numero_ticket}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);

      // Intentar método alternativo simple
      try {
        console.log("Intentando método alternativo...");

        const pdf = new jsPDF("p", "mm", "a4");
        let y = 20;

        // Logo CDS (simulado con texto)
        pdf.setFontSize(16);
        pdf.setTextColor(66, 139, 202);
        pdf.setFont("helvetica", "bold");
        pdf.text("CDS", 105, y, { align: "center" });
        y += 8;

        // Título
        pdf.setFontSize(20);
        pdf.setTextColor(0, 0, 0);
        pdf.text("SISTEMA DE INVENTARIO CDS", 105, y, { align: "center" });
        y += 10;

        pdf.setFontSize(16);
        pdf.text("COMPROBANTE DE PRÉSTAMO", 105, y, { align: "center" });
        y += 20;

        // Información del ticket
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("INFORMACIÓN DEL TICKET", 20, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.text(`Número: ${ticket.numero_ticket}`, 20, y);
        y += 7;
        pdf.text(`Fecha de Salida: ${formatDate(ticket.fecha_salida)}`, 20, y);
        y += 7;
        pdf.text(
          `Fecha Estimada Devolución: ${formatDate(
            ticket.fecha_estimada_devolucion
          )}`,
          20,
          y
        );
        y += 7;
        if (ticket.orden_numero) {
          pdf.text(`Orden Número: ${ticket.orden_numero}`, 20, y);
          y += 7;
        }
        y += 10;

        // Información del elemento
        pdf.setFont("helvetica", "bold");
        pdf.text("INFORMACIÓN DEL ELEMENTO", 20, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        if (ticket.elemento) {
          pdf.text(`Elemento: ${ticket.elemento}`, 20, y);
          y += 7;
        }
        if (ticket.serie) {
          pdf.text(`Serie: ${ticket.serie}`, 20, y);
          y += 7;
        }
        if (ticket.marca_modelo) {
          pdf.text(`Marca/Modelo: ${ticket.marca_modelo}`, 20, y);
          y += 7;
        }
        pdf.text(`Cantidad: ${ticket.cantidad}`, 20, y);
        y += 15;

        // Dependencias
        pdf.setFont("helvetica", "bold");
        pdf.text("DEPENDENCIAS", 20, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Dependencia de Entrega: ${
            ticket.dependencia_entrega || "No especificado"
          }`,
          20,
          y
        );
        y += 7;
        pdf.text(
          `Dependencia que Recibe: ${
            ticket.dependencia_recibe || "No especificado"
          }`,
          20,
          y
        );
        y += 15;

        // Motivo
        if (ticket.motivo) {
          pdf.setFont("helvetica", "bold");
          pdf.text("MOTIVO DEL PRÉSTAMO", 20, y);
          y += 10;

          pdf.setFont("helvetica", "normal");
          const motivoLines = pdf.splitTextToSize(ticket.motivo, 170);
          pdf.text(motivoLines, 20, y);
          y += motivoLines.length * 7;
        }

        // Footer
        y += 20;
        pdf.setFontSize(10);
        pdf.text(`Fecha de Generación: ${formatDate(new Date())}`, 20, y);
        if (ticket.usuario_guardado) {
          pdf.text(`Generado por: ${ticket.usuario_guardado}`, 20, y + 7);
        }

        pdf.text("Sistema de Inventario CDS", 170, y, { align: "right" });
        pdf.text("Comprobante de Préstamo", 170, y + 7, { align: "right" });

        pdf.save(`ticket-${ticket.numero_ticket}.pdf`);
      } catch (fallbackError) {
        console.error("Error en método alternativo:", fallbackError);
        alert(
          "Error al generar el PDF. Por favor, intenta de nuevo o contacta al administrador."
        );
      }
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
            <DialogTitle className="flex items-center justify-around">
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
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
            <div id="ticket-invoice-content" className="bg-white p-8 w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <CDSLogo size="xl" showText={false} />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      SISTEMA DE INVENTARIO CDS
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-600">
                      COMPROBANTE DE PRÉSTAMO
                    </h2>
                  </div>
                </div>
                <div className="w-32 h-1 bg-blue-600 mx-auto mt-4"></div>
              </div>

              {/* Ticket Info */}
              <div className="flex flex-col gap-8 mb-8">
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Información del Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <CardContent className="space-y-4">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  </CardContent>
                </Card>

                {/* Dependencies and Signatures */}
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
                      <div className="mt-2 flex justify-start">
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
                      <div className="mt-2 flex justify-start">
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
