"use client";

import { useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { QrCode, Download, Printer, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

type Elemento = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  ubicacion: string | null;
  estado_funcional: string;
  estado_fisico: string;
  categoria: { nombre: string };
  subcategoria: { nombre: string } | null;
};

type Props = {
  elemento: Elemento;
};

export function ElementoQRGenerator({ elemento }: Props) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generateQRCode = async () => {
    setGenerating(true);

    try {
      // Crear datos del elemento para el QR
      const qrData = {
        id: elemento.id,
        serie: elemento.serie,
        marca: elemento.marca,
        modelo: elemento.modelo,
        categoria: elemento.categoria.nombre,
        subcategoria: elemento.subcategoria?.nombre,
        timestamp: new Date().toISOString(),
        type: "elemento",
      };

      // Generar QR Code
      const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataURL(qrDataURL);
      setShowQR(true);
      toast.success("Código QR generado exitosamente");
    } catch (error) {
      console.error("Error generando QR:", error);
      toast.error("Error al generar el código QR");
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement("a");
    link.href = qrCodeDataURL;
    link.download = `QR_${elemento.serie}_${
      new Date().toISOString().split("T")[0]
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Código QR descargado");
  };

  const printQRCode = () => {
    if (!qrCodeDataURL) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Código QR - ${elemento.serie}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .qr-info {
              margin-top: 20px;
              font-size: 14px;
            }
            .qr-info h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .qr-info p {
              margin: 5px 0;
              color: #666;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeDataURL}" alt="Código QR" />
            <div class="qr-info">
              <h3>Código QR del Elemento</h3>
              <p><strong>Serie:</strong> ${elemento.serie}</p>
              <p><strong>Marca:</strong> ${elemento.marca || "N/A"}</p>
              <p><strong>Modelo:</strong> ${elemento.modelo || "N/A"}</p>
              <p><strong>Categoría:</strong> ${elemento.categoria.nombre}</p>
              <p><strong>Ubicación:</strong> ${elemento.ubicacion || "N/A"}</p>
              <p><strong>Generado:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();

    toast.success("Vista previa de impresión abierta");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Código QR del Elemento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información del elemento */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Serie:</span>
            <Badge variant="outline">{elemento.serie}</Badge>
          </div>
          <div>
            <span className="font-medium">Elemento:</span> {elemento.marca}{" "}
            {elemento.modelo}
          </div>
          <div>
            <span className="font-medium">Categoría:</span>{" "}
            {elemento.categoria.nombre}
          </div>
          {elemento.subcategoria && (
            <div>
              <span className="font-medium">Subcategoría:</span>{" "}
              {elemento.subcategoria.nombre}
            </div>
          )}
        </div>

        {/* Botón para generar QR */}
        {!showQR && (
          <Button
            onClick={generateQRCode}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              "Generando QR..."
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generar Código QR
              </>
            )}
          </Button>
        )}

        {/* Código QR generado */}
        {showQR && qrCodeDataURL && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="border-2 border-gray-300 p-4 rounded-lg bg-white">
                <Image
                  src={qrCodeDataURL}
                  alt="Código QR del elemento"
                  width={200}
                  height={200}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                onClick={printQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>

            <Button
              onClick={() => setShowQR(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ocultar QR
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
          <p>
            <strong>Nota:</strong> Este código QR contiene información del
            elemento y puede ser escaneado para acceso rápido a los detalles del
            mismo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
