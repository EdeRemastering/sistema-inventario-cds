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
import { toast } from "sonner";

/**
 * Función auxiliar para cargar la imagen del logo CDS
 */
async function loadCDSLogo(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Redimensionar la imagen con calidad máxima (sin comprimir)
      const maxWidth = 100;
      const maxHeight = 100;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      if (ctx) {
        // Mejorar la calidad del renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png", 1.0)); // Máxima calidad PNG
      } else {
        reject(new Error("No se pudo crear el contexto del canvas"));
      }
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen del logo"));
    img.src = "/cds-logo.png";
  });
}

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Crear una versión simplificada del contenido para PDF
      const simplifiedElement = invoiceElement.cloneNode(true) as HTMLElement;

      // Remover elementos problemáticos que pueden causar el error del iframe
      const problematicElements = simplifiedElement.querySelectorAll(
        "iframe, embed, object, video, audio, canvas, svg, script, style"
      );
      problematicElements.forEach((el) => el.remove());

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
        imageTimeout: 10000,
        ignoreElements: (element) => {
          // Ignorar elementos que pueden causar problemas
          const tagName = element.tagName?.toLowerCase();
          const problematicTags = [
            "iframe",
            "embed",
            "object",
            "video",
            "audio",
            "canvas",
            "svg",
            "script",
            "style",
          ];
          return problematicTags.includes(tagName);
        },
        onclone: (clonedDoc) => {
          try {
            // Remover elementos problemáticos del documento clonado
            const problematicElements = clonedDoc.querySelectorAll(
              "iframe, embed, object, video, audio, canvas, svg, script, style"
            );
            problematicElements.forEach((el) => el.remove());

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
          } catch (cloneError) {
            console.warn("Error en onclone:", cloneError);
          }
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
      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error("Error generando PDF:", error);

      // Intentar método alternativo simple sin mostrar error al usuario aún
      try {
        console.log("Intentando método alternativo...");

        const pdf = new jsPDF("p", "mm", "a4");
        let y = 20;

        // Marco unificado para todo el documento
        pdf.setDrawColor(0, 0, 0); // Negro
        pdf.setLineWidth(0.3);

        // Calcular la altura total del documento
        let totalHeight = 40; // Header
        totalHeight += 45; // Info ticket
        totalHeight += 15; // Espacio
        totalHeight += 50; // Info elemento
        totalHeight += 15; // Espacio
        totalHeight += 40; // Dependencias
        totalHeight += 15; // Espacio
        if (ticket.motivo) {
          totalHeight += 35; // Motivo
          totalHeight += 10; // Espacio
        }
        totalHeight += 20; // Footer
        totalHeight += 20; // Espacio final

        // Dibujar el marco unificado
        pdf.rect(15, 10, 180, totalHeight, "S");

        // Logo CDS (imagen real)
        try {
          const logoDataUrl = await loadCDSLogo();
          pdf.addImage(logoDataUrl, "PNG", 20, 18, 25, 25);
        } catch (error) {
          console.warn(
            "No se pudo cargar el logo, usando texto como fallback:",
            error
          );
          // Fallback a texto si no se puede cargar la imagen
          pdf.setFontSize(28);
          pdf.setTextColor(0, 0, 0); // Negro
          pdf.setFont("helvetica", "bold");
          pdf.text("CDS", 25, 28);
        }

        // Título principal (alineado verticalmente con el centro del logo)
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text("SISTEMA DE INVENTARIO", 70, 25);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text("COMPROBANTE DE PRÉSTAMO", 70, 32);

        // Número de ticket debajo del título (alineado verticalmente)
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Ticket: ${ticket.numero_ticket}`, 70, 39);

        y = 55;

        // Información del ticket - sin borde individual (marco unificado)
        // Línea separadora horizontal
        pdf.setLineWidth(0.15);
        pdf.line(20, y - 5, 185, y - 5);

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0); // Negro
        pdf.text("INFORMACIÓN DEL TICKET", 20, y);

        // Línea separadora debajo del título
        pdf.setLineWidth(0.15);
        pdf.line(20, y + 2, 185, y + 2);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        // Fecha de salida
        pdf.text(`Fecha de Salida:`, 20, y);
        pdf.text(`${formatDate(ticket.fecha_salida)}`, 65, y);
        y += 6;

        // Fecha de devolución debajo de la fecha de salida
        pdf.text(`Fecha Est. Devolución:`, 20, y);
        pdf.text(`${formatDate(ticket.fecha_estimada_devolucion)}`, 65, y);
        y += 6;

        if (ticket.orden_numero) {
          pdf.text(`Orden Número:`, 20, y);
          pdf.text(`${ticket.orden_numero}`, 65, y);
          y += 6;
        }

        y += 15;

        // Información del elemento - sin borde individual (marco unificado)
        // Línea separadora horizontal
        pdf.setLineWidth(0.15);
        pdf.line(20, y - 5, 185, y - 5);

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0); // Negro
        pdf.text("INFORMACIÓN DEL ELEMENTO", 20, y);

        // Línea separadora debajo del título
        pdf.setLineWidth(0.15);
        pdf.line(20, y + 2, 185, y + 2);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        if (ticket.elemento) {
          pdf.text(`Elemento:`, 20, y);
          pdf.text(`${ticket.elemento}`, 65, y);
          y += 6;
        }

        if (ticket.serie) {
          pdf.text(`Serie:`, 20, y);
          pdf.text(`${ticket.serie}`, 65, y);
        }

        if (ticket.marca_modelo) {
          pdf.text(`Marca/Modelo:`, 110, y);
          pdf.text(`${ticket.marca_modelo}`, 155, y);
        }
        y += 6;

        pdf.text(`Cantidad:`, 20, y);
        pdf.text(`${ticket.cantidad}`, 65, y);

        y += 15;

        // Dependencias - sin borde individual (marco unificado)
        // Línea separadora horizontal
        pdf.setLineWidth(0.15);
        pdf.line(20, y - 5, 185, y - 5);

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0); // Negro
        pdf.text("DEPENDENCIAS", 20, y);

        // Línea separadora debajo del título
        pdf.setLineWidth(0.15);
        pdf.line(20, y + 2, 185, y + 2);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        pdf.text(`Dependencia de Entrega:`, 20, y);
        pdf.text(
          `${ticket.dependencia_entrega || "No especificado"}`,
          20,
          y + 6
        );
        y += 12;

        pdf.text(`Dependencia que Recibe:`, 20, y);
        pdf.text(
          `${ticket.dependencia_recibe || "No especificado"}`,
          20,
          y + 6
        );
        y += 15;

        // Motivo - sin borde individual (marco unificado)
        if (ticket.motivo) {
          // Línea separadora horizontal
          pdf.setLineWidth(0.15);
          pdf.line(20, y - 5, 185, y - 5);

          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0); // Negro
          pdf.text("MOTIVO DEL PRÉSTAMO", 20, y);

          // Línea separadora debajo del título
          pdf.setLineWidth(0.5);
          pdf.line(20, y + 2, 185, y + 2);
          y += 8;

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
          const motivoLines = pdf.splitTextToSize(ticket.motivo, 170);
          pdf.text(motivoLines, 20, y);
          y += motivoLines.length * 4 + 10;
        }

        // Footer - sin borde individual (marco unificado)
        y += 10;
        // Línea separadora horizontal antes del footer
        pdf.setLineWidth(0.15);
        pdf.line(20, y - 5, 185, y - 5);

        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0); // Negro
        pdf.setFont("helvetica", "normal");

        pdf.text(`Fecha de Generación: ${formatDate(new Date())}`, 25, y + 6);
        if (ticket.usuario_guardado) {
          pdf.text(`Generado por: ${ticket.usuario_guardado}`, 25, y + 12);
        }

        pdf.setFont("helvetica", "bold");
        pdf.text("Sistema de Inventario CDS", 175, y + 6, { align: "right" });
        pdf.setFont("helvetica", "normal");
        pdf.text("Comprobante de Préstamo", 175, y + 12, { align: "right" });

        pdf.save(`ticket-${ticket.numero_ticket}.pdf`);

        // Mostrar mensaje de éxito si el método alternativo funcionó
        toast.success("PDF generado exitosamente con método alternativo");
      } catch (fallbackError) {
        console.error("Error en método alternativo:", fallbackError);

        // Solo mostrar error si ambos métodos fallan
        if (error instanceof Error) {
          if (
            error.message.includes("Unable to find element in cloned iframe")
          ) {
            toast.error(
              "Error al generar PDF: Problema con elementos del documento. El método alternativo también falló."
            );
          } else {
            toast.error(`Error al generar PDF: ${error.message}`);
          }
        } else {
          toast.error("Error desconocido al generar PDF");
        }
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
        className="text-primary hover:text-primary/80 hover:bg-primary/10"
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
              {/* Header Profesional */}
              <div className="p-6 mb-8">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <CDSLogo size="xl" showText={false} />
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-black mb-2">
                      SISTEMA DE INVENTARIO CDS
                    </h1>
                    <h2 className="text-xl font-semibold text-black">
                      COMPROBANTE DE PRÉSTAMO
                    </h2>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-center font-bold text-lg">
                    Ticket: {ticket.numero_ticket}
                  </p>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="flex flex-col gap-8 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-black">
                      <FileText className="h-5 w-5 text-black" />
                      INFORMACIÓN DEL TICKET
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
                    <div className="flex flex-col gap-4">
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

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-black">
                      <Eye className="h-5 w-5 text-black" />
                      INFORMACIÓN DEL ELEMENTO
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-black">
                      <span className="text-black">📤</span>
                      DEPENDENCIA DE ENTREGA
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

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-black">
                      <span className="text-black">📥</span>
                      DEPENDENCIA QUE RECIBE
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
                    <CardTitle className="text-lg text-black">
                      MOTIVO DEL PRÉSTAMO
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
              <div className="p-4 mt-8">
                <div className="grid grid-cols-2 gap-8 text-sm text-black">
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
