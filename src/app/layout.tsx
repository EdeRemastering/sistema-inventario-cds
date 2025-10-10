import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/providers";
import { poppins, inter } from "../lib/fonts";

export const metadata: Metadata = {
  title: "Sistema de Inventario CDs",
  description: "Sistema de gestión de inventario para CDs",
  icons: {
    icon: "/cds-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
