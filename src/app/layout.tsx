import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "driver.js/dist/driver.css";
import { Providers } from "../components/providers";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
