import type { PrismaClient } from "@prisma/client";

export const configuracionFrecuenciasSeed = [
  {
    codigo: "DIARIO",
    nombre: "Diario",
    dias_intervalo: 1,
    descripcion: "Mantenimiento que se realiza diariamente",
  },
  {
    codigo: "SEMANAL",
    nombre: "Semanal",
    dias_intervalo: 7,
    descripcion: "Mantenimiento que se realiza semanalmente",
  },
  {
    codigo: "MENSUAL",
    nombre: "Mensual",
    dias_intervalo: 30,
    descripcion: "Mantenimiento que se realiza mensualmente",
  },
  {
    codigo: "TRIMESTRAL",
    nombre: "Trimestral",
    dias_intervalo: 90,
    descripcion: "Mantenimiento que se realiza cada tres meses",
  },
  {
    codigo: "SEMESTRAL",
    nombre: "Semestral",
    dias_intervalo: 180,
    descripcion: "Mantenimiento que se realiza cada seis meses",
  },
  {
    codigo: "ANUAL",
    nombre: "Anual",
    dias_intervalo: 365,
    descripcion: "Mantenimiento que se realiza anualmente",
  },
];

export async function seedConfiguracionFrecuencias(prisma: PrismaClient) {
  console.log("🌱 Sembrando configuración de frecuencias...");
  
  for (const frecuencia of configuracionFrecuenciasSeed) {
    await prisma.configuracion_frecuencias.upsert({
      where: { codigo: frecuencia.codigo },
      update: {
        nombre: frecuencia.nombre,
        dias_intervalo: frecuencia.dias_intervalo,
        descripcion: frecuencia.descripcion,
      },
      create: {
        codigo: frecuencia.codigo,
        nombre: frecuencia.nombre,
        dias_intervalo: frecuencia.dias_intervalo,
        descripcion: frecuencia.descripcion,
      },
    });
  }
  
  console.log(`✅ ${configuracionFrecuenciasSeed.length} frecuencias sembradas correctamente`);
}

