"use server";

import {
  getInventarioReporteData,
  getMovimientosReporteData,
  getPrestamosActivosReporteData,
  getCategoriasReporteData,
  getObservacionesReporteData,
  getTicketsReporteData,
  getReporteStats
} from "./services";

type InventarioFilters = {
  ubicacionId?: number;
  categoriaId?: number;
  fechaEntradaInicio?: Date;
  fechaEntradaFin?: Date;
};

export async function actionGetInventarioReporteData(filters?: InventarioFilters) {
  return await getInventarioReporteData(filters);
}

export async function actionGetMovimientosReporteData(fechaInicio?: Date, fechaFin?: Date, ubicacionId?: number) {
  return await getMovimientosReporteData(fechaInicio, fechaFin, ubicacionId);
}

export async function actionGetPrestamosActivosReporteData(ubicacionId?: number) {
  return await getPrestamosActivosReporteData(ubicacionId);
}

export async function actionGetCategoriasReporteData(categoriaId?: number) {
  return await getCategoriasReporteData(categoriaId);
}

export async function actionGetObservacionesReporteData(fechaInicio?: Date, fechaFin?: Date, categoriaId?: number) {
  return await getObservacionesReporteData(fechaInicio, fechaFin, categoriaId);
}

export async function actionGetTicketsReporteData(fechaInicio?: Date, fechaFin?: Date, ubicacionId?: number) {
  return await getTicketsReporteData(fechaInicio, fechaFin, ubicacionId);
}

export async function actionGetReporteStats() {
  return await getReporteStats();
}