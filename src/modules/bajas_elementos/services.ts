import { prisma } from "../../lib/prisma";
import type { BajaElemento, CreateBajaElementoInput } from "./types";

export function listBajasElementos(): Promise<BajaElemento[]> {
  return prisma.bajas_elementos.findMany({
    include: {
      elemento: { select: { id: true, serie: true, marca: true, modelo: true, codigo_equipo: true } },
      autorizador: { select: { id: true, nombre: true, apellido: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: { fecha_baja: "desc" },
  }) as Promise<BajaElemento[]>;
}

export function getBajaByElementoId(elemento_id: number) {
  return prisma.bajas_elementos.findUnique({
    where: { elemento_id },
    include: {
      elemento: { select: { id: true, serie: true, marca: true, modelo: true } },
      autorizador: { select: { id: true, nombre: true, apellido: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
    },
  });
}

export async function createBajaElemento(data: CreateBajaElementoInput): Promise<BajaElemento> {
  const baja = await prisma.bajas_elementos.create({
    data: {
      elemento_id: data.elemento_id,
      fecha_baja: data.fecha_baja,
      motivo: data.motivo,
      evidencia_pdf_url: data.evidencia_pdf_url,
      autorizado_por_id: data.autorizado_por_id,
      creado_por_id: data.creado_por_id,
    },
    include: {
      elemento: { select: { id: true, serie: true, marca: true, modelo: true, codigo_equipo: true } },
      autorizador: { select: { id: true, nombre: true, apellido: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
    },
  });
  await prisma.elementos.update({
    where: { id: data.elemento_id },
    data: { activo: false },
  });
  return baja as BajaElemento;
}

export function getUsuariosAutorizadores() {
  return prisma.usuarios.findMany({
    where: { rol: { in: ["autorizador", "administrador"] }, activo: true },
    select: { id: true, nombre: true, apellido: true },
  });
}
